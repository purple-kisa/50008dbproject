var express = require('express');
var path = require('path');
var db = require('./db');

var app = express();

//Static folder for all assets
app.use(express.static('public'));
//Set view engine
app.set('view engine', 'pug'); 

app.get('/', function (req, res) {
    db.connect();
    
    var query_result; 

    db.query_books('book',function(result){
        // console.log(result)
        query_result = result;
        // console.log(query_result)

        res.render('index.pug', {title:'Book Link', "search": {}, data: query_result});

    });

    db.query_book('book','0321370139',function(result){
       console.log(result)
    });
});
    // console.log("query result is " + query_result);    

app.post('/', function(request,response){
    var data = '';
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        console.log(post);
        db.registration('customer',post,function(result){
    	 	console.log(result)
  	    });
        response.writeHead(200, {'content-type': 'text/plain' });
        response.end()
    });
})




    //DB Examples
    //This function is called in app.js which is the main entry point to the website
  	// E.g Retrieving user database
  	 // db.query_database_all('book',function(result){
    //  	console.log(result)
  	 // });
    // E.g Registering a new user
    //  var post  = {name: 'Shaun1', user: 'hazel1111123', password:'grasdalls' , card_no:'1', address:'Science Park', phone_no:99999999};
  	 // db.registration('customer',post,function(result){
    // 	 	console.log(result)
  	 // });

app.get('/account/:user', function (req, res) {
    var user = req.params.user;
    db.connect();
    
    var query_result; 

    db.query_account('customer',user,function(result){
        query_result = result[0];
        console.log(query_result)

        res.render('account.pug', {title:'Your Account', "splash": {"base": "/img/test.png", "cover": "/img/cover_4_blur.jpg"}, data: query_result});

    });
});

app.get('/admin', function(req,res) {
    res.render('admin.pug', {title:"Admin Account", "splash": {"base": "/img/test.png", "cover": "/img/cover_4_blur.jpg"}})
}),

app.get('/cart', function(req, res) {
  res.render('cart.pug', {title:'Cart', "splash":{"base":"/img/test2.png", "cover":"/img/cover_4_blur.jpg"}})
});

app.get('/book/:isbn', function(req,res){
    var isbn = req.params.isbn;
    var query_result;
    db.connect();
    db.query_book('book',isbn,function(result){
      query_result = result[0];
      console.log(query_result)
      res.render('book.pug',  {title: query_result.title, splash:"/img/test3.png", data: query_result})
    });    
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

