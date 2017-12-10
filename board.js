"use strict";

//import Location from "location.js";

var tileWidth = 124,
    tileHeight = 108,
    tileBigHeight = 140;

//FOR NOW: this will be a three-dimensional array that holds the data of the coordinates for each tile
//(ArrayOfTileVerticesCoordinates[INDEX OF TILE] [INDEX OF VERTEX] [INDEX OF COORDINATE (x=0,y=1)]]
var ArrayOfTileVerticesCoordinates = [];
//simpler version of ArrayOfTileVerticesCoordinates
//this one is a 2 dimensional array with (x,y) values for each corner
var corners = [];
var cornersFilled = false;
//array for each clickable object
// [[x1, x2, y1, y2, 'TYPE', true/false]]
//x1, x2 is the x range for the square; y1, y2 is the y range
//'TYPE' can be 'none', 'settlement', 'city'
//true/false is if the corner is buildable or not
var rects = [];

var elem = document.getElementById('canvas');
//event listener for clicks on corners
elem.addEventListener('click', function(event) {
  var x = event.pageX,
      y = event.pageY;
  for (var square=0; square<54; square++) {
    if ((x>=rects[square][0] && x<=rects[square][1]) && (y>=rects[square][2] && y<=rects[square][3])) {
      if (rects[square][4]=='none') {
        validBuild(square, 'settlement', initial);
      }
      else if (rects[square][4]=='settlement') {
        validBuild(square, 'city', initial);
      }
    }
  }
})

// Class for whole board of tiles
class Board {
    // Constructor
    constructor() {
        // Get canvas info
        this.canvas = document.getElementById('canvas');
        this.canvas.width = 1500;
        this.canvas.height = 700;
        this.ctx = this.canvas.getContext("2d");

        // Setup array for all tiles
        this.tiles = [];

        // Make a list with the right number of each tile
        var locations = ["Hills", "Hills", "Hills",
            "Forest", "Forest", "Forest", "Forest",
            "Mountains", "Mountains", "Mountains",
            "Fields", "Fields", "Fields", "Fields",
            "Pasture", "Pasture", "Pasture", "Pasture",
            "Dessert"];

        // Make a list with the right number of each tile value
        var values = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

        // Randomly shuffle the location array and the values array
        locations = shuffle(locations);
        values = shuffle(values);

        // Get the position of the robber
        this.robberPosition = locations.indexOf("Dessert");

        // Store tiles with correct positions and values
        var x = 1.61290323 * tileWidth,
            y = 0.46296296 * tileHeight,
            valIndex = 0,
            i;

        for (i = 0; i < 3; i++) {
            if (i != this.robberPosition)
                this.tiles.push(new Location(i, locations[i], values[valIndex++], x, y));
            else
                this.tiles.push(new Location(i, locations[i], 0, x, y));
            x += tileWidth;
        }
        x -= 3.5 * tileWidth;
        y += tileHeight;
        for (i = 3; i < 7; i++) {
            if (i != this.robberPosition)
                this.tiles.push(new Location(i, locations[i], values[valIndex++], x, y));
            else
                this.tiles.push(new Location(i, locations[i], 0, x, y));
            x += tileWidth;
        }
        x -= 4.5 * tileWidth;
        y += tileHeight;
        for (i = 7; i < 12; i++) {
            if (i != this.robberPosition)
                this.tiles.push(new Location(i, locations[i], values[valIndex++], x, y));
            else
                this.tiles.push(new Location(i, locations[i], 0, x, y));
            x += tileWidth;
        }
        x -= 4.5 * tileWidth;
        y += tileHeight;
        for (i = 12; i < 16; i++) {
            if (i != this.robberPosition)
                this.tiles.push(new Location(i, locations[i], values[valIndex++], x, y));
            else
                this.tiles.push(new Location(i, locations[i], 0, x, y));
            x += tileWidth;
        }
        x -= 3.5 * tileWidth;
        y += tileHeight;
        for (i = 16; i < 19; i++) {
            if (i != this.robberPosition)
                this.tiles.push(new Location(i, locations[i], values[valIndex++], x, y));
            else
                this.tiles.push(new Location(i, locations[i], 0, x, y));
            x += tileWidth;
        }

        // Setup variables for storing used build sites
        this.usedBuildSites = [];
        this.usedRoadSites = [];
    }

/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

######## #### ##       ########
   ##     ##  ##       ##
   ##     ##  ##       ##
   ##     ##  ##       ######
   ##     ##  ##       ##
   ##     ##  ##       ##
   ##    #### ######## ########
*/

    // Function to draw a single tile and returns the array of vertex coordinates
    drawTile(location) {
        // Draw the hexagon and save it's array of vertices
        var vertexArray = this.drawHexagon(location.x, location.y, location.color);

        // Draw the number
        if (location.value !== 0) {
            if (location.value == 6 || location.value == 8)
                this.ctx.fillStyle = "red";
            else
                this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "black";
            this.ctx.font = "50px Arial";

            if (location.value < 10) {
                this.ctx.fillText(location.value, location.x + 47, location.y + 90);
                this.ctx.strokeText(location.value, location.x + 47, location.y + 90);
            } else {
                this.ctx.fillText(location.value, location.x + 33, location.y + 90);
                this.ctx.strokeText(location.value, location.x + 33, location.y + 90);
            }
        }

        return vertexArray; //return the array of vertex coordinates
    }


/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

##     ## ######## ##     ##    ###     ######    #######  ##    ##
##     ## ##        ##   ##    ## ##   ##    ##  ##     ## ###   ##
##     ## ##         ## ##    ##   ##  ##        ##     ## ####  ##
######### ######      ###    ##     ## ##   #### ##     ## ## ## ##
##     ## ##         ## ##   ######### ##    ##  ##     ## ##  ####
##     ## ##        ##   ##  ##     ## ##    ##  ##     ## ##   ###
##     ## ######## ##     ## ##     ##  ######    #######  ##    ##
*/

    // Function to draw a hexagon and returns an array with an array of vertex coordinates
    drawHexagon(x, y, fillColor) {
        var sideLength = 72;
        var hexagonAngle = 0.523598776; // 30 degrees in radians
        var hexHeight = Math.sin(hexagonAngle) * sideLength;
        var hexRadius = Math.cos(hexagonAngle) * sideLength;
        var hexRectangleHeight = sideLength + 2 * hexHeight;
        var hexRectangleWidth = 2 * hexRadius;
        var listOfVertexCoordinates = []; //array that will hold the vertices of the hexagon

        this.ctx.fillStyle = fillColor;
        this.ctx.beginPath();
        var v0 = [x + hexRadius, y]; //creates an array with the coordinates as entries
        this.ctx.moveTo(v0[0], v0[1]); //move to vertex 0
        listOfVertexCoordinates.push(v0); //pushes the coordinates array to the vertex array
        var v1 = [x + hexRectangleWidth, y + hexHeight];
        this.ctx.lineTo(v1[0], v1[1]); // move to vertex 1
        listOfVertexCoordinates.push(v1);
        var v2 = [x + hexRectangleWidth, y + hexHeight + sideLength];
        this.ctx.lineTo(v2[0], v2[1]); //move to vertex 2
        listOfVertexCoordinates.push(v2);
        var v3 = [x + hexRadius, y + hexRectangleHeight];
        this.ctx.lineTo(v3[0], v3[1]); //move to vertex 3
        listOfVertexCoordinates.push(v3);
        var v4 = [x, y + sideLength + hexHeight];
        this.ctx.lineTo(v4[0], v4[1]); //move to vertex 4
        listOfVertexCoordinates.push(v4);
        var v5 = [x, y + hexHeight];
        this.ctx.lineTo(v5[0], v5[1]); //move to vertex 5
        listOfVertexCoordinates.push(v5);
        this.ctx.closePath(); //close off the hexagon by going back to vertex 0

        this.ctx.fill();
        this.ctx.fillStyle = "black";
        this.ctx.stroke();

        return listOfVertexCoordinates; //returns the list of of vertices for the hexagon
        //(two-dimensional array that holds arrays of x and y pairs for each vertex)
    }


/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

 ######  #### ########   ######  ##       ########
##    ##  ##  ##     ## ##    ## ##       ##
##        ##  ##     ## ##       ##       ##
##        ##  ########  ##       ##       ######
##        ##  ##   ##   ##       ##       ##
##    ##  ##  ##    ##  ##    ## ##       ##
 ######  #### ##     ##  ######  ######## ########
*/

    // Function to draw a circle
    drawCircle(context, centerX, centerY, radius) {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = "lightgrey";
        context.fill();
        context.strokeStyle = "black";
        context.stroke();
    }


/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

########   #######  ########  ########  ######## ########
##     ## ##     ## ##     ## ##     ## ##       ##     ##
##     ## ##     ## ##     ## ##     ## ##       ##     ##
########  ##     ## ########  ########  ######   ########
##   ##   ##     ## ##     ## ##     ## ##       ##   ##
##    ##  ##     ## ##     ## ##     ## ##       ##    ##
##     ##  #######  ########  ########  ######## ##     ##
*/

    // Function to draw robber
    drawRobber() {
        var robberX = 2.11290323 * tileWidth,
            robberY = 1.11111111 * tileHeight;

        if (0 <= this.robberPosition && this.robberPosition < 3) {
            robberX += tileWidth * this.robberPosition;
        } else if (3 <= this.robberPosition && this.robberPosition < 7) {
            robberX += tileWidth * (this.robberPosition - 3) - 0.5 * tileWidth;
            robberY += tileHeight;
        } else if (7 <= this.robberPosition && this.robberPosition < 12) {
            robberX += tileWidth * (this.robberPosition - 7) - 1 * tileWidth;
            robberY += 2 * tileHeight;
        } else if (12 <= this.robberPosition && this.robberPosition < 16) {
            robberX += tileWidth * (this.robberPosition - 12) - 0.5 * tileWidth;
            robberY += 3 * tileHeight;
        } else {
            robberX += tileWidth * (this.robberPosition - 16);
            robberY += 4 * tileHeight;
        }

        this.drawCircle(this.ctx, robberX, robberY, 30);
    }

    /*
    ########  ########     ###    ##      ##
    ##     ## ##     ##   ## ##   ##  ##  ##
    ##     ## ##     ##  ##   ##  ##  ##  ##
    ##     ## ########  ##     ## ##  ##  ##
    ##     ## ##   ##   ######### ##  ##  ##
    ##     ## ##    ##  ##     ## ##  ##  ##
    ########  ##     ## ##     ##  ###  ###

     ######  ##       ####  ######  ##    ##    ###    ########  ##       ########  ######
    ##    ## ##        ##  ##    ## ##   ##    ## ##   ##     ## ##       ##       ##    ##
    ##       ##        ##  ##       ##  ##    ##   ##  ##     ## ##       ##       ##
    ##       ##        ##  ##       #####    ##     ## ########  ##       ######    ######
    ##       ##        ##  ##       ##  ##   ######### ##     ## ##       ##             ##
    ##    ## ##        ##  ##    ## ##   ##  ##     ## ##     ## ##       ##       ##    ##
     ######  ######## ####  ######  ##    ## ##     ## ########  ######## ########  ######
    */

    drawClickCorners() {
      for (var vertex=0; vertex<54; vertex++) {
        // Set color
        this.ctx.fillStyle = "transparent";
        // Draw the square
        this.ctx.fillRect(corners[vertex][0], corners[vertex][1], 25, 25);
      }
    }

/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

 ######  ######## ######## ######## ##       ######## ##     ## ######## ##    ## ########
##    ## ##          ##       ##    ##       ##       ###   ### ##       ###   ##    ##
##       ##          ##       ##    ##       ##       #### #### ##       ####  ##    ##
 ######  ######      ##       ##    ##       ######   ## ### ## ######   ## ## ##    ##
      ## ##          ##       ##    ##       ##       ##     ## ##       ##  ####    ##
##    ## ##          ##       ##    ##       ##       ##     ## ##       ##   ###    ##
 ######  ########    ##       ##    ######## ######## ##     ## ######## ##    ##    ##
*/

    // Function to draw a settlement
    drawSettlement(index, color) {
        // Set color
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = "black";

        // Get the coordinates of where to draw the settlement
        var x = 2 * tileWidth, y = 0.416666667 * tileHeight;

        if (0 <= index && index < 3) {
            x += tileWidth * index;
        } else if (3 <= index && index < 7) {
            x += tileWidth * (index - 3) - 0.5 * tileWidth;
            y += (1 / 4) * tileBigHeight;
        } else if (7 <= index && index < 11) {
            x += tileWidth * (index - 7) - 0.5 * tileWidth;
            y += (3 / 4) * tileBigHeight;
        } else if (11 <= index && index < 16) {
            x += tileWidth * (index - 11) - 1 * tileWidth;
            y += (4 / 4) * tileBigHeight;
        } else if (16 <= index && index < 21) {
            x += tileWidth * (index - 16) - 1 * tileWidth;
            y += (6 / 4) * tileBigHeight;
        } else if (21 <= index && index < 27) {
            x += tileWidth * (index - 21) - 1.5 * tileWidth;
            y += (7 / 4) * tileBigHeight;
        } else if (27 <= index && index < 33) {
            x += tileWidth * (index - 27) - 1.5 * tileWidth;
            y += (9 / 4) * tileBigHeight;
        } else if (33 <= index && index < 38) {
            x += tileWidth * (index - 33) - 1 * tileWidth;
            y += (10 / 4) * tileBigHeight;
        } else if (38 <= index && index < 43) {
            x += tileWidth * (index - 38) - 1 * tileWidth;
            y += (12 / 4) * tileBigHeight;
        } else if (43 <= index && index < 47) {
            x += tileWidth * (index - 43) - 0.5 * tileWidth;
            y += (13 / 4) * tileBigHeight;
        } else if (47 <= index && index < 51) {
            x += tileWidth * (index - 47) - 0.5 * tileWidth;
            y += (15 / 4) * tileBigHeight;
        } else if (51 <= index && index < 54) {
            x += tileWidth * (index - 51);
            y += (16 / 4) * tileBigHeight;
        } else {
            x = NaN;
            y = NaN;
        }

        // Draw the square
        this.ctx.fillRect(x, y, 25, 25);
        this.ctx.strokeRect(x, y, 25, 25);
    }

/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

########   #######     ###    ########
##     ## ##     ##   ## ##   ##     ##
##     ## ##     ##  ##   ##  ##     ##
########  ##     ## ##     ## ##     ##
##   ##   ##     ## ######### ##     ##
##    ##  ##     ## ##     ## ##     ##
##     ##  #######  ##     ## ########
*/
/*
  ### ########  #######     ########   #######  ###
 ##      ##    ##     ##    ##     ## ##     ##   ##
##       ##    ##     ##    ##     ## ##     ##    ##
##       ##    ##     ##    ##     ## ##     ##    ##
##       ##    ##     ##    ##     ## ##     ##    ##
 ##      ##    ##     ##    ##     ## ##     ##   ##
  ###    ##     #######     ########   #######  ###
*/

    //Function to draw roads
    drawRoad(edge, color) {
      //TODO
    }


/*
########  ########     ###    ##      ##
##     ## ##     ##   ## ##   ##  ##  ##
##     ## ##     ##  ##   ##  ##  ##  ##
##     ## ########  ##     ## ##  ##  ##
##     ## ##   ##   ######### ##  ##  ##
##     ## ##    ##  ##     ## ##  ##  ##
########  ##     ## ##     ##  ###  ###

 ######  #### ######## ##    ##
##    ##  ##     ##     ##  ##
##        ##     ##      ####
##        ##     ##       ##
##        ##     ##       ##
##    ##  ##     ##       ##
 ######  ####    ##       ##
*/

    // Function to draw a city
    drawCity(index, color) {
        // Set color
        this.ctx.fillStyle = color;
    }


/*
########  ######## ##    ## ########  ######## ########
##     ## ##       ###   ## ##     ## ##       ##     ##
##     ## ##       ####  ## ##     ## ##       ##     ##
########  ######   ## ## ## ##     ## ######   ########
##   ##   ##       ##  #### ##     ## ##       ##   ##
##    ##  ##       ##   ### ##     ## ##       ##    ##
##     ## ######## ##    ## ########  ######## ##     ##

########  ##          ###    ##    ## ######## ########   ######
##     ## ##         ## ##    ##  ##  ##       ##     ## ##    ##
##     ## ##        ##   ##    ####   ##       ##     ## ##
########  ##       ##     ##    ##    ######   ########   ######
##        ##       #########    ##    ##       ##   ##         ##
##        ##       ##     ##    ##    ##       ##    ##  ##    ##
##        ######## ##     ##    ##    ######## ##     ##  ######
*/

    // Render function
    render(players) {
        // Fill the background
        this.ctx.fillStyle = "LightSkyBlue";
        this.ctx.fillRect(0, 0, pageWidth, pageHeight);

        // Draw each tile and add it's array of vertices to the big array
        for (var i = 0; i < this.tiles.length; i++) {
            ArrayOfTileVerticesCoordinates.push(this.drawTile(this.tiles[i]));
        }

        fillCorners();

        // Draw the robber
        this.drawRobber();

        // Draw player names and scores
        var playerX = 800,
            playerY = 100;
        this.ctx.strokeStyle = "black";
        for (i = 0; i < players.length; i++) {
            this.ctx.fillStyle = players[i].color;
            this.ctx.font = "50px Arial";
            this.ctx.fillText(players[i].name + ": " + players[i].points, playerX, playerY);
            this.ctx.strokeText(players[i].name + ": " + players[i].points, playerX, playerY);
            playerY += 100;
        }

        this.drawClickCorners();

        // Draw all of the players settlements and cities
        for (i = 0; i < players.length; i++) {
            for (var j = 0; j < players[i].settlements.length; j++) {
                this.drawSettlement(players[i].settlements[j], players[i].color);
            }
            for (j = 0; j < players[i].cities.length; j++) {
                this.drawCity(players[i].cities[j], this.players[i].color);
            }
        }


        // TODO: Draw all of the players roads

    }
}

/*
######## #### ##       ##
##        ##  ##       ##
##        ##  ##       ##
######    ##  ##       ##
##        ##  ##       ##
##        ##  ##       ##
##       #### ######## ########

 ######   #######  ########  ##    ## ######## ########   ######
##    ## ##     ## ##     ## ###   ## ##       ##     ## ##    ##
##       ##     ## ##     ## ####  ## ##       ##     ## ##
##       ##     ## ########  ## ## ## ######   ########   ######
##       ##     ## ##   ##   ##  #### ##       ##   ##         ##
##    ## ##     ## ##    ##  ##   ### ##       ##    ##  ##    ##
 ######   #######  ##     ## ##    ## ######## ##     ##  ######

   ###    ########  ########     ###    ##    ##
  ## ##   ##     ## ##     ##   ## ##    ##  ##
 ##   ##  ##     ## ##     ##  ##   ##    ####
##     ## ########  ########  ##     ##    ##
######### ##   ##   ##   ##   #########    ##
##     ## ##    ##  ##    ##  ##     ##    ##
##     ## ##     ## ##     ## ##     ##    ##
*/

function fillCorners() {
  //add each vertex to the corners array
  if (!cornersFilled) {
    for (var i = 0; i <= 53; i++) {
      if (i < 3) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i][0][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i][0][1])-12]);
      }
      else if (i >= 3 && i < 6) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-3][5][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-3][5][1])-12]);
      }
      else if (i == 6) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[2][1][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[2][1][1])-12]);
      }
      else if (i >= 7 && i < 10) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-7][4][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-7][4][1])-12]);
      }
      else if (i == 10) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[2][2][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[2][2][1])-12]);
      }
      else if (i >= 11 && i < 15) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-8][5][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-8][5][1])-12]);
      }
      else if (i == 15) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[6][1][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[6][1][1])-12]);
      }
      else if (i >= 16 && i < 20) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-13][4][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-13][4][1])-12]);
      }
      else if (i == 20) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[6][2][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[6][2][1])-12]);
      }
      else if (i >= 21 && i < 26) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-14][5][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-14][5][1])-12]);
      }
      else if (i == 26) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[11][1][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[11][1][1])-12]);
      }
      else if (i >= 27 && i < 32) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-20][4][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-20][4][1])-12]);
      }
      else if (i == 32) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[11][2][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[11][2][1])-12]);
      }
      else if (i >= 33 && i < 37) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-21][5][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-21][5][1])-12]);
      }
      else if (i == 37) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[15][1][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[15][1][1])-12]);
      }
      else if (i >= 38 && i < 42) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-26][4][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-26][4][1])-12]);
      }
      else if (i == 42) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[15][2][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[15][2][1])-12]);
      }
      else if (i >= 43 && i < 46) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-27][5][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-27][5][1])-12]);
      }
      else if (i == 46) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[18][1][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[18][1][1])-12]);
      }
      else if (i >= 47 && i < 50) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-31][4][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-31][4][1])-12]);
      }
      else if (i == 50) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[18][2][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[18][2][1])-12]);
      }
      else if (i >= 51 && i <= 53) {
        corners.push([Math.round(ArrayOfTileVerticesCoordinates[i-35][3][0])-12,
          Math.round(ArrayOfTileVerticesCoordinates[i-35][3][1])-12]);
        if (i == 53) {
          cornersFilled = true;
          for (i=0; i<54; i++) {
            rects.push([corners[i][0]+8, corners[i][0]+32, corners[i][1]+8, corners[i][1]+32, 'none', true])
          }
        }
      }
    }
  }
}

/*
##     ##    ###    ##       #### ########
##     ##   ## ##   ##        ##  ##     ##
##     ##  ##   ##  ##        ##  ##     ##
##     ## ##     ## ##        ##  ##     ##
 ##   ##  ######### ##        ##  ##     ##
  ## ##   ##     ## ##        ##  ##     ##
   ###    ##     ## ######## #### ########

########  ##     ## #### ##       ########
##     ## ##     ##  ##  ##       ##     ##
##     ## ##     ##  ##  ##       ##     ##
########  ##     ##  ##  ##       ##     ##
##     ## ##     ##  ##  ##       ##     ##
##     ## ##     ##  ##  ##       ##     ##
########   #######  #### ######## ########
*/

//id=corner index
//type='none'/'settlement'/'city'
//initial=true/false for if it is the first turn or not
function validBuild(id, type, initial) {
    var settlementResources = true;
    var cityResources = true;
    //check if player has resources for a settlement
    if (!initial && (game.players[this.turn].resources.lumber<1 || game.players[this.turn].resources.brick<1
          || game.players[this.turn].resources.grain<1 || game.players[this.turn].resources.wool<1)) {
    settlementResources = false;
    }
    //check if player has resources for a city
    if (!initial && (game.players[this.turn].resources.grain<2 || game.players[this.turn].resources.ore<3)) {
      cityResources = false;
    }

    if (!rects[id][5]) {
      alert('That location cannot be built on');
    }
    else if (type=='settlement' && !settlementResources) {
      alert('You do not have enough resources to build a settlement');
    }
    else if (type=='city' && !cityResources) {
      alert('You do not have enough resources to build a city');
    }
    else if (rects[id][4]=='settlement' && type=='settlement') {
      alert('You cannot build a settlement on top of an existing settlement');
    }
    else if (rects[id][4]=='none' && type=='city') {
      alert('There must be a settlement to upgrade to a city');
    }
    else if (rects[id][4]=='settlement' && type=='city') {
      game.board.drawCity(id, game.players[game.turn].color);
      rects[id][4] = 'city';
      rects[id][5] = false;
    }
    else { //settlement being built
      game.board.drawSettlement(id, game.players[game.turn].color);
      rects[id][4]='settlement';
      if (!initial) {
        game.players[game.turn].resources.lumber -= 1;
        game.players[game.turn].resources.brick -= 1;
        game.players[game.turn].resources.grain -=1;
        game.players[game.turn].resources.wool -=1;
      }
      //change buildable status for vertices surrounding build location
      if (id==0) {
        rects[3][5]=false;
        rects[4][5]=false;
      }
      else if (id==1) {
        rects[4][5]=false;
        rects[5][5]=false;
      }
      else if (id==2) {
        rects[5][5]=false;
        rects[6][5]=false;
      }
      else if (id==3) {
        rects[0][5]=false;
        rects[7][5]=false;
      }
      else if (id==4) {
        rects[0][5]=false;
        rects[1][5]=false;
        rects[8][5]=false;
      }
      else if (id==5) {
        rects[1][5]=false;
        rects[2][5]=false;
        rects[9][5]=false;
      }
      else if (id==6) {
        rects[2][5]=false;
        rects[10][5]=false;
      }
      else if (id==7) {
        rects[3][5]=false;
        rects[11][5]=false;
        rects[12][5]=false;
      }
      else if (id==8) {
        rects[4][5]=false;
        rects[12][5]=false;
        rects[13][5]=false;
      }
      else if (id==9) {
        rects[5][5]=false;
        rects[13][5]=false;
        rects[14][5]=false;
      }
      else if (id==10) {
        rects[6][5]=false;
        rects[14][5]=false;
        rects[15][5]=false;
      }
      else if (id==11) {
        rects[7][5]=false;
        rects[16][5]=false;
      }
      else if (id==12) {
        rects[7][5]=false;
        rects[8][5]=false;
        rects[17][5]=false;
      }
      else if (id==13) {
        rects[8][5]=false;
        rects[9][5]=false;
        rects[18][5]=false;
      }
      else if (id==14) {
        rects[9][5]=false;
        rects[10][5]=false;
        rects[19][5]=false;
      }
      else if (id==15) {
        rects[10][5]=false;
        rects[20][5]=false;
      }
      else if (id==16) {
        rects[11][5]=false;
        rects[21][5]=false;
        rects[22][5]=false;
      }
      else if (id==17) {
        rects[12][5]=false;
        rects[22][5]=false;
        rects[23][5]=false;
      }
      else if (id==18) {
        rects[13][5]=false;
        rects[23][5]=false;
        rects[24][5]=false;
      }
      else if (id==19) {
        rects[14][5]=false;
        rects[24][5]=false;
        rects[25][5]=false;
      }
      else if (id==20) {
        rects[15][5]=false;
        rects[25][5]=false;
        rects[26][5]=false;
      }
      else if (id==21) {
        rects[16][5]=false;
        rects[27][5]=false;
      }
      else if (id==22) {
        rects[16][5]=false;
        rects[17][5]=false;
        rects[28][5]=false;
      }
      else if (id==23) {
        rects[17][5]=false;
        rects[18][5]=false;
        rects[29][5]=false;
      }
      else if (id==24) {
        rects[18][5]=false;
        rects[19][5]=false;
        rects[30][5]=false;
      }
      else if (id==25) {
        rects[19][5]=false;
        rects[20][5]=false;
        rects[31][5]=false;
      }
      else if (id==26) {
        rects[20][5]=false;
        rects[32][5]=false;
      }
      else if (id==27) {
        rects[21][5]=false;
        rects[33][5]=false;
      }
      else if (id==28) {
        rects[22][5]=false;
        rects[33][5]=false;
        rects[34][5]=false;
      }
      else if (id==29) {
        rects[23][5]=false;
        rects[34][5]=false;
        rects[35][5]=false;
      }
      else if (id==30) {
        rects[24][5]=false;
        rects[35][5]=false;
        rects[36][5]=false;
      }
      else if (id==31) {
        rects[25][5]=false;
        rects[36][5]=false;
        rects[37][5]=false;
      }
      else if (id==32) {
        rects[26][5]=false;
        rects[37][5]=false;
      }
      else if (id==33) {
        rects[27][5]=false;
        rects[28][5]=false;
        rects[38][5]=false;
      }
      else if (id==34) {
        rects[28][5]=false;
        rects[29][5]=false;
        rects[39][5]=false;
      }
      else if (id==35) {
        rects[29][5]=false;
        rects[30][5]=false;
        rects[40][5]=false;
      }
      else if (id==36) {
        rects[30][5]=false;
        rects[31][5]=false;
        rects[41][5]=false;
      }
      else if (id==37) {
        rects[31][5]=false;
        rects[32][5]=false;
        rects[42][5]=false;
      }
      else if (id==38) {
        rects[33][5]=false;
        rects[43][5]=false;
      }
      else if (id==39) {
        rects[34][5]=false;
        rects[43][5]=false;
        rects[44][5]=false;
      }
      else if (id==40) {
        rects[35][5]=false;
        rects[44][5]=false;
        rects[45][5]=false;
      }
      else if (id==41) {
        rects[36][5]=false;
        rects[45][5]=false;
        rects[46][5]=false;
      }
      else if (id==42) {
        rects[37][5]=false;
        rects[46][5]=false;
      }
      else if (id==43) {
        rects[38][5]=false;
        rects[39][5]=false;
        rects[47][5]=false;
      }
      else if (id==44) {
        rects[39][5]=false;
        rects[40][5]=false;
        rects[48][5]=false;
      }
      else if (id==45) {
        rects[40][5]=false;
        rects[41][5]=false;
        rects[49][5]=false;
      }
      else if (id==46) {
        rects[42][5]=false;
        rects[50][5]=false;
      }
      else if (id==47) {
        rects[43][5]=false;
        rects[51][5]=false;
      }
      else if (id==48) {
        rects[44][5]=false;
        rects[51][5]=false;
        rects[52][5]=false;
      }
      else if (id==49) {
        rects[45][5]=false;
        rects[52][5]=false;
        rects[53][5]=false;
      }
      else if (id==50) {
        rects[46][5]=false;
        rects[53][5]=false;
      }
      else if (id==51) {
        rects[47][5]=false;
        rects[48][5]=false;
      }
      else if (id==52) {
        rects[48][5]=false;
        rects[49][5]=false;
      }
      else if (id==53) {
        rects[49][5]=false;
        rects[50][5]=false;
      }

    }
}

/*
 ######  ##     ## ##     ## ######## ######## ##       ########
##    ## ##     ## ##     ## ##       ##       ##       ##
##       ##     ## ##     ## ##       ##       ##       ##
 ######  ######### ##     ## ######   ######   ##       ######
      ## ##     ## ##     ## ##       ##       ##       ##
##    ## ##     ## ##     ## ##       ##       ##       ##
 ######  ##     ##  #######  ##       ##       ######## ########

   ###    ########  ########     ###    ##    ##
  ## ##   ##     ## ##     ##   ## ##    ##  ##
 ##   ##  ##     ## ##     ##  ##   ##    ####
##     ## ########  ########  ##     ##    ##
######### ##   ##   ##   ##   #########    ##
##     ## ##    ##  ##    ##  ##     ##    ##
##     ## ##     ## ##     ## ##     ##    ##
*/

// Function to randomly shuffle an array
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
