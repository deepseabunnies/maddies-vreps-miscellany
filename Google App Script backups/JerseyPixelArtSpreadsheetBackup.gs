// Backup created 10/1/2022
// Attached to spreadsheet at https://docs.google.com/spreadsheets/d/1M8JiQk6AR2oh3mi-EQ6Mf3GzM9q1C3x4tcpbvQNMn0E/edit?usp=sharing

// Madison Micklas 9-30-2022

//================================================================================
// Part 1: Summary
//================================================================================

// This script helps you choose color palettes for various real-life jerseys by giving you
// a pixel art-style preview of what the finished jersey will look like, all without having to do
// anything with Unity or external websites.

// For simplicity, I've created a template where each jersey has a certain pattern of stripes.
// It may have differences to the jersey you're trying to recreate, but with the hundreds of combined
// NCAA, NBA, and WNBA teams, I decided to compromise by generating correct-ISH jerseys for most teams
// as a starting point. We can provide overrides through other means for teams we want to depict
// more accurately.

// While working, you may want to have two windows open, one open to the color table, and
// one open to the pixel art to get real-time feedback. On the pixel art page, choose the
// desired jersey from the dropdown (you may have to create a row for it in the color table first).
// Depending on the settings in "Part 2" of this code, as you work, a preview should eventually generate.
// It takes a moment, especially on mobile, but in my tests it has indeed worked on mobile.

// As you edit the color table, depending on your settings in "Part 2" of this code,
// cells may change their background color to match the hex code they contain.
// This is handy for double-checking that the right color copied over correctly.

// If you don't know what color goes where, note that in the pixel art, each individual "pixel"
// contains a little tiny number indicating what color slot it's using.
// But really, the magic of this spreadsheet all comes down to trial and error!

// Happy generating!

//================================================================================
// Part 2: Settings for you to configure
//================================================================================

// A note for the esteemed user of this spreadsheet:
// Change currentRecolorTrigger and currentRecolorRange according to your needs.

// Under what circumstances will the spreadsheet generate a preview?
const RecolorTrigger = {
  AnyEdit: 1, // Triggered the most often.
  WhenDropdownChanged: 2, // Only when you change the value of the dropdown containing the jersey names.
  Never: 3
}

const currentRecolorTrigger = RecolorTrigger.AnyEdit;

// Note: These aren't as relevant now that my code is much faster :p
// Will the spreadsheet calculate colors for every single cell (very slow), or only a specific area?
const RecolorRange = {
  All: 1,
  OnlyPictureAndColorTable: 2, // Recommended for most uses
  OnlyPicture: 3, // Just the pixel art of the jersey
  OnlyColorTable: 4, // Saves some resources if you don't need the pixel art
  OnlyRecentlyEditedCell: 5 // Ultimate resource saving mode, but might skip some cells if you change lots of things really fast
}

const currentRecolorRange = RecolorRange.All;

//================================================================================
// Part 3: The code
//================================================================================

function onEdit(e) {

  if (currentRecolorTrigger == RecolorTrigger.Never) {
    return;
  }

  if(currentRecolorTrigger == RecolorTrigger.WhenDropdownChanged) {
    if(didJerseyDropdownChange(e) == false) {
      return;
    }
  }

  recolorVarious(e);
}

function didJerseyDropdownChange(e) {
  
  if(SpreadsheetApp.getActiveSheet().getName() != jerseyDropdownSheetName) {
    return;
  }

  let editedCell = e.range.getA1Notation();
  //Logger.log(editedCell);

  if(editedCell != jerseyDropdownFirstCell) {
    // Some other cell was edited.
    return;
  }

  recolorVarious(e);
}

// Confirmed relevant:

const jerseyDropdownSheetName = "Pixel Art";
const jerseyDropdownRange = "A4:T4"; // If you've merged multiple cells together, this (maybe?) needs to be the entire merged range, not just the first cell
const jerseyDropdownFirstCell = "A4"; // this is gross but idc right this second

const messageBoxSheetName = "Pixel Art";
const messageBoxCell = "A7";

const pixelArtSheetName = "Pixel Art";
const pixelArtRange = "A9:AF100"; // Might not need to be set in stone anymore, but I'll leave it for now

const colorTableSheetName = "Color Table";

const backgroundColorPickerSheetName = "Pixel Art";
const backgroundColorPickerRange = "X4:AD4";

const jerseyListRange = "C1:C200"; // The range (just one column) containing possible jersey names - will be used to populate the dropdown that the user will use to select a jersey

// Beware: Some of these have weird names or are obsolete
// (this script has come a long way)

// I don't like how spaghetti this is, but tbh, who is ever going to read this
const colorTableRange = "C1:V200";
const colorTableStartingCol = "C"; // (^ same)
const colorTableEndingCol = "V"; // could be calculated using numberOfColorsInPalette but let's just get this running
const colorTableNamesRow = "1";

let backgroundColorDisplayValue;

function sendToMessageBox(msg) {
  let messageBoxSheet = SpreadsheetApp.getActive().getSheetByName(messageBoxSheetName);
  messageBoxSheet.getRange(messageBoxCell).setValue(msg) 
}

function recolorVarious(e) {
  // Maddie 9-30-2022

  let active = SpreadsheetApp.getActive();
  let pixelArtSheet = active.getSheetByName(pixelArtSheetName);
  let jerseyDropdownSheet = active.getSheetByName(jerseyDropdownSheetName);
  let colorTableSheet = active.getSheetByName(colorTableSheetName);
  let backgroundColorPickerSheet = active.getSheetByName(backgroundColorPickerSheetName);

  // Find which team the user has selected in the dropdown (may be "" in weird cases)
  let selectedJersey = jerseyDropdownSheet.getRange(jerseyDropdownRange).getDisplayValue();

  // The recoloring process is very slow, so give the user feedback that it's working.
  // Side notes: Toasts show up in the bottom right corner of the screen, which is easy to miss, and
  // UI dialogs don't work on mobile and actually break the recoloring process completely.
  sendToMessageBox("⏳ Generating preview for " + selectedJersey + ". This will take a few seconds.");

  // Find which row contains the information for the selected jersey, so we can use it to locate the correct color palette
  let jerseyNames = colorTableSheet.getRange(jerseyListRange).getValues();
  let colorPaletteRow;
  // vv todo: starting with 1 is weird but i think it's necessary
  for(let i = 1; i < jerseyNames.length; i++) {
    //Logger.log("jersey name is " + jerseyNames[i]);
    if(selectedJersey == jerseyNames[i]) {
      //Logger.log("User has selected " + selectedJersey + ". We found a match: " + jerseyNames[i] + ". i is " + i);
      // Fixme? This is pretty delicate"
      colorPaletteRow = i+1; // Compensating for zero indexing and the fact that I used up one row to use as a header // TODO clarify this bc i adjusted it again actually
    }
  }

  backgroundColorDisplayValue = backgroundColorPickerSheet.getRange(backgroundColorPickerRange).getDisplayValue();

  // Create and populate our color palette with the one that matches the selected team
  let colorPaletteRange = colorTableStartingCol + colorPaletteRow + ":" + colorTableEndingCol + colorPaletteRow;
  //Logger.log("colorPaletteRange == " + colorPaletteRange);
  let selectedColorPalette = colorTableSheet.getRange(colorPaletteRange).getValues();
  //Logger.log("color palette length: " + selectedColorPalette[0].length);
  
  // Depending on the settings in "Part 2" of this code, we might be recoloring multiple ranges
  // in the spreadsheet. So let's decide what those ranges are.
  let rangesToRecolor = [];

  switch(currentRecolorRange) {
    case RecolorRange.All:
      let allSheets = SpreadsheetApp.getActive().getSheets();
      for(let sh of allSheets) {
        rangesToRecolor.push(sh.getDataRange());
      }
      break;
    case RecolorRange.OnlyPictureAndColorTable:
      rangesToRecolor.push(pixelArtSheet.getRange(pixelArtRange));
      rangesToRecolor.push(colorTableSheet.getRange(colorTableRange));
      break;
    case RecolorRange.OnlyPicture:
      rangesToRecolor.push(pixelArtSheet.getRange(pixelArtRange));
      break;
    case RecolorRange.OnlyColorTable:
      rangesToRecolor.push(colorTableSheet.getRange(colorTableRange));
      break;
    case RecolorRange.OnlyRecentlyEditedCell:
      rangesToRecolor.push(e.range);
      break;
  }

  //for (let ran of rangesToRecolor) {
    //Logger.log("contents: " + ran.getValues());
  //}

  for(let ran of rangesToRecolor) {

    // Hold onto all of the colors we want to use in this particular range so we can
    // set the background colors in batches later.
    // This will be a two-dimensional array.
    let rangeColors = [];

    // Each range is a two-dimensional array, so we'll iterate through it
    // using rows and columns.
    ran.getValues().forEach(function(row) {
      // Similar to rangeColors, but in one dimension:
      let rowColors = [];

      row.forEach(function(cellContents) {
        rowColors.push(chooseColor(cellContents, selectedColorPalette));
      });

      //Logger.log("rowColors: " + rowColors.toString());
      rangeColors.push(rowColors);
    });
    // At long last, actually set the background colors for this entire single range.
    ran.setBackgrounds(rangeColors);
  }

  sendToMessageBox("Preview generation complete.");
}

function chooseColor(str, colorPalette) {

  // If the cell contains an integer, then we'll use that as an index and pull the color
  // from colorPalette[].
  let strAsInt = parseInt(str);

  // todo: the colorPalette[0].length thing is gross but also who cares
  if(isNaN(strAsInt) || !isFinite(strAsInt) || (strAsInt >= colorPalette[0].length)) {
    // This cell must not be part of the pixel art, since it doesn't have the right syntax
    // or would result in an out of range error.
    // The cell might have a hex code or some other kind of valid color in it, or it might not.
    // So, let's just return the string as-is and let setBackgrounds() decide what to do.
    return(str);
  }

  if(strAsInt == 0) {
    // That's our signal to use the special background color.
    return backgroundColorDisplayValue;
  }
  
  // If we've made it this far, we must have an integer that works as a valid index
  // todo I don't like this weird index thing
  return colorPalette[0][strAsInt];
}