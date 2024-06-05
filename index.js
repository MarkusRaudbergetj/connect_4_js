var response;

/*async function modifyFile(filePath, ammount) {
    response = await fetch(filePath);
    var content = await response.text();

    content += ammount;

    const formData = new FormData();
    formData.append('fileContent', content);
    try {
        await fetch('/modifyFile', {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error(error);
    }
    
}*/
async function readFile(filePath) {
    response = await fetch(filePath);
    return await response.text()
}

async function displayFile(/*ammount*/) {
    console.log("Started");
    var display = document.getElementById("display");
    var file = "state.txt";
    //await modifyFile("state.txt", "yes");
    var content = " ";

    setInterval(async () => {
        var newText = await readFile(file);
        if(newText !== content) {
            content = newText;
            display.innerHTML = content;
            console.log("Updated!");
        }
    }, 100);
    console.log("done");
}

window.onload = function() {
    displayFile();
}