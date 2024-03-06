module.exports=function(){

  var express=require('express');
  var session=require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser=require('body-parser');


  var app=express();

  app.set('views', './views/mysql');
  app.set('view engine', 'jade');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: 'sd124adsdafase11',
    resave: false,
    saveUninitialized: true,
    store:new MySQLStore({ //session에서 사용하는 mysql의 접속정보
      host: 'localhost',
    	port: 3306,
    	user: 'root',
    	password: '111111',
    	database: 'o2'
    })
  }));
  return app
}
