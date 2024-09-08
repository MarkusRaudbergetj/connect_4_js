const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function read(path, res) {
    fs.readFile(path, 'utf-8', (err, data) => {
        if(err) {
            res.status(500).send('Error reading file');
        } else {
            res.send(data);
        }
    })
}

function write(path, text, res) {
    fs.writeFile(path, text, (err) => {
        if(err) {
            res.status(500).send("Error writing file");
        } else {
            res.send("File written succesfully");
        }
    })
}

app.get('/player', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'player.txt');
    read(filePath, res);
})

app.get('/read', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'state.txt');
    read(filePath, res);
});

app.get('/', function(req,res) {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
	    res.send(data);
    });
})

app.post('/setPlayer', (req, res) => {
    const filepath = path.join(__dirname, 'data', 'player.txt');
    const { text } = req.body;
    write(filepath, text, res);
})

app.post('/write', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'state.txt');
    const { text } = req.body;
    write(filePath, text, res);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
