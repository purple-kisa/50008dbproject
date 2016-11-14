var express = require('express');
var path = require('path');

var app = express();

//Static folder for all assets
app.use(express.static('public'));
//Set view engine
app.set('view engine', 'pug'); 

app.get('/', function (req, res) {
    res.render('index.pug', {title:'Book Link'});
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

