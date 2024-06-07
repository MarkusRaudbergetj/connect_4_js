const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Endpoint to read a file
app.get('/read', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'state.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
        } else {
            res.send(data);
        }
    });
});

// Endpoint to write to a file
app.post('/write', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'state.txt');
    const { text } = req.body;
    fs.writeFile(filePath, text, (err) => {
        if (err) {
            res.status(500).send('Error writing file');
        } else {
            res.send('File written successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});