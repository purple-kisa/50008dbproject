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
    console.log(typeof sess.query_result=== "undefined");

    if (typeof sess.query_result==="undefined") {
        console.log("in if clause");
        db.query_books('book',function(result){
            // console.log(result)
            query_result = result;
            // console.log(query_result)
            res.render('index.pug', {title:'Book Link', "search": {}, data: query_result, user: sess.user, cart:sess.cart});
        });
    } else {
        query_result = sess.query_result;
        console.log(query_result.length);
        if(query_result.length!=0) {
            res.render('index.pug', {title:'Book Link', "search": {}, data: query_result, user: sess.user, cart:sess.cart});
        } else {
            res.render('index.pug', {title:'Book Link', "search": {}, user: sess.user, cart:sess.cart});
        }
    }


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

    //Admin invoice details retrieval
    // db.admin_invoice_details(function(result){
    //     console.log(result)
    // });
    // var data = {status: 'douche', number: '9'}
    // db.update_invoice_status(data, function(result1){
    //     console.log(result1)
    // })

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

    //Q5
    // var data5 = {ISBN: '1234567890', copies: 3}
    // db.update_book_copies(data5, function(result5){
    //     console.log(result5)
    // })

    //Q7
    // var data7_1 = {ISBN: '1234567890'}
    // db.feedback_retrival(data7_1, function(result7_1){
    //     console.log(result7_1)
    // })
    // var data7_2 = {ISBN: '193659420X', user_feedback: 'Sulfish', user_rate: 'sabbath65', rate: '1'}
    // db.rating_recording(data7_2, function(result7_2){
    //     console.log(result7_2)
    // })

    //Q9
    // var data9 = {ISBN: '193659420X', n: 1}
    // db.useful_feedback_retrival(data9, function(result9){
    //     console.log(result9)
    // })
});
    // console.log("query result is " + query_result);    

app.post('/register', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        console.log(post);
        db.registration('customer',post,function(result){
    	console.log(result)
        if (result=="Success") {//IF SUCCESSFUL REGISTER: 
            sess.user=post.user; 
            response.writeHead(200, {'content-type': 'text/plain' });
            response.end()
        } else {
            response.writeHead(400, {'content-type': 'text/plain' });
            response.end()
        }
  	    });
    });
});

app.post('/signIn', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        console.log(post)
        db.sign_in(post.user,post.password,function(result){
        console.log(result)
        if (result=="Success") {//IF SUCCESSFUL REGISTER: 
            sess.user=post.user; 
            response.writeHead(200, {'content-type': 'text/plain' });
            response.end()
        } else {
            response.writeHead(400, {'content-type': 'text/plain' });
            response.end()
        }
        });
    });
});

app.post('/submitorder', function(req, res) {
    sess = req.session;
    var data_invoice = {date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0], status:'Ordered' , user:sess.user}
    var data  = sess.cart;  
    console.log("invoice"); 
    console.log(data_invoice);
    console.log("data"); 
    console.log(data);
    db.order('invoice', data_invoice, function(result){
        console.log(result)
        for (i = 0; i < data.length; i++){
            var content_data = {date: data_invoice.date, user: data_invoice.user, ISBN: data[i].isbn, copies: data[i].copies}
            console.log("content data"); 
            console.log(content_data);
            db.content('content', content_data, function(result1){
                console.log(result1)
            });
            db.book_decrease(data[i].copies,data[i].isbn,function(result){
                console.log(result)
            });  
        }
    sess.cart = null;
    console.log("sess.cart"); 
    console.log(sess.cart);
    res.writeHead(200, {'content-type': 'text/plain' });
    res.end()

    });
})

app.post('/search', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        var result;
        if (post.sort == 0){
            db.book_browsing(post,function(result){
             console.log("Default Search")
             console.log(result)
             sess.query_result = result;
            response.redirect('/'); 
            });
        }
        else if(post.sort == 1){
            db.book_browsing_year(post,function(result){
                console.log("Sort by year")
                console.log(result)
                sess.query_result = result;
                response.redirect('/'); 
            });
        }
        else{
            db.book_browsing_avg_feedback(post,function(result){
                console.log("Sort by average feedback")
                console.log(result)
                sess.query_result = result;
                response.redirect('/'); 
            });
        }
        console.log(sess.query_result);
        // response.redirect('/'); 
        // response.writeHead(200, {'content-type': 'text/plain' });
        // response.end()
    });
});

app.post('/addBook', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        db.new_book(post,function(result){
            console.log(result);
            sess.query_result = result;
            if (typeof result !== 'string') {
              console.log("Book is added.");
              response.writeHead(200, {'content-type': 'text/plain' });
              response.end()
            } else {
              response.writeHead(400, {'content-type': 'text/plain' });
              response.write(result);
              response.end('\n');
            }
            
        });
    });
});

app.put('/updateBookCount', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        db.update_book_copies(post,function(result){
            console.log(result);
            sess.query_result = result;
            if (result.substring(0,5) !== 'Error') {
              console.log("Book copies added");
              response.writeHead(200, {'content-type': 'text/plain' });
              response.write(result);
              response.end('\n');
            } else {
              response.writeHead(400, {'content-type': 'text/plain' });
              response.write(result);
              response.end('\n');
            }
            
        });
    });
});


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
    var customerData;
    var orderData;
    var feedbackData;
    var ratingData;

    db.query_order(user,function(result){
        console.log('order');
        console.log(result);
        orderData = result;
        db.query_feedback(user,function(result){
            console.log('feedback');
            console.log(result);
            feedbackData = result;
            db.query_rating(user,function(result){
                console.log('rating');
                console.log(result);
                ratingData = result;
                db.query_account('customer',user,function(result){
                    customerData = result[0];
                    console.log(customerData)
                  
                    res.render('account.pug', {title:'Your Account', customerData: customerData, orderData: orderData, feedbackData: feedbackData, ratingData: ratingData, user: sess.user, cart:sess.cart});
                });
            }); 
        });
    });
    
});

app.get('/admin', function(req,res) {

    // random data for testing
    var data = {
      name: 'Jun Sheng',
      user: 'bimaowangzi',
      password: 'password3',
      card_no: '3530111333300000',
      address: '15 Lame Street',
      phone_no: 89321109 };

    res.render('admin.pug', {title:"Admin Account", user:sess.user, cart:sess.cart, data:data})
});

app.post('/addToCart', function(req,res) {
    var data = '';
    sess=req.session;
    req.addListener('data', function(chunk) { data += chunk; });
    req.addListener('end', function() {
        post = JSON.parse(data);
        console.log("post");
        console.log(post);
        if (sess.cart!=undefined) {
            sess.cart.push(post);
        } else {
            sess.cart=[post]
        }
        res.writeHead(200, {'content-type': 'text/plain' });
        res.end()
        
        console.log("cart");
        console.log(sess.cart);
    });
});

app.post('/cart', function(req,res) {
    var data='';
    sess=req.session;
    req.addListener('data', function(chunk) { data += chunk; });
    req.addListener('end', function() {
        post = JSON.parse(data);
        for (i=0; i<sess.cart.length;++i) {
            console.log(sess.cart[i]);
            console.log(post.book_isbn)
            if (sess.cart[i].isbn==post.book_isbn) {
                sess.cart.splice(i,1)
            }
        }
        res.writeHead(200, {'content-type': 'text/plain' });
        res.end()
    });

});

app.get('/cart', function(req, res) {
  sess=req.session;
  console.log(sess.cart);  
  res.render('cart.pug', {title:'Cart', "splash":{"base":"/img/test2.png", "cover":"/img/cover_4_blur.jpg"}, user:sess.user, cart:sess.cart})
});

app.get('/signOut', function(req,res){
    req.session.destroy(function(err) { 
      if(err) { 
        console.log(err); 
      } else { 
        res.redirect('/'); 
      } 
    });
});

app.get('/book/:isbn', function(req,res){
    var isbn = req.params.isbn;
    console.log(isbn);  
    sess=req.session;
    var query_result;
    db.connect();
    db.query_book('book',isbn,function(result){
      query_result = result[0];
      if(query_result!=undefined) {
        db.feedback_retrival(isbn,function(result){
            console.log("feedback");
            console.log(result);
            console.log(isbn)

            res.render('book.pug',  {title: query_result.title, data: query_result, user: sess.user, cart:sess.cart, feedback_data: result})
        });  
      }
    });    
});

app.post('/submitReview', function(req,res){
    var data ='';
    sess=req.session;
    req.addListener('data', function(chunk) { data += chunk; });
    req.addListener('end', function() {
        post = JSON.parse(data);
        db.feedback_recording(post,function(result){
            console.log(result)
        if (result=="Feedback submitted successfully") {
            res.writeHead(200, {'content-type': 'text/plain' });
            res.end();
        } else {
            res.writeHead(400, {'content-type': 'text/plain' });
            res.end();
        }
        });
    });
});

app.post('/rating', function(req,res) {
    var data ='';
    sess=req.session;
    req.addListener('data', function(chunk) { data += chunk; });
    req.addListener('end', function() {
        post = JSON.parse(data);
        console.log("rating function")
        console.log(post);
        db.rating_recording(data, function(result){
            console.log("meow?");
            console.log(result)
        });

    });    
    res.writeHead(200, {'content-type': 'text/plain' });
    res.end();

});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

