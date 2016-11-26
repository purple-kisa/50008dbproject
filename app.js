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
  	// db.query_database_all('customer',function(result){
   //  	console.log(result[0])
  	// });
    // E.g Registering a new user
    //  var post  = {name: 'Shaun1', user: 'hazel1111123', password:'grasdalls' , card_no:'1', address:'Science Park', phone_no:99999999};
  	 // db.registration('customer',post,function(result){
    // 	 	console.log(result)
  	 // });
     db.query_books('book',function(result){
        console.log(result)
      });
});

app.get('/account', function (req, res) {
    res.render('account.pug', {title:'Your Account', "splash": {"base": "img/test.png", "cover": "img/cover_4_blur.jpg"}});
});

app.get('/admin', function(req,res) {
    res.render('admin.pug', {title:"Admin Account", "splash": {"base": "img/test.png", "cover": "img/cover_4_blur.jpg"}})
}),

app.get('/cart', function(req, res) {
  res.render('cart.pug', {title:'Cart', "splash":{"base":"img/test2.png", "cover":"img/cover_4_blur.jpg"}})
});

app.get('/book/:booktitle', function(req,res){
  res.render('book.pug',  {title: "Get Book Title from MySQL", splash:"/img/test3.png", booktitle: req.params.booktitle})
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

