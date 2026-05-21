# DOCUMENTS — Schema Reference

**Purpose:** Column config, formulas, and logic for `DOCUMENTS` table in AppSheet.
**Source Table:** `DOCUMENTS` (from EMPLOYEE DETAILS SHEET)
**Last Updated:** 2026-05-21

---

## Table of Contents

1. [System Columns](#1-system-columns)
2. [References](#2-references)
3. [Document Images](#3-document-images)
4. [Complex Formulas Reference](#4-complex-formulas-reference)

---

## Column Table Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Yes |
| ❌ | No |
| — | Not applicable |

**Columns:** `Show?` · `Type` · `Req?` (Required) · `Key?` · `Edit?` (Editable) · `Label?` · `Search?` · `PII?`

---

## 1. System Columns

> Auto-generated. Used as primary key. Not shown in UI. Not editable by user.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Logic / Formula |
|--------|-------|------|------|------|-------|--------|---------|------|-----------------|
| `DOCID` | ❌ | Text | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Initial: sequential `DOC00001` format → see [§4.1](#41-docid) |

---

## 2. References

> Ref columns linking to other tables. Display names shown in UI instead of IDs.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Source Table | Display Name | Part Of? |
|--------|-------|------|------|------|-------|--------|---------|------|-------------|-------------|----------|
| `EMPID` | ✅ | Ref | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | `PERSONAL INFORMATION` | `NAME` | ✅ |

---

## 3. Document Images

> All image columns are hidden from list view but editable. All are PII. Each stores files in a dedicated folder.

| Column | Show? | Type | Req? | Key? | Edit? | Label? | Search? | PII? | Image Folder Path |
|--------|-------|------|------|------|-------|--------|---------|------|-------------------|
| `I-CARD` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/I-Cards` |
| `AADHAR CARD` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/AadharCard` |
| `PAN CARD` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/PANCard` |
| `POLICE VARIFICATION` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/Police Varification` |
| `BANK PASSBOOK` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/Bank Passbook` |
| `VOTING CARD` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/Voting Card` |
| `MEDICAL REPORT` | ❌ | Image | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | `Pictures/Medical Report` |

---

## 4. Complex Formulas Reference

### 4.1 DOCID

Initial Value — generates sequential ID in `DOC00001` format using last row's DOCID:

```appsheet
"DOC" & RIGHT("00000" & 
  (IF(ISBLANK(DOCUMENTS[DOCID]), 
    1, 
    NUMBER(RIGHT(LOOKUP(MAXROW("DOCUMENTS", "_RowNumber"), "DOCUMENTS", "DOCID", "DOCID"), 5)) + 1
  )), 5)
```

> Logic: if no rows exist yet → start at `1`. Otherwise → find the last row by `_RowNumber`, extract the numeric suffix from its DOCID, add 1.
