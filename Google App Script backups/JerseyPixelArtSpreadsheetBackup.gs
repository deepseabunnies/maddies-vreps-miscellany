// Backup created 10/1/2022
// Attached to spreadsheet at https://docs.google.com/spreadsheets/d/1M8JiQk6AR2oh3mi-EQ6Mf3GzM9q1C3x4tcpbvQNMn0E/edit?usp=sharing

// Madison Micklas 9-27-2022

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
// It's mighty slow, ESPECIALLY on mobile, but in my tests it has indeed worked on mobile.

// As you edit the color table, depending on your settings in "Part 2" of this code,
// cells may change their background color to match the hex code they contain.
// This is handy for double-checking the right color copied over correctly.

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

// TODO
// Will the spreadsheet calculate colors for every single cell (very slow), or only a specific area?
const RecolorRange = {
  All: 1,
  OnlyPictureAndColorTable: 2, // TODO // Recommended for most uses
  OnlyPicture: 3, // Just the pixel art of the jersey
  OnlyColorTable: 4, // TODO // Saves some resources if you don't need the pixel art
  OnlyRecentlyEditedCell: 5 // TODO
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
const jerseyDropdownRange = "A4:M4"; // If you've merged multiple cells together, this (maybe?) needs to be the entire merged range, not just the first cell
const jerseyDropdownFirstCell = "A4"; // this is gross but idc right this second

const messageBoxSheetName = "Pixel Art";
const messageBoxCell = "A7";

const pixelArtSheetName = "Pixel Art";
const pixelArtRange = "A9:AF100"; // Might not need to be set in stone anymore, but I'll leave it for now

const colorTableSheetName = "Color Table";

// Todo: Not sure if confirmed relevant
// also todo name these better

const jerseyListRange = "C1:C200"; // The range (just one column) containing possible jersey names - will be used to populate the dropdown that the user will use to select a jersey

const colorTableRange = "D1:Z200"; // todo that's not quite right
const colorTableStartingRow = "D1"; // (^ same)
const colorTableEndingRow = "Z"; // could be calculated using numberOfColorsInPalette but let's just get this running


const colorSlotListRange = "AK1:AZ1"; // todo that is not the correct size lol
//const debugCell = "U21";
const numberOfColorsInPalette = 15;

function sendToMessageBox(msg) {
  let messageBoxSheet = SpreadsheetApp.getActive().getSheetByName(messageBoxSheetName);
  messageBoxSheet.getRange(messageBoxCell).setValue(msg) 
}

// TODO: Rearrange the spreadsheet and then inform this code of the new locations of everything
// TODO: Cleanup
// TODO: Optimization
function recolorVarious(e) {
  // Maddie 2022-09-16

  // TODO WIP

  let active = SpreadsheetApp.getActive();
  let pixelArtSheet = active.getSheetByName(pixelArtSheetName);
  let jerseyDropdownSheet = active.getSheetByName(jerseyDropdownSheetName);
  let colorTableSheet = active.getSheetByName(colorTableSheetName);

  /* if(pixelArtSheet == null) {
    // TODO: Make error more visible
    Logger.log("Error! Pixel art sheet not found. Make sure const pixelArtSheetName is correct in the code.");
    return;
  } */

  // Find which team the user has selected in the dropdown (may be "" in weird cases)
  let selectedJersey = jerseyDropdownSheet.getRange(jerseyDropdownRange).getDisplayValue();

  // The recoloring process is very slow, so give the user feedback that it's working.
  // Side notes: Toasts show up in the bottom right corner of the screen, which is easy to miss, and
  // UI dialogs don't work on mobile and actually break the recoloring process completely.
  sendToMessageBox("⏳ Generating preview for " + selectedJersey + ". This will take a few seconds.");

  // Find which row contains the information for the selected jersey, so we can use it to locate the correct color palette
  let jerseyNames = colorTableSheet.getRange(jerseyListRange).getValues();
  // TODO
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

  // Create and populate our color palette with the one that matches the selected team
  let colorPaletteRange = colorTableStartingRow + colorPaletteRow + ":" + colorTableEndingRow + colorPaletteRow;
  //Logger.log("colorPaletteRange == " + colorPaletteRange);
  let selectedColorPalette = colorTableSheet.getRange(colorPaletteRange).getValues();

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
  // If the cell contains an integer, then use that as an index and pull the color from our
  // current palette.

  let strAsInt = parseInt(str);
  if(!isNaN(strAsInt) && isFinite(str) && (strAsInt > 0)) {

    //Logger.log (strAsInt <= colorPalette[0].length);

    // TODO, Blah blah something confusing about zero indexing because I include the jersey name as the 0th entry in the color palette  

    return colorPalette[0][strAsInt-1];
  }

  // If we made it this far, the cell might have a hex code or some other kind of valid color in it.
  // (We'll be using setBackgrounds(), which will be happy with any color in CSS notation.)
  // From what I can tell, if it doesn't contain a valid color, that will work out ok too -
  // that will just reset the background color(?) (citation needed)
  // So, let's just return the string as-is and let setBackgrounds() decide what to do.

  return(str);
}