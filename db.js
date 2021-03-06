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
    if(ISBN.length!=10){
        return callback("ISBN is invalid, Please enter a valid 10 digit ISBN number");
    }
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
        connection.query('SELECT i.number, i.date, i.status, i.user, c.ISBN, c.copies, b.title FROM online_bookstore.invoice i , online_bookstore.content c, online_bookstore.book b WHERE i.number = c.number AND c.ISBN = b.ISBN AND i.status != ? ORDER BY c.number',['delivered'], function(err, rows){
            if(!err){
                return callback(rows);
            }
            else{
                return callback("Error: " + err);
            }
        })
    })
}

exports.format_invoice_details = function(data, callback){
    var output = []
    var exisiting = 0
    for (row in data){
        if (data[row].number != exisiting){
            var invoice = {number: data[row].number, date: data[row].date, user: data[row].user, title:[], books: [], copies: []}
            output.push(invoice)
            exisiting = data[row].number
        }
        output[output.length-1].title.push(data[row].title)
        output[output.length-1].books.push(data[row].ISBN)
        output[output.length-1].copies.push(data[row].copies)
    }
    return callback(output)
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
    if (data.card_no.length != 16){
        return callback("Card Number invalid, Please enter a valid 16-digit card number")
    }
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
    if (data.copies < 1){
        return callback("Number of copies invalid, Please insert more than 1 copy")
    }
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
        connection.query('SELECT r.ISBN, b.title, r.user_feedback, r.user_rate, r.rate FROM online_bookstore.rating r, online_bookstore.book b WHERE r.user_rate = ? AND r.ISBN = b.ISBN ORDER BY r.rate DESC', [user], function(err, rows){
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
    if (data.copies < 0){
        return callback("Copies invalid, Please enter a positive copy count")
    }
    else if (data.price < 0){
        return callback("Price invalid, Please enter a valid price")
    }
    else if (data.format !=  "softcopy" && data.format !=  "hardcopy"){
        return callback("Format invalid, Please enter a format. E.g softcopy/hardcopy")
    }
    else if (data.year_pub < 0){
        return callback("Year invalid, Please enter a valid year.")
    }
    else if(data.ISBN.length!=10){
        return callback("ISBN is invalid, Please enter a valid 10 digit ISBN number");
    }
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
    if (data.copies < 0){
        return callback("Error: Copies invalid, Please enter a positive copy count")
    }
    else if(data.ISBN.length!=10){
        return callback("Error: ISBN is invalid, Please enter a valid 10 digit ISBN number");
    }
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT IF(? IN (SELECT ISBN FROM book), "True", "False") AS test', [data.ISBN], function(err, rows){
            if(!err){
                if (rows[0].test != "False"){
                    connection.query('UPDATE book SET copies = (copies + ?) WHERE ISBN = ?', [data.copies, data.ISBN], function(err, rows1){
                        return callback(data.ISBN + "," + data.copies+ " copies updated successfully! \n");
                    })
                }
                else{
                    return callback("Error: Book does not exist")
                }
            }
            else{
                return callback("Error: " + err);
            }
            data.copies, data.ISBN
        })
    })
}

//-----------------------------------------------------
//-----  Q6: Feedback Recording  ----------------------
//-----------------------------------------------------

exports.feedback_recording = function(data, callback){
    if (data.score < 1 || data.score > 10){
        return callback("Score invalid, Please enter a score between 1 to 10")
    }
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
    if (data.rate  < -1  || data.score > 1){
        return callback("Rating invalid, Please enter a rating of either -1,0,1")
    }
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
        var count = 0 
        var query = 'SELECT * FROM book '
        for (var key in post) {
          if (post[key].length!=0 & key!='sort') {
            if (count == 0){
            query = query + 'WHERE '
            }
            query = query + key + ' LIKE "%' + post[key] +'%" AND '
            count = count + 1
          }
        }
        if(count>0){
            query = query.substr(0,query.length-4)
        }
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
        var count = 0
        var query = 'SELECT * FROM book '
        for (var key in post) {
          if (post[key].length!=0 & key!='sort') {
            if (count == 0){
                query = query + 'WHERE '
            }
            query = query + key + ' LIKE "%' + post[key] +'%" AND '
            count = count + 1
          }
        }
        if(count>0){
            query = query.substr(0,query.length-4)
        }
        query = query + 'ORDER BY year_pub DESC'
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
        var count = 0
        var query = 'SELECT * FROM book INNER JOIN(SELECT avg(score) average,ISBN FROM feedback GROUP BY ISBN)D ON D.ISBN = book.ISBN '
        for (var key in post) {
          if (post[key].length!=0 & key!='sort') {
            if (count == 0){
                query = query + 'WHERE '
            }
            query = query + key + ' LIKE "%' + post[key] +'%" AND '
            count = count + 1
          }
        }
        if(count>0){
            query = query.substr(0,query.length-4)
        }
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
    if(data.ISBN.length!=10){
        return callback("ISBN is invalid, Please enter a valid 10 digit ISBN number");
    }
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT f.ISBN, f.user, f.comment, f.date, f.score, IFNULL(r3.avg_rate, 0) AS avg_rate FROM online_bookstore.feedback f LEFT JOIN (SELECT r1.ISBN, r1.user_feedback, SUM(r1.rate) AS avg_rate FROM online_bookstore.rating r1 WHERE r1.ISBN = ? GROUP BY r1.ISBN, r1.user_feedback) AS r3 ON r3.ISBN = f.ISBN AND r3.user_feedback = f.user WHERE f.ISBN = ? ORDER BY avg_rate DESC', [data.ISBN, data.ISBN], function(err, rows){
            connection.release();
            if(!err){
                for (i =0; i<rows.length; ++i) {
                    console.log(rows[i])
                    rows[i].date = String(rows[i].date).substring(0,16)
                }
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

exports.book_recommendation = function(ISBN, callback){
    if(ISBN.length!=10){
        return callback("ISBN is invalid, Please enter a valid 10 digit ISBN number");
    }
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT c1.ISBN, b.title, SUM(c1.copies) AS sum_cop, b.image FROM online_bookstore.invoice i1, online_bookstore.content c1, online_bookstore.book b WHERE i1.number = c1.number AND c1.ISBN = b.ISBN AND i1.user IN (SELECT i.user FROM online_bookstore.invoice i, online_bookstore.content c WHERE i.number = c.number AND c.ISBN = ?) AND c1.ISBN != ? GROUP BY c1.ISBN ORDER BY sum_cop DESC', [ISBN, ISBN], function(err, rows){
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
//-----  Q101: Statistics  ----------------------------
//-----------------------------------------------------

exports.popular_books = function(data, callback){
    if(data.count<0){
        return callback("Please insert a positive integer");
    }
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT c.ISBN, SUM(c.copies) AS sum_cop, b.title FROM online_bookstore.content c, online_bookstore.book b, online_bookstore.invoice i WHERE c.ISBN = b.ISBN AND c.number = i.number AND MONTH(i.date) = {MONTH(?)} AND YEAR(i.date) = {YEAR(?)} GROUP BY c.ISBN ORDER BY sum_cop DESC LIMIT ?',[data.month,data.year,data.count], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback('Error: ' + err)
            }
        })
    })
}

exports.popular_authors = function(data, callback){
    if(data.count<0){
        return callback("Please insert a positive integer");
    }
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT b.authors, SUM(c.copies) AS sum_cop FROM online_bookstore.content c, online_bookstore.book b, online_bookstore.invoice i WHERE c.ISBN = b.ISBN AND c.number = i.number AND MONTH(i.date) = {MONTH(?)} AND YEAR(i.date) = {YEAR(?)} AND b.authors IS NOT NULL GROUP BY b.authors ORDER BY sum_cop DESC LIMIT ?',[data.month,data.year, data.count], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback('Error: ' + err)
            }
        })
    })
}

exports.popular_publishers = function(data, callback){
    if(data.count<0){
        return callback("Please insert a positive integer");
    }
    state.pool.getConnection(function(err, connection){
        connection.query('SELECT b.publisher, SUM(c.copies) AS sum_cop FROM online_bookstore.content c, online_bookstore.book b, online_bookstore.invoice i WHERE c.ISBN = b.ISBN AND c.number = i.number AND MONTH(i.date) = {MONTH(?)} AND YEAR(i.date) = {YEAR(?)} GROUP BY b.publisher ORDER BY sum_cop DESC LIMIT ?',[data.month,data.year, data.count], function(err, rows){
            connection.release();
            if(!err){
                return callback(rows);
            }
            else{
                return callback('Error: ' + err)
            }
        })
    })
}