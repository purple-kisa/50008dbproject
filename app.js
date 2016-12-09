var express = require('express');
var path = require('path');
var db = require('./db');
var session = require('express-session')

var app = express();

//Static folder for all assets
app.use(express.static('public'));
//Set view engine
app.set('view engine', 'pug'); 

app.use(session({ secret: 'sessionsecret' })); // session secret 
var sess;
var admin_status = false; 

app.get('/', function (req, res) {
    sess= req.session;
    if (sess.user) { 
        console.log("signed in as "+sess.user); 
        if (sess.user == 'admin') {
            admin_status = true;
        }
    } else { 
        console.log("not signed in"); 
    } 

    db.connect();
    
    var query_result;

    if (typeof sess.query_result==="undefined") {
        db.query_books('book',function(result){
            query_result = result;
            res.render('index.pug', {title:'Book Link', "search": {}, data: query_result, user: sess.user, cart:sess.cart, admin: admin_status});
        });
    } else {
        query_result = sess.query_result;
        if(query_result.length!=0) {
            res.render('index.pug', {title:'Book Link', "search": {}, data: query_result, user: sess.user, cart:sess.cart, admin: admin_status});
        } else {
            res.render('index.pug', {title:'Book Link', "search": {}, user: sess.user, cart:sess.cart, admin: admin_status});
        }
    }
});

app.post('/register', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        db.registration('customer',post,function(result){
            console.log("registration");
        	console.log(result)
            if (result.indexOf("Successfully Registered User: ")!==-1) {//IF SUCCESSFUL REGISTER: 
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
        db.sign_in(post.user,post.password,function(result){
            console.log("sign in");
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
    db.order('invoice', data_invoice, function(result){
        console.log("order")
        console.log(result)
        for (i = 0; i < data.length; i++){
            var content_data = {date: data_invoice.date, user: data_invoice.user, ISBN: data[i].isbn, copies: data[i].copies}
            db.content('content', content_data, function(result1){
                console.log("content")
                console.log(result1)
            });
            db.book_decrease(data[i].copies,data[i].isbn,function(result){
                console.log("book decrease")
                console.log(result)
            });  
        }
    sess.cart = null;
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
                db.book_browsing(post, function(result2) {
                    var to_remove = [];
                    for(i=0; i<result2.length; i++) {
                        for(j=0; j<result.length; j++) {
                            if(result2[i].ISBN==result[j].ISBN) {
                                to_remove.push(i);
                            }
                        }
                    }
                    for(i=to_remove.length-1; i>=0; i--) {
                        result2.splice(to_remove[i], 1);
                    }
                    for(i=0; i<result2.length;i++) {
                        result.push(result2[i]); 
                    }
                    sess.query_result = result;
                    response.redirect('/');

                }) 
            });
        }
    });
});

app.post('/addBook', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        post = JSON.parse(data)
        db.new_book(post,function(result){
            console.log("new book");
            console.log(result);
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

app.put('/updateInvoice', function(request,response){
    var data = '';
    sess=request.session;
    request.addListener('data', function(chunk) { data += chunk; });
    request.addListener('end', function() {
        put = JSON.parse(data)
        db.update_invoice_status(put, function(result1){
            console.log("update invoice status");
            console.log(result1)
            if (typeof result1 !== 'string') {
              console.log("Invoice is delivered");
              response.writeHead(200, {'content-type': 'text/plain' });
              response.write("Success");
              response.end('\n');
            } else {
              response.writeHead(400, {'content-type': 'text/plain' });
              response.write(result1);
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
            console.log("update book copies")
            console.log(result);
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

app.get('/account/:user', function (req, res) {
    var user = req.params.user;
    db.connect();
    var customerData;
    var orderData;
    var feedbackData;
    var ratingData;
    sess = req.session;
    if (sess.user == 'admin') {
            admin_status = true;
        }

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
                    console.log("query account");
                    console.log(customerData)
                  
                    res.render('account.pug', {title:'Your Account', customerData: customerData, orderData: orderData, feedbackData: feedbackData, ratingData: ratingData, user: sess.user, cart:sess.cart, admin: admin_status});
                });
            }); 
        });
    });
    
});

app.get('/admin/:Year/:Month/:popularCount', function(req,res) {

    db.connect();
    var popularCount = parseInt(req.params.popularCount);
    var Year = parseInt(req.params.Year);
    var Month = parseInt(req.params.Month);
    var DbParamsData = {
      year : Year,
      month : Month,
      count : popularCount 
    }

    var authorsData;
    var booksData;
    var publishersData;
    var outstandingInvoices;
    sess = req.session;
    if (sess.user == 'admin') {
            admin_status = true;
        }
    db.popular_authors(DbParamsData, function(result11_1){
        console.log("popular authors");
        console.log(result11_1);
        authorsData = result11_1;
        db.popular_books(DbParamsData, function(result11_2){
            console.log("popular books");
            console.log(result11_2);
            booksData = result11_2;
            db.popular_publishers(DbParamsData, function(result11_3){
                console.log("popular publishers");
                console.log(result11_3);
                publishersData = result11_3;
                db.admin_invoice_details(function(result){
                    db.format_invoice_details(result, function(result1){
                        outstandingInvoices = result1;
                        console.log("outstandingInvoices");
                        console.log(outstandingInvoices);

                        res.render('admin.pug', {title:"Admin Account", user:sess.user, cart:sess.cart, outstandingInvoices: outstandingInvoices, authorsData: authorsData, booksData: booksData, publishersData: publishersData, admin: admin_status,DbParamsData : DbParamsData});
                    });
                });
            });
        });
    });
});

app.get('/admin', function(req,res) {

    db.connect();
    var authorsData = null;
    var booksData = null;
    var publishersData = null;
    var outstandingInvoices;
    sess = req.session;
    if (sess.user == 'admin') {
            admin_status = true;
        }
    db.admin_invoice_details(function(result){
        db.format_invoice_details(result, function(result1){
            outstandingInvoices = result1;
            console.log("outstandingInvoices");
            console.log(outstandingInvoices);

            res.render('admin.pug', {title:"Admin Account", user:sess.user, cart:sess.cart, outstandingInvoices: outstandingInvoices, authorsData: authorsData, booksData: booksData, publishersData: publishersData, admin: admin_status});
        });
    });
});

app.post('/addToCart', function(req,res) {
    var data = '';
    sess=req.session;
    req.addListener('data', function(chunk) { data += chunk; });
    req.addListener('end', function() {
        post = JSON.parse(data);
        if (sess.cart!=undefined) {
            var changed = false
            for (order in sess.cart) {
                if (sess.cart[order].isbn == post.isbn) {
                    sess.cart[order].copies = parseInt(sess.cart[order].copies) + parseInt(post.copies)
                    changed = true
                } 
            }
            if (!changed) {
                sess.cart.push(post);
            }
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
  if (sess.user == 'admin') {
            admin_status = true;
        }
  res.render('cart.pug', {title:'Cart', user:sess.user, cart:sess.cart, admin: admin_status})
});

app.get('/signOut', function(req,res){
    req.session.destroy(function(err) { 
      if(err) { 
        console.log(err); 
      } else { 
        admin_status=false;
        res.redirect('/'); 
      } 
    });
});

app.get('/book/:isbn', function(req,res){
    var isbn = req.params.isbn;
    sess=req.session;
    if (sess.user == 'admin') {
            admin_status = true;
        }
    var query_result;
    db.connect();
    db.query_book('book',isbn,function(result){
      query_result = result[0];
      if(query_result!=undefined) {
        var data = {ISBN: isbn}  
        db.useful_feedback_retrival(data,function(result){
            console.log("feedback");
            console.log(result);
            
            console.log(isbn)
            db.book_recommendation(isbn, function(result10){
                console.log("recommendation")
                console.log(result10)
                if (result10.length == 0) {
                    result10 = false; 
                }
                 res.render('book.pug',  {title: query_result.title, data: query_result, user: sess.user, cart:sess.cart, feedback_data: result, book_rec: result10, admin: admin_status})
            })
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
            console.log("feedback recording")
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
        db.rating_recording(post, function(result){
            if (result=="Rating submitted successfully") {
                console.log("rating success")
                res.writeHead(200, {'content-type': 'text/plain' });
                res.end();
            } else {
                console.log("rating not success");
                console.log(result);
                res.writeHead(400, {'content-type': 'text/plain' });
                res.end();
            }    
        });

    });    
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
});

