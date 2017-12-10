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

// Get player names and colors
var players = [];
var playerNames = [];
var playerColors = [];

var game;
var playersInit = 0;
var initial = true;
/*
 #######  ##    ## ##        #######     ###    ########
##     ## ###   ## ##       ##     ##   ## ##   ##     ##
##     ## ####  ## ##       ##     ##  ##   ##  ##     ##
##     ## ## ## ## ##       ##     ## ##     ## ##     ##
##     ## ##  #### ##       ##     ## ######### ##     ##
##     ## ##   ### ##       ##     ## ##     ## ##     ##
 #######  ##    ## ########  #######  ##     ## ########
*/

//load at start, makes buttons work properly
window.onload = function() {
    //set focus
    document.querySelector('.player-name-0').focus()

    //Accept button for player creation
    document.querySelector('.btn-accept-player').addEventListener('click', getPlayers);

    //Catan Rules button
    document.querySelector('.rules').addEventListener('click', function() {
      window.open('http://www.catan.com/en/download/?SoC_rv_Rules_091907.pdf');
    });

    //Accept Board button selected
    document.querySelector('.good-board').addEventListener('click', function() {
      //hide accept board and new board buttons
      document.querySelector('.good-board').style.display = 'none';
      document.querySelector('.bad-board').style.display = 'none';

      document.querySelector('.dice1').style.display = 'block';
      document.querySelector('.dice2').style.display = 'block';
      document.querySelector('.btn-roll').style.display = 'inline';

      document.querySelector('.wrapper-current-player').style.display = 'block';
      document.querySelector('.player-current').textContent = game.players[game.turn].name;
      document.querySelector('.player-current').style.color = game.players[game.turn].color;
      document.querySelector('.player-current').style.fontWeight = '900';

      document.querySelector('.wrapper-player-resources').style.display = 'block';
      document.querySelector('.player-resources-title-0').textContent = game.players[0].name;
      document.querySelector('.player-resources-title-1').textContent = game.players[1].name;
      document.querySelector('.player-resources-title-2').textContent = game.players[2].name;
      document.querySelector('.player-resources-title-3').textContent = game.players[3].name;
      document.querySelector('.player-resources-0').style.display = 'inline-block';
      document.querySelector('.player-resources-1').style.display = 'inline-block';
      document.querySelector('.player-resources-2').style.display = 'inline-block';
      document.querySelector('.player-resources-3').style.display = 'inline-block';

      //set up player locations
      buildInitalSetup();
    });
    document.querySelector('.bad-board').addEventListener('click', getGoodBoard);
}

/*
 ######   ######## ########
##    ##  ##          ##
##        ##          ##
##   #### ######      ##
##    ##  ##          ##
##    ##  ##          ##
 ######   ########    ##

########  ##          ###    ##    ## ######## ########   ######
##     ## ##         ## ##    ##  ##  ##       ##     ## ##    ##
##     ## ##        ##   ##    ####   ##       ##     ## ##
########  ##       ##     ##    ##    ######   ########   ######
##        ##       #########    ##    ##       ##   ##         ##
##        ##       ##     ##    ##    ##       ##    ##  ##    ##
##        ######## ##     ##    ##    ######## ##     ##  ######
*/

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

    document.querySelector('.rules').style.display = 'inline';
    document.querySelector('.good-board').style.display = 'inline';
    document.querySelector('.bad-board').style.display = 'inline';

  }
}

/*
 ######   ######## ########
##    ##  ##          ##
##        ##          ##
##   #### ######      ##
##    ##  ##          ##
##    ##  ##          ##
 ######   ########    ##

 ######    #######   #######  ########
##    ##  ##     ## ##     ## ##     ##
##        ##     ## ##     ## ##     ##
##   #### ##     ## ##     ## ##     ##
##    ##  ##     ## ##     ## ##     ##
##    ##  ##     ## ##     ## ##     ##
 ######    #######   #######  ########

########   #######     ###    ########  ########
##     ## ##     ##   ## ##   ##     ## ##     ##
##     ## ##     ##  ##   ##  ##     ## ##     ##
########  ##     ## ##     ## ########  ##     ##
##     ## ##     ## ######### ##   ##   ##     ##
##     ## ##     ## ##     ## ##    ##  ##     ##
########   #######  ##     ## ##     ## ########
*/

// Make a couple functions in order to get around things being too fast
function getGoodBoard () {
    // Make a new board
    game.newBoard();

    // Render the new board
    game.board.render(game.players);

}

/*
########  ##     ## #### ##       ########
##     ## ##     ##  ##  ##       ##     ##
##     ## ##     ##  ##  ##       ##     ##
########  ##     ##  ##  ##       ##     ##
##     ## ##     ##  ##  ##       ##     ##
##     ## ##     ##  ##  ##       ##     ##
########   #######  #### ######## ########

#### ##    ## #### ######## ####    ###    ##
 ##  ###   ##  ##     ##     ##    ## ##   ##
 ##  ####  ##  ##     ##     ##   ##   ##  ##
 ##  ## ## ##  ##     ##     ##  ##     ## ##
 ##  ##  ####  ##     ##     ##  ######### ##
 ##  ##   ###  ##     ##     ##  ##     ## ##
#### ##    ## ####    ##    #### ##     ## ########

 ######  ######## ######## ##     ## ########
##    ## ##          ##    ##     ## ##     ##
##       ##          ##    ##     ## ##     ##
 ######  ######      ##    ##     ## ########
      ## ##          ##    ##     ## ##
##    ## ##          ##    ##     ## ##
 ######  ########    ##     #######  ##
*/

function buildInitalSetup() {

    // Have players build their first two settlements and roads
    /*
    for (var i = 1; i <= numPlayers; i++) {
        game.buildItem(2, true);
        game.incTurn();
    }
    for (var i = 1; i <= numPlayers; i++) {
        game.buildItem(2, true);
        game.incTurn();
    }
    game.board.render(game.players);
    setTimeout(main, 100);
    */
    game.buildItem(2, initial);

    main();
}

/*
##     ##    ###    #### ##    ##
###   ###   ## ##    ##  ###   ##
#### ####  ##   ##   ##  ####  ##
## ### ## ##     ##  ##  ## ## ##
##     ## #########  ##  ##  ####
##     ## ##     ##  ##  ##   ###
##     ## ##     ## #### ##    ##
*/

function main() {
    // Run a game.nextTurn() cycle until the game is over
    while (!game.over) {
        game.nextTurn();
  }
}
