var express = require('express');
var path = require('path');
var db = require('./db');
var session = require('express-session')

var app = express();

//Static folder for all assets
app.use(express.static('public'));
//Set view engine
app.set('view engine', 'pug'); 

app.use(session({ secret: 'ilovesamssamsamssams' })); // session secret 
var sess;

app.get('/', function (req, res) {
    sess= req.session; 
    if (sess.user) { 
        console.log("signed in as "+sess.user); 
    } else { 
        console.log("not signed in"); 
    } 

    db.connect();
    
    var query_result; 

    db.query_books('book',function(result){
        // console.log(result)
        query_result = result;
        // console.log(query_result)

        res.render('index.pug', {title:'Book Link', "search": {}, data: query_result});

    });


    //TODO: PROPER SIGN IN AND SIGN OUT 
    //IF PROPER SIGN IN: sess.user = <username> 
    //IF SIGN OUT:  
    //app.get('/logout',function(req,res){ 
    // req.session.destroy(function(err) { 
    //   if(err) { 
    //     console.log(err); 
    //   } else { 
    //     res.redirect('/'); 
    //   } 
    // }); 


    // Q2
    // var data_invoice = {date: '1026-01-01', status:'grasdalls' , user:'Sulfish'}
    // var data  = [{ISBN: '0071635262', copies: '6'},
    //             {ISBN: '0072392657', copies: '1'}];
    // db.order('invoice', data_invoice, function(result){
    //         console.log(result)
    //         for (i = 0; i < data.length; i++){
    //             var content_data = {date: data_invoice.date, user: data_invoice.user, ISBN: data[i].ISBN, copies: data[i].copies}
    //             db.content('content', content_data, function(result1){
    //             console.log(result1)
    //             });
    //         }
    // });

    //Q3
    // db.query_account('customer',"Sulfish",function(result){
    //     console.log(result)
    // });
    // db.query_order('Sulfish',function(result){
    //     console.log(result)
    // });
    // db.query_feedback('Sulfish',function(result){
    //     console.log(result)
    // });
    // db.query_rating('Sulfish',function(result){
    //     console.log(result)
    // });

    //Q4
    // var data = {ISBN: '1234567890', title: 'Shaun the Sheep', authors: 'Shaun C.', publisher: 'SUTD', year_pub: '2016', copies: '189', price: '1.00', tag: 'homo', format: 'hardcopy', subject: 'sexuality', image: 'http://placekitten.com/400/500'};
    // db.new_book(data, function(result){
    //     console.log(result)
    // });
});
    // console.log("query result is " + query_result);    

app.post('/register', function(request,response){
    var data = '';
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        console.log(post);
        db.registration('customer',post,function(result){
    	 	console.log(result)
  	    });
        //IF SUCCESSFUL REGISTER: 
        sess.user=post.user; 
        response.writeHead(200, {'content-type': 'text/plain' });
        response.end()
    });
})

app.post('/signIn', function(request,response){
    var data = '';
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        console.log(post)
        db.sign_in(post.user,post.password,function(result){
            console.log(result)
            if (result == "Success") {
                    sess.user = post.user;
                }
        response.writeHead(200, {'content-type': 'text/plain' });
        response.end()
    });
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

