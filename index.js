// Create an express server with websocket support

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


app.use((req, res, next) => {
    const filePath = path.join(__dirname, "generated-html", req.url);

    if (path.extname(filePath) === '.html' && fs.existsSync(filePath)) {
        // Read the HTML file
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const address = server.address().address.replace('::', 'localhost');
        const port = server.address().port;
        const injectHtmlContent = fs.readFileSync(path.join(__dirname, 'inject.html'), 'utf-8').replace("{{address}}", `${address}:${port}`);
        // Inject your HTML here, for example, adding a script tag
        const injectedHtml = htmlContent.replace('</head>', `${injectHtmlContent}</head>`);

        // Set the modified HTML as the response
        res.send(injectedHtml);
    } else {
        // Continue to the next middleware if it's not an HTML file
        next();
    }
});

app.use(express.static(path.join(__dirname, 'generated-html')));

app.use('/reload', () => {
    wss.clients.forEach((client) => {
        client.send('reload')
    })
})
const clients = []
wss.on('connection', function connection(ws) {
    clients.push(ws)
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
}
);
wss.on('close', function close(ws) {
    console.log('disconnected');
    clients.splice(clients.indexOf(ws), 1)
}
);

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
}
);
