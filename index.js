const express = require('express');
const app = express();

var port = 8080;

app.listen(port, ()=> console.log('listen at port' + port));
app.use(express.static('public'));