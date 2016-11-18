# 50008dbproject

Online bookstore :3 

Instructions

Cd to the working directory of ../50008dbproject

Run the follow commands prior to starting node.js
- 'npm install' 
- 'npm install mysql'

	  For mysql, edit the following lines in db.js

 	  connectionLimit : 100, 
      host     : 'localhost',
      user     : 'root',                  ---> your user in Mysql
      password : 'root',				  ---> password to your server
      database : 'online_bookstore',      ---> name of db created in server
      debug    :  false

To start server
- 'npm start'
