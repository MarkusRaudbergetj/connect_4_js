const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;

const EMPTY_TILE = "textures/empty_tile.jpg"; 
const RED_TILE = "textures/red_tile.jpg"; 
const YELLOW_TILE = "textures/yellow_tile.jpg"; 

const EMPTY_CODE = 'e';
const RED_CODE = 'r';
const YELLOW_CODE = 'y';

const PLAYER_1 = "p1";
const PLAYER_2 = "p2";

const GAME_STATE_ROUTE = "/read";
const SET_GAME_STATE_ROUTE = "/write";
const PLAYER_ROUTE = "/player";
const SET_PLAYER_ROUTE = "/setPlayer";

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
            var row = parseInt(buttons[i].classList.item(1))
            makeMove(row);
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

function setTurnDisplay(plr) {
    var display = document.getElementById("turnDisplay");

    if(plr == PLAYER_1) {
        display.innerHTML = "Player 1's turn";
    } else if(plr == PLAYER_2) {
        display.innerHTML = "Player 2's turn";
    }
}

async function makeMove(row) {
    var tileCode = EMPTY_CODE
    var gameState = await readFile(GAME_STATE_ROUTE);
    var moveIdx = await getEmpyIndexInRow(row);
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

function modifyStr(original, mod, idx) {
    original = original.substring(0, idx) + mod + original.substring(idx + 1);
    return original;
}

async function getEmpyIndexInRow(row) {
    var state = await readFile(GAME_STATE_ROUTE);
    var lastIdx = -1;
    for(let i = row - 1; i < BOARD_WIDTH * BOARD_HEIGHT; i += BOARD_WIDTH) {
        if(state[i] != EMPTY_CODE) {
            break;
        }

        lastIdx = i;
    }

    return lastIdx;
}

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

async function setTurn(plr) {
    if (plr == PLAYER_1 || plr == PLAYER_2) {
        writeFile(plr, SET_PLAYER_ROUTE);
    }
}

async function getTurn() {
    var response = await fetch("/player");
    var text = response.text();
    return text;
}

async function readFile(route) {
    var response = await fetch(route);
    var text = response.text();
    return text;
}

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

function displayButtons() {
    var board = document.getElementById("bgrid");
    
    for(var i = 0; i < BOARD_WIDTH; i++) {
        board.innerHTML += `<button class=\"buttons ${i + 1}\"><img src=\"textures/downArror.jpg\"></button>`;
    }
}

function initBoard() {
    var board = document.getElementById("bgrid");
    for(var i = 0; i < BOARD_HEIGHT; i++) {
        for(var j = 0; j < BOARD_WIDTH; j++) {
            board.innerHTML += "<img class=\"board tile\" src=\"textures/empty_tile.jpg\" alt=\"default\">";
        }
    }
}