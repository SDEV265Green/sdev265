/**
 * Created by Isaac on 10/16/15.
 */

"use strict";

//import Player from "player.js";
//import Game from "game.js";

// Get the page bounds
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    pageWidth = w.innerWidth || e.clientWidth || g.clientWidth,
    pageHeight = w.innerHeight || e.clientHeight || g.clientHeight;

// Get number of players
var numPlayers = 4;
/*********************************************************************************
 * Commented out the following so that the prompts for the players don't come up *
 *********************************************************************************/
/*do {
    numPlayers = prompt("Enter number of players (2-4): ");
} while (2 > numPlayers || numPlayers > 4);*/
/*****************************************************************
 *                Commented out stuff ends here                  *
 *****************************************************************/

// Get player names and colors
var players = [];
var playerNames = [];
var playerColors = [];

var game;
var playersInit = 0;

//adds player name and color to arrays
//once all players added the inputs are hidden and new buttons show up
function getPlayers() {

  //temp variables for shortening code
  var tempName = document.querySelector('.player-name-' + playersInit).value;

  var tempColor = document.querySelector('.player-color').value;

  if (tempName != '' && playersInit <= 3) {
    //set player name and color
    playerNames[playersInit] = tempName;
    playerColors[playersInit] = tempColor;


    //create new player object
    switch (playersInit) {
      case 0:
        players.push(new Player(playerNames[0], playerColors[0]));
        break;
      case 1:
        players.push(new Player(playerNames[1], playerColors[1]));
        break;
      case 2:
        players.push(new Player(playerNames[2], playerColors[2]));
        break;
      case 3:
        players.push(new Player(playerNames[3], playerColors[3]));
        break;
    }

    //hide previous player input, increment player, show new player input
    document.querySelector('.player-name-' + playersInit).style.display = 'none';
    playersInit += 1;
    var selectColorOption = document.querySelector('.player-color');
    for (var i=0; i<selectColorOption.length; i++) {
      if (selectColorOption.options[i].value == tempColor) {
        document.querySelector('.player-color').remove(i);
      }
    }
    if (playersInit <= 3) {
      document.querySelector('.player-name-' + playersInit).style.display = 'inline';
      document.querySelector('.player-name-' + playersInit).focus()
    }
  } else if (playersInit <= 3){
    alert('Name cannot be blank');
    document.querySelector('.player-name-' + playersInit).focus();
  }
  if (playerNames.length == 4){
    document.querySelector('.btn-accept-player').style.display = 'none';
    document.querySelector('.player-name-3').style.display = 'none';
    document.querySelector('.player-color').style.display = 'none';

    // Setup new game
    game = new Game(players);

    document.querySelector('.btn-roll').addEventListener('click', game.diceRoll);

    getGoodBoard();

    // Get an adequate board
    //buildInitalSetup();

    document.querySelector('.good-board').style.display = 'inline';
    document.querySelector('.bad-board').style.display = 'inline';

  }
}

/*
if (playersInit == 4) {
  // Setup new game
  var game = new Game(players);

  // Get an adequate board
  buildInitalSetup();
}
*/

var goodBoard, rendered = false, makingBoard = false;

// Make a couple functions in order to get around things being too fast
function getGoodBoard () {
    // Make a new board
    game.newBoard();

    // Render the new board
    game.board.render(game.players);

/*
    // Ask if board is okay after a slight delay
    setTimeout(confirmBoard, 100); */
}

//load at start, makes buttons work properly
window.onload = function() {
    //set focus
    document.querySelector('.player-name-0').focus()

    //Accept button for player creation
    document.querySelector('.btn-accept-player').addEventListener('click', getPlayers);

    //Accept Board button selected
    document.querySelector('.good-board').addEventListener('click', function() {
      //hide accept board and new board buttons
      document.querySelector('.good-board').style.display = 'none';
      document.querySelector('.bad-board').style.display = 'none';

      document.querySelector('.dice1').style.display = 'block';
      document.querySelector('.dice2').style.display = 'block';
      document.querySelector('.btn-roll').style.display = 'inline';

      //buildInitalSetup();
    });
    document.querySelector('.bad-board').addEventListener('click', getGoodBoard);
}

//****************************************
// Get a good board
//getGoodBoard();
//****************************************

function buildInitalSetup() {

    // Have players build their first two settlements and roads
    for (var i = 1; i <= numPlayers; i++) {
        game.buildItem(2, true);
        game.incTurn();
    }
    for (i = 1; i <= numPlayers; i++) {
        game.buildItem(2, true);
        game.incTurn();
    }
    game.board.render(game.players);
    setTimeout(main, 100);

    //main();
}

function main() {
    // Run a game.nextTurn() cycle until the game is over
    while (!game.over) {
        game.nextTurn();
  }
}
