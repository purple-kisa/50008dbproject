var express = require('express');
var path = require('path');
var db = require('./db')

var app = express();

//Static folder for all assets
app.use(express.static('public'));
//Set view engine
app.set('view engine', 'pug'); 

app.get('/', function (req, res) {
    res.render('index.pug', {title:'Book Link', "splash": {"base": "http://placekitten.com/1920/1280", "cover": "img/cover_4_blur.jpg"}});

    //DB Examples
    //This function is called in app.js which is the main entry point to the website
  	db.connect();
    // E.g Retrieving user database
  	db.query_database_all('customer',function(result){
    	console.log(result[0])
  	});
    // E.g Registering a new user
    var post  = {name: 'Shaun', user: 'heartstone_noob1993', password:'grills' , card_no:'1', address:'Science Park', phone_no:99999999};
  	db.insert_database_tuple('customer',post,function(result){
   	 	console.log(result)
  	});
});

app.get('/account', function (req, res) {
    res.render('account.pug', {title:'Your Account', "splash": {"base": "img/test.png", "cover": "img/cover_4_blur.jpg"}});
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

