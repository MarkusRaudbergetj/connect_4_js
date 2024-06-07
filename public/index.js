window.onload = function() {
    setInterval(function() {
        displayFile();
    }, 100);
};

async function writeFile(text2write) {
    try {
        var response = await fetch("/write", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text2write })
        });
        const result = await response.text();
        console.log("Wrote: ", result);
    } catch(error) {
        console.error(error);
    }
}

async function readFile() {
    var response = await fetch("/read");
    var text = response.text();
    return text;
}

async function displayFile() {
    console.log("Started");
    var display = document.getElementById("display");
    const response = await fetch("/read");
    const content = await response.text();
    display.innerHTML = content;
    console.log(display.innerHTML + " " + content);
}

async function add1() {
    console.log("Calling add1");
    var text = await readFile();
    var number = parseInt(text);
    if(isNaN(number)) {
        number = 0;
    } else {
        number++;
    }

    await writeFile(number.toString());
    await displayFile();
}