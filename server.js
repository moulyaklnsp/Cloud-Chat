const express = require('express');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Create uploads dir if not exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Static files (serve index.html)
app.use(express.static(__dirname));

// Local media upload endpoint (mocks S3)
app.post('/upload', upload.single('file'), (req, res) => {
    const fileName = req.file.filename + path.extname(req.file.originalname);
    fs.renameSync(req.file.path, `uploads/${fileName}`);
    res.json({ url: `http://localhost:3000/uploads/${fileName}` });
});

// WebSocket server (mocks API Gateway, broadcasts messages)
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

app.listen(3000, () => console.log('Local server running on http://localhost:3000'));