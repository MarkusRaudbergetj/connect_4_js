// Board messurements
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;

// File paths for the Tile jpgs
const EMPTY_TILE = "textures/empty_tile.jpg"; 
const RED_TILE = "textures/red_tile.jpg"; 
const YELLOW_TILE = "textures/yellow_tile.jpg"; 

// Codes, representing the color of a tile
const EMPTY_CODE = 'e';
const RED_CODE = 'r';
const YELLOW_CODE = 'y';

// Name of the two players
const PLAYER_1 = "p1";
const PLAYER_2 = "p2";

// Routes set up in the server.js file
const GAME_STATE_ROUTE = "/read";
const SET_GAME_STATE_ROUTE = "/write";
const PLAYER_ROUTE = "/player";
const SET_PLAYER_ROUTE = "/setPlayer";

/**
 * Set up the main gameloop by adding EventListeners and updates each players display every 500 ms
 * if the turn has changed using setTurn()
 */
window.onload = async function() {
    await displayButtons();
    await initBoard();
    await displayFile();
    await setTurnDisplay(await getTurn());
    
    document.getElementById(PLAYER_1).addEventListener('change', function () {
        if(this.checked) {
            setLocalPlayer(PLAYER_1);
        }
    })

    document.getElementById(PLAYER_2).addEventListener('change', function() {
        if(this.checked) {
            setLocalPlayer(PLAYER_2);
        }
    })

    var buttons = document.getElementsByClassName("buttons")

    for(let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', () => {
            var colum = parseInt(buttons[i].classList.item(1))
            makeMove(colum);
        });
    }

    var turn = await getTurn();
    var lastTurn = turn

    setInterval(async () => {
        turn = await getTurn();
        if (turn != lastTurn) {
            setTurnDisplay(turn);
            displayFile();
        }
        lastTurn = turn;
    }, 500)

    
};

/**
 * Sets the Turn displays innerHTML to display whoese turn it is
 * @param {String} plr the player whose name is displayed on the Turn display
 */
function setTurnDisplay(plr) {
    var display = document.getElementById("turnDisplay");

    if(plr == PLAYER_1) {
        display.innerHTML = "Player 1's turn";
    } else if(plr == PLAYER_2) {
        display.innerHTML = "Player 2's turn";
    }
}

/**
 * places a piece in the last free tile in an inputted row
 * @param {Number} colum which colum the player places a piece 
 * @returns {Promise<boolean>} returns wheater or not the move was succesful
 */
async function makeMove(colum) {
    var tileCode = EMPTY_CODE
    var gameState = await readFile(GAME_STATE_ROUTE);
    var moveIdx = await getEmpyIndexIncolum(colum);
    var plr = await getLocalPlayer();
    var turn = await getTurn();

    if(!plr || moveIdx == -1 || plr != turn) {
        return false;
    }

    if(plr == PLAYER_1) {
        tileCode = RED_CODE;
        await setTurn(PLAYER_2);
    }
    if(plr == PLAYER_2) {
        tileCode = YELLOW_CODE;
        await setTurn(PLAYER_1);
    }

    gameState = modifyStr(gameState, tileCode, moveIdx);

    await writeFile(gameState, SET_GAME_STATE_ROUTE);
    return true;
}

/**
 * overwrites a char/string in a string at a inputted index
 * @param {String} original the original string
 * @param {String} mod the char/string 
 * @param {Number} idx the index where mod is overidden
 * @returns {String} the modified string
 */
function modifyStr(original, mod, idx) {
    original = original.substring(0, idx) + mod + original.substring(idx + 1);
    return original;
}

/**
 * Calculates the index of the last free tile in a colum
 * @param {Number} colum the number of the colum
 * @returns {Number} the calulated index
 */
async function getEmpyIndexIncolum(colum) {
    var state = await readFile(GAME_STATE_ROUTE);
    var lastIdx = -1;
    for(let i = colum - 1; i < BOARD_WIDTH * BOARD_HEIGHT; i += BOARD_WIDTH) {
        if(state[i] != EMPTY_CODE) {
            break;
        }

        lastIdx = i;
    }

    return lastIdx;
}

/**
 * Set the local player and checks the checkboxes correctly
 * @param {String} plr the player which is selected
 */
function setLocalPlayer(plr) {
    var box1 = document.getElementById(PLAYER_1);
    var box2 = document.getElementById(PLAYER_2);

    if(plr == PLAYER_1) {
       box1.checked = true;
       box2.checked = false; 
    }
    if(plr == PLAYER_2) {
        box1.checked = false;
        box2.checked = true;
    }
}

/**
 * Reads the checkbox states and calulates the selected player
 * @returns the selected player
 */
function getLocalPlayer() {
    var box1 = document.getElementById(PLAYER_1);
    var box2 = document.getElementById(PLAYER_2);

    var p1State = box1.checked;
    var p2State = box2.checked;

    if(p1State) {
        return PLAYER_1;
    }
    if(p2State) {
        return PLAYER_2;
    }

    return false;
}

/**
 * writes an inputed text to a file on the server using an inputted route
 * @param {String} text2write the text to write
 * @param {String} route the route
 */
async function writeFile(text2write, route) {
    var response = await fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text2write })
    });
    const result = await response.text();
}

/**
 * sets the turn to the inputted player and writes it to the player.txt file on the server
 * @param {String} plr the player
 */
async function setTurn(plr) {
    if (plr == PLAYER_1 || plr == PLAYER_2) {
        writeFile(plr, SET_PLAYER_ROUTE);
    }
}

/**
 * Reads the player.txt
 * @returns {String} the players name whose turn it is
 */
async function getTurn() {
    var response = await fetch("/player");
    var text = response.text();
    return text;
}

/**
 * Reads a file on the server using an inputted route
 * @param {String} route the route
 * @returns {String} the read text
 */
async function readFile(route) {
    var response = await fetch(route);
    var text = response.text();
    return text;
}

/**
 * Reads the gamestate from the server and adjusts the images of the tile
 * according to the gamestate values
 */
async function displayFile() {
    var tiles = document.getElementsByClassName("tile");
    var data = await readFile(GAME_STATE_ROUTE); 
    for(let i = 0; i < BOARD_HEIGHT * BOARD_WIDTH; i++) {
        var item = tiles.item(i);
        switch (data[i]) {
            case RED_CODE:
                item.src = RED_TILE;
                break;
            case YELLOW_CODE:
                item.src = YELLOW_TILE;
                break;
            default:
                item.src = EMPTY_TILE;
        }
        item.alt = "modified";
    }
}

/**
 * Resets the gamestate to all empty tiles and sets the turn to the other player
 */
async function clearBoard() {
    var str = ""
    for(let i = 0; i < BOARD_HEIGHT * BOARD_WIDTH; i++) {
        str = modifyStr(str, EMPTY_CODE, i);
    }
    await writeFile(str, SET_GAME_STATE_ROUTE);
    await displayFile();

    if(await getTurn() == PLAYER_1) {
        setTurn(PLAYER_2);
    } else {
        setTurn(PLAYER_1);
    }
}

/**
 * Generates the buttons in the "bgrid" div
 */
function displayButtons() {
    var board = document.getElementById("bgrid");
    
    for(var i = 0; i < BOARD_WIDTH; i++) {
        board.innerHTML += `<button class=\"buttons ${i + 1}\"><img src=\"textures/downArror.jpg\"></button>`;
    }
}

/**
 * Generates all tiles in the "bgrid" div
 */
function initBoard() {
    var board = document.getElementById("bgrid");
    for(var i = 0; i < BOARD_HEIGHT; i++) {
        for(var j = 0; j < BOARD_WIDTH; j++) {
            board.innerHTML += "<img class=\"board tile\" src=\"textures/empty_tile.jpg\" alt=\"default\">";
        }
    }
}