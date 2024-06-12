window.onload = function() {
    initBoard();
};

async function writeFile(text2write) {
    var response = await fetch("/write", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text2write })
    });
    const result = await response.text();
}

async function readFile() {
    var response = await fetch("/read");
    var text = response.text();
    return text;
}

async function displayFile() {
    // ...
}

function initBoard() {
    var board = document.getElementById("bgrid");
    for(var i = 0; i < 6; i++) {
        for(var j = 0; j < 7; j++) {
            board.innerHTML += "<img class=\"board\" src=\"textures/placeholder.jfif\" alt=\"what\">";
        }
    }
}