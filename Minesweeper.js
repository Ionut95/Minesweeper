let boxWeight = 340;
let boxHeight = 340;
let marginUp = 140;
let marginLeft = 40;
let sizeCell = 34;
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let gameEnd = false;
let cells = [];
let table = document.getElementById("canvas");
let tableLeft = table.offsetLeft;
let tableTop = table.offsetTop;
let clickedCellX;
let clickedCellY;
let clickedCell;
let mines = [];
let neighbours = [{x: -34, y: -34}, {x: 0, y: -34}, {x: 34, y: -34}, {x: -34, y: 0}, {x: 0, y: 0}, {x: 34, y: 0}, {x: -34, y: 34}, {x: 0, y: 34}, {x: 34, y: 34}];
let checkedCells = [];
let cellsToBeChecked = [];
let minesCnt = 0;
let numberColors = ["blue", "green", "red", "purple", "maroon", "turquoise", "black", "gray"];
let discoveredCellsCnt = 0;
let discoveredCells = [];
let flaggedCells = [];
let messages = ["Let's get started!", "Avoid mines and get the winning prize!", "YOU WIN! Do it again!", "YOU LOSE! Try again more carefully!"];
let smileyFace = ["🙂","🙁"];
let seconds = 0;
let intervalId;

title();
displayMessage(0);
drawHeader();
addSmiley(0);
time();
drawBoard();
countFlags();

function title() {
  context.font = "25px Comic Sans MS";
  context.fillStyle = "blue";
  context.textAlign = "center";
  context.fillText("Minesweeper!", 210, 55);
}

function displayMessage(messageIndex) {
  context.clearRect(40, 70, 350, 20);
  context.font = "15px Comic Sans MS";
  context.fillStyle = "black";
  context.textAlign = "center";
  context.fillText(messages[messageIndex], 210, 85);
}

function drawHeader() {
  context.fillStyle = "#7393B3";
  context.fillRect(marginLeft, 105, boxWeight + 1, 34);
}

function addSmiley(smileyIndex) {
  context.font = "20px Comic Sans MS";
  context.textAlign = "center";
  context.fillText(smileyFace[smileyIndex], 210, 128);
}

function time() {
  if (seconds == 1000 || gameEnd == true) {
    clearInterval(intervalId);
  }
  redrawHeader(270, 105, 95, 30);
  context.fillText("⏱️ " + seconds, 310, 128);
  ++seconds;
}

function drawBoard() {
  context.fillStyle = "#C0C0C0";
  for (let x = 0; x <= boxWeight; x += 34) {
    context.moveTo(0.5 + x + marginLeft, marginUp);
    context.lineTo(0.5 + x + marginLeft, boxHeight + marginUp);
  }
  for (let x = 0; x <= boxHeight; x += 34) {
    context.moveTo(marginLeft, 0.5 + x + marginUp);
    context.lineTo(boxWeight + marginLeft, 0.5 + x + marginUp);
  }
  context.strokeStyle = "gray";
  context.stroke();
  cellCharacteristics();
  enableEvents();
}

function drawFlag() {
  context.font = "18px Comic Sans MS";
  context.textAlign = "center";
  context.fillText("🚩", clickedCellX + 18, clickedCellY + 22);
}

function countFlags() {
  let cntFlags = 12 - flaggedCells.length;
  redrawHeader(marginLeft + 1, 105, 120, 30);
  context.fillText("🚩 " + cntFlags, 95, 128);
}

function redrawHeader(x, y, width, height) {
  context.fillStyle = "#7393B3";
  context.fillRect(x, y, width, height);
  context.font = "18px Comic Sans MS";
  context.fillStyle = "black";
  context.textAlign = "center";
}

function flaggingCells() {
  if (flaggedCells.includes(clickedCell) == false) {
    drawFlag();
    flaggedCells.push(clickedCell);
    countFlags();
  } else {
    removeFlag(clickedCell);
    reduceNoFlags(clickedCell);
    countFlags();
  }
}

function reduceNoFlags(cellIndex) {
  flaggedCells.splice(flaggedCells.indexOf(cellIndex), 1);
}

function resetFlagCells() {
  for (let index = 0; index < flaggedCells.length; ++index) {
    removeFlag(flaggedCells[index]);
  }
  flaggedCells.length = 0;
  countFlags();
}

function removeFlag(index) {
  context.fillStyle = "#C0C0C0";
  context.fillRect(cells[index].left + 1, cells[index].top + 1, sizeCell - 3, sizeCell - 3);
}

function cellCharacteristics() {
  for (let x = 0; x < boxHeight; x +=34) {
    for (let y = 0; y < boxWeight; y += 34) {
      context.fillRect(marginLeft + y + 1, marginUp + x + 1, sizeCell - 3, sizeCell - 3);
      cells.push({
        top: x + marginUp,
        left: y + marginLeft
      });
    }
  }
}

function enableEvents() {
  table.onclick = function(event) {
    mousePosition(event);
    if (gameEnd == false && flaggedCells.includes(clickedCell) == false && validatePosition(clickedCellX, clickedCellY) == true) {
      checkCells();
    }
  };
  table.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    mousePosition(event);
    if (discoveredCells.includes(clickedCell) == false && gameEnd == false && validatePosition(clickedCellX, clickedCellY) == true) {
      flaggingCells();
    }
  });
}

function mousePosition(ev) {
  let x = ev.pageX - tableLeft;
  let y = ev.pageY - tableTop;
  for (let index = 0; index < cells.length; ++index) {
    if (cells[index].left <= x && x < cells[index].left + sizeCell && cells[index].top <= y && y < cells[index].top + sizeCell) {
      clickedCellX = cells[index].left;
      clickedCellY = cells[index].top;
      clickedCell = index;
      break;
    } else {
      clickedCellX = 0;
      clickedCellY = 0;
    }
  }
  restart(x, y);
}

function placeMines() {
  while (mines.length <= 11) {
    let currentMine = Math.floor(Math.random() * 99);
    if (mines.includes(currentMine) == false && checkMinesPosition(currentMine) == false) {
      mines.push(currentMine);
    }
  }
}

function checkMinesPosition(minePosition) {
  for (let index = 0; index < neighbours.length; ++index) {
    if (clickedCellX + neighbours[index].x == cells[minePosition].left && clickedCellY + neighbours[index].y == cells[minePosition].top) {
      return true;
    }
  }
  return false;
}

function colorBombs() {
  for (let index = 0; index < mines.length; ++index) {
    context.font = "18px Comic Sans MS";
    context.textAlign = "center";
    if (flaggedCells.includes(mines[index]) == true) {
      removeFlag(mines[index]);
      reduceNoFlags(mines[index]);
    }
    context.fillText("💣", cells[mines[index]].left + 18, cells[mines[index]].top + 22);
  }
}

function checkCells() {
  if (mines.length == 0) {
      placeMines();
      resetFlagCells();
      displayMessage(1);
      intervalId = setInterval(time, 1000);
    }
  if (mines.includes(clickedCell) == true) {
    lose();
  } else {
    cellsToBeChecked.push(clickedCell);
    for (let index = 0; index < cellsToBeChecked.length; ++index) {
      checkNeighbours(cellsToBeChecked[index]);
      if (minesCnt != 0) {
        hasMine(cellsToBeChecked[index]);
      } else {
        continueClear(cellsToBeChecked[index]);
      }
      minesCnt = 0;
    }
    cellsToBeChecked.length = 0;
  }
  if (discoveredCellsCnt == cells.length - mines.length) {
    win();
  }
}

function checkNeighbours(currentCell) {
  for (let index = 0; index < neighbours.length; ++index) {
    if (index != 4 && validatePosition(cells[currentCell].left + neighbours[index].x, cells[currentCell].top + neighbours[index].y) == true && isNeighbourMine(index, currentCell)) {
      ++minesCnt;
    }
  }
}

function validatePosition(neighbourX, neighbourY) {
  if (marginLeft <= neighbourX && neighbourX < marginLeft + boxWeight && marginUp <= neighbourY && neighbourY < marginUp + boxHeight) {
    return true;
  }
  return false;
}

function isNeighbourMine(position, cell) {
  for (let index = 0; index < mines.length; ++index) {
    if (cells[cell].left + neighbours[position].x == cells[mines[index]].left && cells[cell].top + neighbours[position].y == cells[mines[index]].top) {
      return true;
    }
  }
  return false;
}

function hasMine(cellIndex) {
  discoverCell(cellIndex);
  addNoMines(cellIndex);
  checkedCells.push(cellIndex);
}

function continueClear(cellIndex) {
  discoverCell(cellIndex);
  checkedCells.push(cellIndex);
  for (let index = 0; index < neighbours.length; ++index) {
    let noCell = convertCellToNumber(cells[cellIndex].left + neighbours[index].x, cells[cellIndex].top + neighbours[index].y);
    if (index != 4 && validatePosition(cells[cellIndex].left + neighbours[index].x, cells[cellIndex].top + neighbours[index].y) == true && noCell != - 1 && checkedCells.includes(noCell) == false) {
      cellsToBeChecked.push(noCell);
    }
  };
}

function discoverCell(cellIndex) {
  if (discoveredCells.includes(cellIndex) == false) {
    discoveredCells.push(cellIndex);
    ++discoveredCellsCnt;
  } 
  if (flaggedCells.includes(cellIndex) == true) {
    reduceNoFlags(cellIndex);
    countFlags();
  }
  context.fillStyle = "#E5E4E2";
  context.fillRect(cells[cellIndex].left + 1, cells[cellIndex].top + 1, sizeCell - 3, sizeCell - 3);
}

function addNoMines(cellIndex) {
  for (let index = 0; index < numberColors.length; ++index) {
    if (index == minesCnt - 1) {
      context.fillStyle = numberColors[index];
    }
  }
  context.font = "25px Comic Sans MS";
  context.textAlign = "center";
  context.fillText(minesCnt, cells[cellIndex].left + 17, cells[cellIndex].top + 25);
}

function convertCellToNumber(x, y) {
  for (let index = 0; index < cells.length; ++index) {
    if (x == cells[index].left && y == cells[index].top) {
      return index;
    }
  }
  return -1;
}

function win() {
  displayMessage(2);
  end();
}

function lose() {
  displayMessage(3);
  addSmiley(1);
  colorBombs();
  end();
}

function end() {
  gameEnd = true;
}

function restart(x, y) {
  if (marginLeft + 160 < x && x < marginLeft + 180 && marginUp - sizeCell < y && y < marginUp - 6) {
    location.reload();
  }
}