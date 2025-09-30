const express = require('express');
const ejs = require('ejs');

const app = express();
const hostname = "127.0.0.1";
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname); // Assumes chat.ejs is in 'src/views'
app.use(express.static('src/public'));

// Route to render chat.ejs
app.get('/', (req, res) => {
    res.render('routes/index');
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
