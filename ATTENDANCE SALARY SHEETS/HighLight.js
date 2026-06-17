function onSelectionChange(e) {
  try {
    var sheet = e.source.getActiveSheet();
    var cell = e.range;
    var props = PropertiesService.getDocumentProperties();
    
    // 1. Read memory and clear ONLY the previously highlighted cells
    var previousHighlight = props.getProperty("lastHighlighted");
    if (previousHighlight) {
      try {
        var oldRanges = JSON.parse(previousHighlight);
        sheet.getRangeList(oldRanges).setBackground(null);
      } catch(err) {
        // Failsafe if rows/columns were deleted manually between clicks
      }
      props.deleteProperty("lastHighlighted");
    }
    
    var formula = cell.getFormula();
    
    if (formula !== "") {
      var rangeMatches = formula.match(/\$?[A-Z]+\$?\d+(:\$?[A-Z]+\$?\d+)?/g);
      
      if (rangeMatches) {
        var validRanges = [];
        
        for (var i = 0; i < rangeMatches.length; i++) {
          try {
            sheet.getRange(rangeMatches[i]).setBackground("#FFFF00"); 
            validRanges.push(rangeMatches[i]); // Store successful highlights
          } catch(err) {
            // Ignores invalid text matches
          }
        }
        
        // 2. Commit the newly highlighted ranges to memory
        if (validRanges.length > 0) {
          props.setProperty("lastHighlighted", JSON.stringify(validRanges));
        }
      }
    }
  } catch(globalErr) {
    console.error("Global crash: " + globalErr.message);
  }
}
