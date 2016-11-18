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
        console.log('Connected as id ' + connection.threadId);
        connection.query('select * from ??', [table] ,function(err,rows){
            connection.release();
            console.log("Connection released from pool");
            if(!err) {
                return callback(rows);
            }
            else{
               return callback(err.code);
            }           
        });
       
  });
}

exports.insert_database_tuple = function(table,data,callback){
    state.pool.getConnection(function(err,connection){ 
        console.log('Connected as id ' + connection.threadId);
        var query = connection.query('INSERT INTO ?? SET ?', [table,data], function(err, rows) {      
           connection.release();
           console.log("Connection released from pool")
            if(!err) {
              return callback(rows);
            } 
            else{
              return callback(err.code);
            } 
        });
  });
}

