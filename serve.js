var express = require('express');
var app = express();

app.use(express.static('feed/mp3/'));
app.listen(8000);
