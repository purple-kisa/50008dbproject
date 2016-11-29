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
        connection.query('select * from ??', [table] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error :" + err.code);
            }           
        });
  });
}

exports.query_books = function(table,callback){
    state.pool.getConnection(function(err,connection){
        // console.log('Connected as id ' + connection.threadId);
        connection.query('select authors,title,image,ISBN from ??', [table] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error :" + err.code);
            }           
        });
  });
}

exports.query_book = function(table,ISBN,callback){
    state.pool.getConnection(function(err,connection){
        // console.log('Connected as id ' + connection.threadId);
        connection.query('select * from ?? where ISBN=?', [table,ISBN] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error :" + err.code);
            }           
        });
  });
}

//Q1
exports.registration = function(table,data,callback){
    state.pool.getConnection(function(err,connection){ 
        var query = connection.query('INSERT INTO ?? SET ?', [table,data], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Successfully Registered User :" + data.user);
            } 
            else{
              return callback("Failure to Register User :" + data.user + "\nError :" + err.code);
            } 
        });
  });
}

//Q2
exports.order = function(table,data,callback){
    state.pool.getConnection(function(err,connection){ 
        var query = connection.query('INSERT INTO ?? SET ?', [table,data], function(err, rows) {      
           connection.release();
            if(!err) {
              return callback("Successfully Registered User :" + data.user);
            } 
            else{
              return callback("Failure to Register User :" + data.user + "\nError :" + err.code);
            } 
        });
  });
}

// query account with condition
exports.query_account = function(table,user,callback){
    state.pool.getConnection(function(err,connection){
        // console.log('Connected as id ' + connection.threadId);
        connection.query('select * from ?? where user = ?', [table,user] ,function(err,rows){
            connection.release();
            // console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback("Error :" + err.code);
            }           
        });
  });
}
