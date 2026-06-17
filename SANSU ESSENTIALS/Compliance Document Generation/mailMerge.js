// ============================================================================
// MAIL MERGE — Autocrat Replacement
// ============================================================================
// Replaces <<tags>> in Google Docs, Sheets, or Slides templates with data
// from a source spreadsheet. Drop-in replacement for Autocrat.
//
// Modes:
//   ONE_PER_ROW — one output file per data row
//   COMBINED    — all rows merged into a single output file
//                   Docs   → page break between rows
//                   Sheets → one tab per row  ("Name / Employee Code")
//                   Slides → template slides appended per row
//
// Tag resolution order (per row):
//   1. tagMap     — explicit overrides:  { '<<DOJ>>': 'Date of Joining' }
//   2. auto-match — <<Column Header>>    matched case-insensitively
//   3. staticTags — computed overrides:  { '<<MONTH>>': 'May-26' }
//
// Image handling (handleImages: true):
//   Docs   → fetches URL, inserts inline image, clears placeholder paragraph
//   Sheets → writes =IMAGE("url") formula into the cell
//   Slides → fetches URL, inserts at placeholder shape's bounding box, removes shape
//
// Library identifier : Documents
// Usage              : Documents.generateMailMerge(config)
// Dependencies       : SharedUtils library (findHeaderRow)
//                      createMonthFolderStructure() from employeeDetails.js
// ============================================================================

const MM_MIME = {
  DOCS:   'application/vnd.google-apps.document',
  SHEETS: 'application/vnd.google-apps.spreadsheet',
  SLIDES: 'application/vnd.google-apps.presentation'
};

// ============================================================================
// ENTRY POINT
// ============================================================================

/**
 * Main entry point. Called from site scripts as Documents.generateMailMerge(config).
 *
 * @param {Object}      config
 * @param {string}      config.sourceSheetId
 * @param {string|null} config.sourceTabName      null → first sheet
 * @param {string}      config.templateId         Google Doc, Sheet, or Slides ID
 * @param {string}      config.outputMode         'ONE_PER_ROW' | 'COMBINED'
 * @param {string}      config.outputFileName     Supports <<tags>> e.g. "Card - <<Name>>"
 * @param {string|null} config.outputFolderId     Flat folder. Used when siteFolderName is null.
 * @param {string|null} config.siteFolderName     Month-hierarchy folder. Takes precedence.
 * @param {number|null} config.dates              0 = previous month, 1 = current month
 * @param {Object|null} config.rowFilter          { column, condition: 'notEmpty'|'empty'|{equals:''} }
 * @param {Object|null} config.tagMap             Explicit overrides: { '<<DOJ>>': 'Date of Joining' }
 * @param {Object|null} config.staticTags         Computed values:    { '<<MONTH>>': 'May-26' }
 * @param {boolean}     config.handleImages       Default false
 * @param {string[]}    config.imageColumns       Column headers whose values are Drive URLs
 */
function generateMailMerge(config) {
  const {
    sourceSheetId,
    sourceTabName  = null,
    templateId,
    outputMode,
    outputFileName,
    outputFolderId = null,
    siteFolderName = null,
    dates          = null,
    rowFilter      = null,
    tagMap         = null,
    staticTags     = null,
    handleImages   = false,
    imageColumns   = []
  } = config;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!sourceSheetId) throw new Error('generateMailMerge: sourceSheetId is required');
  if (!templateId)    throw new Error('generateMailMerge: templateId is required');
  if (!outputFileName) throw new Error('generateMailMerge: outputFileName is required');
  if (!outputMode || !['ONE_PER_ROW', 'COMBINED'].includes(outputMode))
    throw new Error('generateMailMerge: outputMode must be ONE_PER_ROW or COMBINED');
  if (!outputFolderId && !siteFolderName)
    throw new Error('generateMailMerge: provide either outputFolderId or siteFolderName');

  const startTime = Date.now();
  Logger.log('=== generateMailMerge START ===');
  Logger.log(`Mode: ${outputMode} | Template: ${templateId} | Source: ${sourceSheetId}`);

  // Step 1 — Resolve output folder
  const outputFolder = _mm_resolveOutputFolder(siteFolderName, dates, outputFolderId);
  Logger.log(`Output folder: "${outputFolder.getName()}"`);

  // Step 2 — Detect template type
  const mimeType = DriveApp.getFileById(templateId).getMimeType();
  Logger.log(`Template type: ${mimeType}`);
  if (![MM_MIME.DOCS, MM_MIME.SHEETS, MM_MIME.SLIDES].includes(mimeType))
    throw new Error(`generateMailMerge: unsupported template type "${mimeType}"`);

  // Step 3 — Load source data (single getValues() batch)
  const { headers, dataRows } = _mm_loadSourceData(sourceSheetId, sourceTabName);
  Logger.log(`Source rows loaded: ${dataRows.length}`);

  // Step 4 — Apply row filter
  const filteredRows = rowFilter
    ? _mm_applyRowFilter(dataRows, headers, rowFilter)
    : dataRows;
  Logger.log(`Rows after filter: ${filteredRows.length}`);

  if (filteredRows.length === 0) {
    Logger.log('No rows to process. Exiting.');
    return;
  }

  // Step 5 — Build imageTagSet once (constant across all rows)
  // Empty set when handleImages is false → image tags treated as plain text
  const imageTagSet = handleImages
    ? _mm_buildImageTagSet(imageColumns, tagMap)
    : new Set();

  // Step 6 — Execute merge
  let filesGenerated = 0;

  if (outputMode === 'ONE_PER_ROW') {

    filteredRows.forEach((row, i) => {
      Logger.log(`ONE_PER_ROW: row ${i + 1} / ${filteredRows.length}`);
      const mergeMap     = _mm_buildMergeMap(row, headers, tagMap, staticTags);
      const resolvedName = _mm_resolveFileName(outputFileName, mergeMap);

      _mm_trashExisting(outputFolder, resolvedName);

      const newFileId = DriveApp.getFileById(templateId)
                                .makeCopy(resolvedName, outputFolder)
                                .getId();

      _mm_mergeFile(newFileId, mimeType, mergeMap, imageTagSet);
      Logger.log(`Created: "${resolvedName}"`);
      filesGenerated++;
    });

  } else {
    // COMBINED
    _mm_runCombined(
      filteredRows, headers, templateId, mimeType,
      outputFileName, outputFolder, tagMap, staticTags, imageTagSet
    );
    filesGenerated = 1;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  Logger.log(`=== generateMailMerge DONE: ${filesGenerated} file(s) in ${elapsed}s ===`);
}


// ============================================================================
// COMBINED MODE ORCHESTRATOR
// ============================================================================

function _mm_runCombined(
  filteredRows, headers, templateId, mimeType,
  outputFileName, outputFolder, tagMap, staticTags, imageTagSet
) {
  // Resolve output file name from first row + staticTags
  const firstMergeMap = _mm_buildMergeMap(filteredRows[0], headers, tagMap, staticTags);
  const resolvedName  = _mm_resolveFileName(outputFileName, firstMergeMap);

  _mm_trashExisting(outputFolder, resolvedName);
  Logger.log(`COMBINED output file: "${resolvedName}"`);

  if (mimeType === MM_MIME.DOCS) {
    _mm_combinedDocs(
      filteredRows, headers, templateId, resolvedName, outputFolder,
      tagMap, staticTags, imageTagSet
    );
  } else if (mimeType === MM_MIME.SHEETS) {
    _mm_combinedSheets(
      filteredRows, headers, templateId, resolvedName, outputFolder,
      tagMap, staticTags, imageTagSet
    );
  } else if (mimeType === MM_MIME.SLIDES) {
    _mm_combinedSlides(
      filteredRows, headers, templateId, resolvedName, outputFolder,
      tagMap, staticTags, imageTagSet
    );
  }
}


// ============================================================================
// COMBINED — GOOGLE DOCS
// Row 1   → merged directly into a template copy (becomes the output file)
// Rows 2–N → each merged into a temp copy; body appended to output; temp trashed
// ============================================================================

function _mm_combinedDocs(
  filteredRows, headers, templateId, resolvedName, outputFolder,
  tagMap, staticTags, imageTagSet
) {
  const outputId = DriveApp.getFileById(templateId)
                            .makeCopy(resolvedName, outputFolder)
                            .getId();

  // Row 1 — merge into the output file directly
  _mm_mergeDocs(
    outputId,
    _mm_buildMergeMap(filteredRows[0], headers, tagMap, staticTags),
    imageTagSet
  );

  // Rows 2–N — merge into temp, append body, trash temp
  for (let i = 1; i < filteredRows.length; i++) {
    Logger.log(`COMBINED Docs: appending row ${i + 1} / ${filteredRows.length}`);
    const mergeMap = _mm_buildMergeMap(filteredRows[i], headers, tagMap, staticTags);
    const tempId   = DriveApp.getFileById(templateId)
                              .makeCopy('_mm_temp_', outputFolder)
                              .getId();
    try {
      _mm_mergeDocs(tempId, mergeMap, imageTagSet);
      _mm_appendDocBlock(outputId, tempId);
    } finally {
      DriveApp.getFileById(tempId).setTrashed(true);
    }
  }

  Logger.log('COMBINED Docs complete.');
}

/**
 * Appends the body of sourceDocId to targetDocId, preceded by a page break.
 * Uses element.copy() to preserve paragraph, table, and list item formatting.
 */
function _mm_appendDocBlock(targetDocId, sourceDocId) {
  const targetDoc  = DocumentApp.openById(targetDocId);
  const sourceDoc  = DocumentApp.openById(sourceDocId);
  const targetBody = targetDoc.getBody();
  const sourceBody = sourceDoc.getBody();

  targetBody.appendPageBreak();

  // GAS always appends a trailing empty paragraph to every document body.
  // Skip it (limit = numChildren - 1) to avoid a spurious blank line between blocks.
  const limit = Math.max(0, sourceBody.getNumChildren() - 1);

  for (let i = 0; i < limit; i++) {
    const child = sourceBody.getChild(i);
    const type  = child.getType();
    try {
      switch (type) {
        case DocumentApp.ElementType.PARAGRAPH:
          targetBody.appendParagraph(child.asParagraph().copy());
          break;
        case DocumentApp.ElementType.TABLE:
          targetBody.appendTable(child.asTable().copy());
          break;
        case DocumentApp.ElementType.LIST_ITEM:
          targetBody.appendListItem(child.asListItem().copy());
          break;
        case DocumentApp.ElementType.HORIZONTAL_RULE:
          targetBody.appendHorizontalRule();
          break;
        default:
          Logger.log(`_mm_appendDocBlock: skipped unsupported element type "${type}"`);
      }
    } catch (e) {
      Logger.log(`_mm_appendDocBlock: error on element ${i} (type "${type}"): ${e.message}`);
    }
  }

  targetDoc.saveAndClose();
}


// ============================================================================
// COMBINED — GOOGLE SHEETS
// One new Spreadsheet; one tab per row named "Name / Employee Code"
// Only the first sheet of the template is used as the tab template
// ============================================================================

function _mm_combinedSheets(
  filteredRows, headers, templateId, resolvedName, outputFolder,
  tagMap, staticTags, imageTagSet
) {
  const templateSS    = SpreadsheetApp.openById(templateId);
  const templateSheet = templateSS.getSheets()[0];

  const outputSS = SpreadsheetApp.create(resolvedName);
  outputSS.setSpreadsheetLocale('en_IN');
  DriveApp.getFileById(outputSS.getId()).moveTo(outputFolder);

  const defaultSheet = outputSS.getSheets()[0]; // deleted after real content is added

  filteredRows.forEach((row, i) => {
    Logger.log(`COMBINED Sheets: row ${i + 1} / ${filteredRows.length}`);
    const mergeMap = _mm_buildMergeMap(row, headers, tagMap, staticTags);
    const tabName  = _mm_resolveTabName(row, headers, i + 1);

    const copiedSheet = templateSheet.copyTo(outputSS);
    copiedSheet.setName(tabName);

    _mm_mergeSingleSheet(copiedSheet, mergeMap, imageTagSet);
  });

  // Remove the initial blank default sheet
  try {
    outputSS.deleteSheet(defaultSheet);
  } catch (e) {
    Logger.log(`Could not delete default sheet: ${e.message}`);
  }

  SpreadsheetApp.flush();
  Logger.log('COMBINED Sheets complete.');
}

/**
 * Resolves tab name. Pattern: "Name / Employee Code". Falls back to "Row N".
 */
function _mm_resolveTabName(row, headers, rowIndex) {
  const nameIdx = headers.findIndex(h =>
    String(h).trim().toLowerCase() === 'name'
  );
  const empCodeIdx = headers.findIndex(h =>
    ['employee code', 'emp code'].includes(String(h).trim().toLowerCase())
  );

  const name    = nameIdx    !== -1 ? String(row[nameIdx]).trim()    : '';
  const empCode = empCodeIdx !== -1 ? String(row[empCodeIdx]).trim() : '';

  if (name && empCode) return `${name} / ${empCode}`;
  if (name)            return name;
  if (empCode)         return empCode;
  return `Row ${rowIndex}`;
}


// ============================================================================
// COMBINED — GOOGLE SLIDES (Optimized & Fixed)
// Pass 1: Clones pristine template slides for all rows.
// Pass 2: Merges data. Prevents overwriting tags before cloning.
// ============================================================================

function _mm_combinedSlides(
  filteredRows, headers, templateId, resolvedName, outputFolder,
  tagMap, staticTags, imageTagSet
) {
  const outputId = DriveApp.getFileById(templateId)
                            .makeCopy(resolvedName, outputFolder)
                            .getId();

  const outputPres = SlidesApp.openById(outputId);
  const originalSlides = outputPres.getSlides(); 
  const imageCache = {}; 

  const rowSlideGroups = [];

  // Pass 1: Clone pristine template slides for Rows 2-N BEFORE any tags are replaced
  filteredRows.forEach((row, i) => {
    if (i === 0) {
      rowSlideGroups.push(originalSlides);
    } else {
      const appendedSlides = [];
      originalSlides.forEach(ts => appendedSlides.push(outputPres.appendSlide(ts)));
      rowSlideGroups.push(appendedSlides);
    }
  });

  // Pass 2: Process data into the generated slides
  filteredRows.forEach((row, i) => {
    Logger.log(`COMBINED Slides: processing row ${i + 1} / ${filteredRows.length}`);
    const mergeMap = _mm_buildMergeMap(row, headers, tagMap, staticTags);
    rowSlideGroups[i].forEach(slide => _mm_processSlide(slide, mergeMap, imageTagSet, imageCache));
  });

  outputPres.saveAndClose();
  Logger.log('COMBINED Slides complete.');
}


// ============================================================================
// MERGE DISPATCHER
// ============================================================================

function _mm_mergeFile(fileId, mimeType, mergeMap, imageTagSet) {
  if      (mimeType === MM_MIME.DOCS)   _mm_mergeDocs(fileId, mergeMap, imageTagSet);
  else if (mimeType === MM_MIME.SHEETS) _mm_mergeSheets(fileId, mergeMap, imageTagSet);
  else if (mimeType === MM_MIME.SLIDES) _mm_mergeSlides(fileId, mergeMap, imageTagSet);
}


// ============================================================================
// MERGE — GOOGLE DOCS
// Replaces tags in body, header, and footer.
// Image tags are skipped during text replacement and handled separately.
// ============================================================================

function _mm_mergeDocs(fileId, mergeMap, imageTagSet) {
  const doc = DocumentApp.openById(fileId);
  const sections = [doc.getBody(), doc.getHeader(), doc.getFooter()].filter(Boolean);

  for (const [tag, value] of Object.entries(mergeMap)) {
    if (imageTagSet.has(tag.toUpperCase())) continue;
    
    const str = _mm_formatValue(value);
    const searchPattern = '(?i)' + _mm_escapeRegex(tag);
    
    for (const section of sections) {
      section.replaceText(searchPattern, str);
    }
  }

  if (imageTagSet.size > 0) {
    _mm_handleDocImages(doc, mergeMap, imageTagSet);
  }

  doc.saveAndClose();
}


// ============================================================================
// MERGE — GOOGLE SHEETS
// ============================================================================

function _mm_mergeSheets(fileId, mergeMap, imageTagSet) {
  const ss = SpreadsheetApp.openById(fileId);
  ss.getSheets().forEach(sheet => _mm_mergeSingleSheet(sheet, mergeMap, imageTagSet));
  SpreadsheetApp.flush();
}

/**
 * Merges one sheet tab. Also used directly by _mm_combinedSheets.
 */
function _mm_mergeSingleSheet(sheet, mergeMap, imageTagSet) {
  // Text replacements
  Object.entries(mergeMap).forEach(([tag, value]) => {
    if (imageTagSet.has(tag.toUpperCase())) return;
    sheet.createTextFinder(tag).matchCase(false).replaceAllWith(_mm_formatValue(value));
  });

  // Image replacements — write =IMAGE("url") formula into matching cells
  imageTagSet.forEach(normTag => {
    const url = _mm_getMergeValue(mergeMap, normTag);
    if (!url) return;
    sheet.createTextFinder(normTag).matchCase(false).findAll().forEach(range => {
      range.setFormula(`=IMAGE("${url}")`);
    });
  });
}


// ============================================================================
// MERGE — GOOGLE SLIDES (ONE_PER_ROW dispatcher)
// ============================================================================

function _mm_mergeSlides(fileId, mergeMap, imageTagSet) {
  const pres = SlidesApp.openById(fileId);
  const imageCache = {}; 
  pres.getSlides().forEach(slide => _mm_processSlide(slide, mergeMap, imageTagSet, imageCache));
  pres.saveAndClose();
}


// ============================================================================
// IMAGE HANDLING — GOOGLE DOCS
// Finds paragraphs containing image tags, fetches the Drive URL, inserts the
// image at the paragraph's position, then clears the placeholder text.
// ============================================================================

function _mm_handleDocImages(doc, mergeMap, imageTagSet) {
  const body = doc.getBody();

  imageTagSet.forEach(normTag => {
    const url = _mm_getMergeValue(mergeMap, normTag);
    if (!url) {
      Logger.log(`Doc image "${normTag}": no URL in mergeMap — skipping`);
      return;
    }

    let blob;
    try {
      blob = UrlFetchApp.fetch(url).getBlob();
    } catch (e) {
      Logger.log(`Doc image "${normTag}": fetch failed for "${url}": ${e.message}`);
      return;
    }

    // findText accepts Java regex — (?i) = case-insensitive
    const pattern = '(?i)' + _mm_escapeRegex(normTag);
    const found   = body.findText(pattern);

    if (!found) {
      Logger.log(`Doc image "${normTag}": tag not found in document body`);
      return;
    }

    const para      = found.getElement().getParent();
    const paraIndex = body.getChildIndex(para);

    // Insert image before the tag paragraph, then clear the tag text.
    // After insertImage(), the paragraph shifts to paraIndex+1 — TextFinder
    // handles the search fresh so index shift does not matter here.
    body.insertImage(paraIndex, blob);
    body.createTextFinder(normTag).matchCase(false).replaceAllWith('');

    Logger.log(`Doc image "${normTag}": inserted at paragraph index ${paraIndex}`);
  });
}


// ============================================================================
// CORE SLIDE PROCESSOR (Optimized API Calls)
// ============================================================================

function _mm_processSlide(slide, mergeMap, imageTagSet, imageCache) {
  // 1. Text Replacements — Single API call per tag across the entire slide
  Object.entries(mergeMap).forEach(([tag, value]) => {
    if (imageTagSet.has(tag.toUpperCase())) return;
    try {
      // slide.replaceAllText handles all shapes and table cells natively
      slide.replaceAllText(tag, _mm_formatValue(value), false);
    } catch (e) {
      // Suppress expected errors (e.g., if a tag's formatting is split)
    }
  });

  // 2. Images
  if (imageTagSet.size > 0) {
    _mm_handleSlideImages(slide, mergeMap, imageTagSet, imageCache);
  }
}


// ============================================================================
// IMAGE HANDLING — GOOGLE SLIDES
// ============================================================================

function _mm_handleSlideImages(slide, mergeMap, imageTagSet, imageCache) {
  imageTagSet.forEach(normTag => {
    const url = _mm_getMergeValue(mergeMap, normTag);
    if (!url) return;

    const shapes = slide.getShapes();
    for (const shape of shapes) {
      if (!shape.getText) continue;
      if (!shape.getText().asString().toUpperCase().includes(normTag)) continue;

      const left = shape.getLeft(), top = shape.getTop();
      const width = shape.getWidth(), height = shape.getHeight();

      let blob;
      try {
        // Hit cache before network
        if (imageCache[url]) {
          blob = imageCache[url];
        } else {
          blob = UrlFetchApp.fetch(url).getBlob();
          imageCache[url] = blob;
        }
      } catch (e) {
        Logger.log(`Slides image "${normTag}": fetch failed: ${e.message}`);
        break; 
      }

      slide.insertImage(blob, left, top, width, height);
      shape.remove();

      break; // Proceed to next tag
    }
  });
}


// ============================================================================
// SOURCE DATA LOADING
// Single getDataRange().getValues() batch — no row-by-row reads.
// ============================================================================

function _mm_loadSourceData(sourceSheetId, sourceTabName) {
  const ss    = SpreadsheetApp.openById(sourceSheetId);
  const sheet = sourceTabName ? ss.getSheetByName(sourceTabName) : ss.getSheets()[0];

  if (!sheet) {
    throw new Error(
      `_mm_loadSourceData: tab "${sourceTabName}" not found in spreadsheet ${sourceSheetId}`
    );
  }

  const allValues = sheet.getDataRange().getDisplayValues();

  if (allValues.length < 2) {
    Logger.log('Warning: source sheet has fewer than 2 rows');
    return { headers: [], dataRows: [] };
  }

  const { headerRowIndex, headers } = SharedUtils.findHeaderRow(sheet);

  // Remove completely empty rows below header
  const dataRows = allValues
    .slice(headerRowIndex + 1)
    .filter(row => row.some(c => c !== null && c !== undefined && c !== ''));

  return { headers, dataRows };
}


// ============================================================================
// ROW FILTER
// ============================================================================

function _mm_applyRowFilter(dataRows, headers, rowFilter) {
  const { column, condition } = rowFilter;
  const colIdx = headers.findIndex(
    h => String(h).trim().toLowerCase() === column.trim().toLowerCase()
  );

  if (colIdx === -1) {
    Logger.log(`rowFilter: column "${column}" not found — skipping filter, returning all rows`);
    return dataRows;
  }

  return dataRows.filter(row => {
    const v = row[colIdx];
    if (condition === 'notEmpty')
      return v !== null && v !== undefined && v !== '' && v !== 0;
    if (condition === 'empty')
      return v === null || v === undefined || v === '' || v === 0;
    if (condition && typeof condition === 'object' && 'equals' in condition)
      return String(v).trim().toLowerCase() === String(condition.equals).trim().toLowerCase();
    return true;
  });
}


// ============================================================================
// MERGE MAP BUILDER
// ============================================================================

/**
 * Builds the complete tag → value map for one data row.
 *
 * Resolution order:
 *   1. tagMap     explicit overrides: { '<<DOJ>>': 'Date of Joining' }
 *   2. auto-match <<Column Header>> for every column in the source sheet
 *   3. staticTags always win — they are deliberate computed overrides
 *
 * @returns {Object} tag (original casing) → raw cell value (not yet formatted)
 */
function _mm_buildMergeMap(dataRow, headers, tagMap, staticTags) {
  const mergeMap = {};

  // Normalised header → index for O(1) tagMap resolution
  const headerIdxMap = {};
  headers.forEach((h, i) => {
    if (h) headerIdxMap[String(h).trim().toUpperCase()] = i;
  });

  // Step 1: Explicit tagMap
  const explicitNormTags = new Set();
  if (tagMap) {
    Object.entries(tagMap).forEach(([tag, colName]) => {
      const idx = headerIdxMap[String(colName).trim().toUpperCase()];
      if (idx === undefined) {
        Logger.log(`_mm_buildMergeMap: tagMap column "${colName}" not found — skipping "${tag}"`);
        return;
      }
      mergeMap[tag] = dataRow[idx];
      explicitNormTags.add(tag.toUpperCase());
    });
  }

  // Step 2: Auto-generate <<Header>> for every column
  // Skip any tag whose normalised form is already covered by tagMap
  headers.forEach((header, idx) => {
    if (!header) return;
    const tag = '<<' + String(header).trim() + '>>';
    if (explicitNormTags.has(tag.toUpperCase())) return;
    mergeMap[tag] = dataRow[idx];
  });

  // Step 3: staticTags overwrite (they carry computed/constant values)
  if (staticTags) Object.assign(mergeMap, staticTags);

  return mergeMap;
}


// ============================================================================
// OUTPUT FOLDER RESOLUTION
// ============================================================================

/**
 * Returns the output Drive folder.
 * siteFolderName takes precedence and produces the standard month hierarchy:
 *   SANSU AQUATEK → siteFolderName → YYYY → M. Month-YY
 * Falls back to flat outputFolderId.
 */
function _mm_resolveOutputFolder(siteFolderName, dates, outputFolderId) {
  if (siteFolderName) {
    // createMonthFolderStructure is defined in employeeDetails.js (same library)
    const folderId = createMonthFolderStructure('SANSU AQUATEK', siteFolderName, dates, null);
    return DriveApp.getFolderById(folderId);
  }
  return DriveApp.getFolderById(outputFolderId);
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Builds a Set of normalised (uppercase) image tags from the imageColumns list.
 * Checks tagMap for explicit overrides first; falls back to <<COLUMN_NAME>>.
 *
 * Example:
 *   imageColumns = ['Photo', 'Signature']
 *   tagMap       = { '<<EMP_PHOTO>>': 'Photo' }
 *   → result     = Set { '<<EMP_PHOTO>>', '<<SIGNATURE>>' }
 */
function _mm_buildImageTagSet(imageColumns, tagMap) {
  const result = new Set();
  if (!imageColumns || imageColumns.length === 0) return result;

  // Build reverse map: COLUMN_NAME_UPPER → NORMALISED_TAG
  const reverseTagMap = {};
  if (tagMap) {
    Object.entries(tagMap).forEach(([tag, col]) => {
      reverseTagMap[String(col).trim().toUpperCase()] = tag.toUpperCase();
    });
  }

  imageColumns.forEach(col => {
    const colUpper = String(col).trim().toUpperCase();
    const tag      = reverseTagMap[colUpper] || ('<<' + String(col).trim() + '>>').toUpperCase();
    result.add(tag);
  });

  return result;
}

/**
 * Resolves the output filename by substituting <<tags>> with their values.
 * Case-insensitive replacement. Sanitizes Drive-illegal characters afterward.
 */
function _mm_resolveFileName(template, mergeMap) {
  let name = template;
  Object.entries(mergeMap).forEach(([tag, value]) => {
    const regex = new RegExp(_mm_escapeRegex(tag), 'gi');
    name = name.replace(regex, _mm_formatValue(value));
  });
  // Remove characters illegal in most OS filesystems / Drive paths
  return name.replace(/[/\\:*?"<>|]/g, '_').trim();
}

/**
 * Trashes all files in folder with the given name. Idempotent.
 * Matches the pattern used throughout the existing codebase.
 */
function _mm_trashExisting(folder, name) {
  const files = folder.getFilesByName(name);
  while (files.hasNext()) {
    files.next().setTrashed(true);
    Logger.log(`Trashed existing file: "${name}"`);
  }
}

/**
 * Formats a raw cell value for text insertion.
 *   Date        → dd/MM/yyyy
 *   null/undef  → ''
 *   everything  → String()
 */
function _mm_formatValue(value) {
  if (value instanceof Date)
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Case-insensitive lookup in mergeMap by normalised tag (already uppercase).
 * Returns the formatted value string, or null if not found or empty.
 */
function _mm_getMergeValue(mergeMap, normTag) {
  for (const [key, value] of Object.entries(mergeMap)) {
    if (key.toUpperCase() === normTag) {
      const formatted = _mm_formatValue(value);
      return formatted || null;
    }
  }
  return null;
}

/**
 * Escapes all special regex metacharacters in a literal string.
 * Used when building RegExp objects from tag names.
 */
function _mm_escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
