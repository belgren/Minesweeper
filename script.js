var size;
var mineCount;
var firstClick = true;
var revealedCount=0;

$(this).bind("contextmenu", function (e) {
 e.preventDefault();
});


function printBoard(board) {
  var formatedBoard = board.map(function(row) {
    return row.join(',')
  }).join('\n')
  console.log(formatedBoard)
}

function reveal(row, col, board){
  if (firstClick){
    firstClick=false;

    if (board[row][col] != 0){
      redraw(row, col, board);
      return
    }
  }
  if (row < 0 || row >= board.length) {
    return;
  } else if (col < 0 || col >= board[row].length  ) {
    return;
  }

  var el = $("div[row="+row+"][col="+col+"]");

  if (el.text().trim() !== "") {
    return;
  }
  var number = board[row][col];
  if (number=='B'){
    explode(board);
    return;
  }
  else if (number>0){
    $("div[row="+row+"][col="+col+"]").text(board[row][col]);
    revealedCount++;
    if (revealedCount>=(size*size-mineCount)){
      checkWin(board);
    }
    return;
  }
  else if (number==0){
    revealedCount++;
    $("div[row="+row+"][col="+col+"]").text(board[row][col]);
    if (revealedCount>=(size*size-mineCount)){
      checkWin(board);
    }
    reveal(row - 1, col - 1, board);
    reveal(row - 1, col + 0, board);
    reveal(row - 1, col + 1, board);
    reveal(row + 0, col - 1, board);
    reveal(row + 0, col + 1, board);
    reveal(row + 1, col - 1, board);
    reveal(row + 1, col + 0, board);
    reveal(row + 1, col + 1, board);
  }
}

function checkWin(board){
  for(var i = 0 ; i < size; i++) {
    for(var j = 0; j < size; j++) {
      if ($("div[row="+i+"][col="+j+"]").text()==" " && board[i][j]!="B"){
        return false;
      }
    }
  }
  setTimeout(function(){
    $('.win').show();
  },300)
}


function redraw(row, col, board){
  var number = board[row][col];
  var neighbors = getNeighbors(board, row, col);
  clearBoard(board);
  printBoard(board);

  addBombs(board, size, mineCount, row, col);
  printBoard(board);
  addNumbers(board);
  printBoard(board);
  reveal(row, col, board);
}

function explode(board){
  for(var i = 0 ; i < size; i++) {
    for(var j = 0; j < size; j++) {
      if (board[i][j] == "B"){
        $("div[row="+i+"][col="+j+"]").html('<img src="./images/mine.png" id="mineImage">');
      }
    }
  }
  $('.lose').show();
}

function clearBoard(board){
  for(var i = 0 ; i < size; i++) {
    for(var j = 0; j < size; j++) {
      if (board[i][j] == "B"){
        board[i][j] = "0";
      }
    }
  }
}

function drawBoard(board) {
  var boardEl = $('#game-board')

  boardEl.html('')

  for(var i = 0; i < board.length; i++) {
    var rowEl = $('<div class="row"></div>')

    for(var j = 0; j < board.length; j++) {
      var cellEl = $(`<div row="${i}" col="${j}" state="${board[i][j]}" class="cell">&nbsp;<div class="cell-content"</div></div>`)
      cellEl.on('mousedown', function(event) {
        var el = $(this)
        var row = el.attr('row');
        var col = el.attr('col');
        switch(event.which) {
          case 1:
            reveal(Number(row), Number(col), board);
            break
          case 2:
            break
          case 3:
            if( $("div[row="+row+"][col="+col+"]").val() == 'Flag'  ){
              // $(this > '.cell-content').remove(); //THIS ISNT WORKING 
            }

            $(this, '.cell-content').html($('<img src="./images/flag.png" id="flagImage">'));
            $("div[row="+row+"][col="+col+"]").val('Flag');
            break
        }
      })
      rowEl.append(cellEl)
    }
    boardEl.append(rowEl)
  }
}



$(document).ready(function() {
  $('.lose').hide();
  $('.win').hide();

  $("#start-game").on('click', function(event) {
    event.preventDefault();
    $('.start-menu').hide();
    $('.game-play').show();
    size = Number($("#game-size").val())
    mineCount = Number($("#mine-count").val())
    gameboard = []
    for(var i = 0 ; i < size; i++) {
      var row = [] // row
      gameboard[i] = row
      for(var j = 0; j < size; j++) {
        row[j] = '?'
      }
    }
    var bombsArr = addBombs(gameboard, size, mineCount);
    addNumbers(gameboard, bombsArr);
    drawBoard(gameboard)
    printBoard(gameboard)
  })
})

function addNumbers(board, bombsArr){
  //loop through all non-border cells
  for(var i = 0 ; i < size; i++) {
    for(var j = 0; j < size; j++) {
      var cell = board[i][j];
      if (cell!='B'){
        neighbors = getNeighbors(board, i, j);
        neighbors = neighbors.filter(function(item){
          return item=='B'
        })
        var numNeighbors = neighbors.length;
        board[i][j]=numNeighbors;
      }
    }
  }
}

function getNeighbors(board,x,y){
  neighbors = [];
  var neighborX;
  var neighborY;
  for (var neighborX=x-1; neighborX<=x+1; neighborX++){
    for(var neighborY=y-1; neighborY<=y+1; neighborY++){
      if (neighborX>=0 && neighborX<size && neighborY>=0 && neighborY<size){
        neighbors.push(board[neighborX][neighborY]);
      }
    }
  }
  return neighbors;
}

function addBombs(gameboard, size, mineCount, startX, startY){
  var existingBombs = [];
  if (!isNaN(startX) && !isNaN(startY)){
    existingBombs.push([startX, startY])
  }
  for (var x=-1; x<=1; x++){
    for (var y=-1; y<=1; y++){
      existingBombs.push([startX+x, startY+y])
    }
  }
  while(mineCount) {
    var x = Math.floor(Math.random() * size);
    var y = Math.floor(Math.random() * size);

    if (!existingBombs.includesArray([x,y])){
      dropBomb(gameboard, x, y);
      existingBombs.push([x,y]);
      mineCount--;
    }
  }
  return existingBombs;
}

function dropBomb(board, row, col) {
  board[row][col] = 'B'
}

Array.prototype.includesArray = function([x,y]){
  for(i=0; i<this.length; i++){
    if (this[i][0]==x && this[i][1]==y){
      return true;
    }
  }
  return false;
}
