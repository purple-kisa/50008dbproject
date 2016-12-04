var mysql     =    require('mysql');

var state = {
  pool: null,
  mode: null,
}

exports.connect = function(){
  state.pool      =    mysql.createPool({
      connectionLimit : 100, 
      host     : 'localhost',
      user     : 'root',
      password : 'root',
      database : 'online_bookstore',
      debug    :  false
  });
}

exports.query_database_all = function(table,callback){
    state.pool.getConnection(function(err,connection){
        // console.log('Connected as id ' + connection.threadId);
        connection.query('SELECT * FROM ??', [table] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error: " + err.code);
            }           
        });
  });
}

exports.sign_in = function(user,password, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT COUNT(*) FROM customer WHERE BINARY user = ? AND BINARY password = ?', [user,password], function(err, rows){
            connection.release();
            if(!err){
                if(rows[0]['COUNT(*)'] == 1){
                  return callback("Success");
                }
                else{
                  return callback("Wrong Username or Password");  
                }
            }
            else{
                return callback("Error: " + err.code);
            }
        });
    })
}

exports.query_books = function(table,callback){
    state.pool.getConnection(function(err,connection){
        // console.log('Connected as id ' + connection.threadId);
        connection.query('SELECT authors,title,image,ISBN FROM ??', [table] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error: " + err.code);
            }           
        });
  });
}

exports.query_book = function(table,ISBN,callback){
    state.pool.getConnection(function(err,connection){
        // console.log('Connected as id ' + connection.threadId);
        connection.query('SELECT * FROM ?? WHERE ISBN=?', [table,ISBN] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error: " + err.code);
            }           
        });
  });
}

//-----------------------------------------------------
//-----  Admin Invoice Details  -----------------------
//-----------------------------------------------------

// returns all details grouped by invoice number and all the books under the invoice
// function to allow admin to change status as well

exports.admin_invoice_details = function(callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM invoice, content WHERE invoice.number = content.number', function(err, rows){
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err);
            }
        })
    })
}

exports.update_invoice_status = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('UPDATE invoice SET status = ? WHERE number = ?', [data.status, data.number], function(err, rows){
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err);
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q1: Registration  ----------------------------
//-----------------------------------------------------
exports.registration = function(table,data,callback){
    state.pool.getConnection(function(err,connection){ 
        var query = connection.query('INSERT INTO ?? SET ?', [table,data], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Successfully Registered User: " + data.user);
            } 
            else{
              return callback("Failure to Register User: " + data.user + "\nError: " + err.code);
            } 
        });
  });
}

//-----------------------------------------------------
//-----  Q2: Ordering  --------------------------------
//-----------------------------------------------------
exports.order = function(table,data,callback){
    state.pool.getConnection(function(err,connection){ 
        var query = connection.query('INSERT INTO ?? SET ?', [table,data], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Successfully placed order");
            } 
            else{
              return callback("Failed to submit order, ID" + "\nError: " + err.code);
            } 
        });
  });
}

exports.content = function(table,data,callback){
    state.pool.getConnection(function(err,connection){ 
        var query = connection.query('INSERT INTO ?? VALUES ((SELECT number FROM invoice WHERE date = ? AND user = ? ORDER BY number DESC LIMIT 1),?,?)', [table,data.date,data.user,data.ISBN,data.copies], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Content has been indexed, ISBN: " + data.ISBN );
            } 
            else{
              return callback("Duplicate exists, ISBN: " + data.ISBN + "\nError: " + err);
            } 
        });
  });
}

exports.book_decrease = function(copies,ISBN,callback){
    state.pool.getConnection(function(err,connection){ 
        var query = connection.query('UPDATE book SET copies = copies - ? WHERE ISBN = ?', [copies,ISBN], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Book count has been decremented: " + ISBN);
            } 
            else{
              return callback("\nError: " + err);
            } 
        });
  });
}

//Note: Check pending status for certain types of status? eg pending, done ....
//Invoice number should be auto increment

//-----------------------------------------------------
//-----  Q3: User Record  -----------------------------
//-----------------------------------------------------

//Full record of user account information
exports.query_account = function(table,user,callback){
    state.pool.getConnection(function(err,connection){
        connection.query('SELECT * FROM ?? WHERE user = ?', [table,user] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error: " + err.code);
            }           
        });
  });
}

//Full history of orders
exports.query_order = function(user, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT book.title,content.copies,invoice.date,invoice.status FROM invoice,content,book WHERE invoice.user = ? AND content.number = invoice.number AND content.ISBN = book.ISBN', [user], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        });
    })
}

//Full history of feedbacks
exports.query_feedback = function(user, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT book.title,feedback.comment FROM feedback,book WHERE feedback.user = ? AND feedback.ISBN = book.ISBN ORDER BY score DESC', [user], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        });
    })
}

//Full history of feedbacks ranked with respect to usefulness
exports.query_rating = function(user, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM rating WHERE user_rate = ? ORDER BY rate DESC', [user], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        });
    })
}

//-----------------------------------------------------
//-----  Q4: New Book  --------------------------------
//-----------------------------------------------------

exports.new_book = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('INSERT INTO `online_bookstore`.`book` (`ISBN`, `title`, `authors`, `publisher`, `year_pub`, `copies`, `price`, `tag`, `format`, `subject`, `image`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [data.ISBN, data.title, data.authors, data.publisher, data.year_pub, data.copies, data.price, data.tag, data.format, data.subject, data.image], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q5: Arrival of more copies  ------------------
//-----------------------------------------------------

exports.update_book_copies = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('UPDATE book SET copies = (copies + ?) WHERE ISBN = ?', [data.copies, data.ISBN], function(err, rows){
            connection.release();
            if(!err){
                return callback(data.ISBN + " copies updated successfully! \n" + rows);
            }
            else{
                return callback("Error: " + err);
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q6: Feedback Recording  ----------------------
//-----------------------------------------------------

exports.feedback_recording = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('INSERT INTO feedback SET ?', [data], function(err, rows){
            connection.release();
            if(!err){
                return callback("Feedback submitted successfully");
            }
            else{
                return callback("Error: " + err.code);
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q7: Usefulness rating  ----------------------
//-----------------------------------------------------


exports.feedback_retrival = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM feedback WHERE ISBN = ?', [data], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        })
    })
}

exports.rating_recording = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('INSERT INTO rating SET ?', [data], function(err, rows){
            connection.release();
            if(!err){
                return callback("Rating submitted successfully")
            }
            else{
                return callback("Error: " + err)
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q8: Book Browsing  ---------------------------
//-----------------------------------------------------

exports.book_browsing = function(post, callback){
    state.pool.getConnection(function(err, connection){
        var query = 'SELECT * FROM book WHERE '
        for (var key in post) {
          if (post[key].length!=0 & key!='sort') {
            query = query + key + ' LIKE "%' + post[key] +'%" AND '
          }
        }
        query = query.substr(0,query.length-4)
        console.log(query)
        connection.query(query, function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        })
    })
}

exports.book_browsing_year = function(post, callback){
    state.pool.getConnection(function(err, connection){
        var query = 'SELECT * FROM book WHERE '
        for (var key in post) {
          if (post[key].length!=0 & key!='sort') {
            query = query + key + ' LIKE "%' + post[key] +'%" AND '
          }
        }
        query = query.substr(0,query.length-4)
        query = query + ' ORDER BY year_pub DESC'
        console.log(query)      
        connection.query(query, function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        })
    })
}

exports.book_browsing_avg_feedback = function(post, callback){
    state.pool.getConnection(function(err, connection){
        var query = 'SELECT * FROM book INNER JOIN(SELECT avg(score) average,ISBN FROM feedback GROUP BY ISBN)D ON D.ISBN = book.ISBN WHERE '
        for (var key in post) {
          if (post[key].length!=0 & key!='sort') {
            query = query + key + ' LIKE "%' + post[key] +'%" AND '
          }
        }
        query = query.substr(0,query.length-4)
        query = query +  ' ORDER BY D.average DESC'
        console.log(query)         
        connection.query(query, function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err.code);
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q9: Useful Feedbacks  ------------------------
//-----------------------------------------------------

exports.useful_feedback_retrival = function(data, callback){
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT ISBN, user_feedback, AVG(rate) AS avg_rate FROM online_bookstore.rating WHERE ISBN = ? GROUP BY ISBN, user_feedback ORDER BY avg_rate DESC LIMIT ?', [data.ISBN, data.n], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err);
            }
        })
    })
}

//-----------------------------------------------------
//-----  Q10: Book Recommendation  --------------------
//-----------------------------------------------------