// Load HTTP module
const http = require("http");
const ejs = require('ejs');

const hostname = "127.0.0.1";
const port = 3000;

// Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {
    // Set the response HTTP header with HTTP status and Content type
    let people = ['nolann', 'remi', 'matthias'];
    let html = ejs.render('<%= people.join(", "); %>', { people: people });
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(html);
});

// Listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});