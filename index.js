const express = require('express');
const bodyParser = require('body-parser');

const thorndike = require('./thorndike');

const app = express();
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.get('/thorndike', (req, res) => {
  res.send('Thorndike accessible by post only');
})

app.post('/thorndike', thorndike);

app.listen(3000, () => console.log('Thorndike listening on port 3000'))