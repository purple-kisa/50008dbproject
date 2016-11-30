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
        var query = connection.query('INSERT INTO ?? VALUES ((SELECT number FROM invoice WHERE date = ? AND user = ?),?,?)', [table,data.date,data.user,data.ISBN,data.copies], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Content has been indexed, ISBN: " + data.ISBN );
            } 
            else{
              return callback("Duplicate exists, ISBN: " + data.ISBN + "\nError: " + err.code);
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

