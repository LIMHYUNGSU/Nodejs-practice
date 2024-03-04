var express=require('express');
var session=require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser=require('body-parser');
var bkfd2Password = require("pbkdf2-password");

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database: 'o2'
});

conn.connect();



var sha256=require('sha256');
var app=express();

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
}))

app.use(passport.initialize());
app.use(passport.session()); //이것을 사용하기 위해서는 무조건 위에 있는 session 뒤에 있어야 함(session이 정의 되있어야 사용가능하니깐)

app.get('/count',function(req,res){
  if(req.session.count){
    req.session.count++;
  }else{
    req.session.count=1;
  }
  res.send('count : '+req.session.count);
});


app.get('/auth/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
        return next(err);
    }else{
      req.session.save(function(){
        res.redirect('/welcome');
      });
    }
  });
});


app.get('/welcome',function(req,res){
  if(req.user && req.user.displayName){
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">Logout</a>
    `);
  }else{
    res.send(`
      <h1>Welcome</h1>
      <a href="/auth/login">Login</a>
      <a href="/auth/register">register</a>
  `);
  }
});;


app.post('/auth/register',function(req,res){
  hasher({password:req.body.password}, function(err,pass,salt,hash){
    var user={
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    var sql='INSERT INTO users SET ?';
    conn.query(sql,user, function(err,results){
      if(err){
        console.log(err);
        res.status(500);
      }else{  //등록하자마자 바로 로그인 하는
        req.login(user,function(err){
          req.session.save(function(){
            res.redirect('/welcome');
          });
        });
      }
    });
  });
});

app.get('/auth/register',function(req,res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
//passport session
//로그인 인증과 관련된것을 할때 사용자가 인증되었는지 여부를 session정보를 통해 유지한다.
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null,user.authId);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser',id);
  var sql='SELECT * FROM users Where authId=?';
  conn.query(sql,[id], function(err, results){
    if(err){
      console.log(err);
      done('There is no user.');
    }else{
      done(null,results[0]);
    }
  });
  // for(var i=0; i<users.length; i++){
  //   var user=users[i];
  //   if(user.authId === id){
  //     return done(null,user);
  //   }
  // }
  // done('There is no user!');
});


passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * FROM users where authId=?';
    conn.query(sql,['local:'+uname],function(err,results){
      console.log(results);
      if(err){
        return done('There is no user.');
      }
      var user = results[0];
      return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
        if(hash===user.password){ //인증된 사용자
          console.log('LocalStrategy',user);
          done(null,user);
        }else{
          done(null,false);
        }
      });
    });
  }
));

// 앱ID랑 secret 번호 유출 조심!! 나는 바로 지울거얌
passport.use(new FacebookStrategy({
    clientID: '422708880282058',
    clientSecret: '7b7d1b3d562359bbc6b4d68300890f58',
    callbackURL: "/auth/facebook/callback",
    profileFields:['email','displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId='facebook:'+profile.id;
    var sql='SELECT * FROM users WHERE authId=?';
    conn.query(sql, [authId], function(err, results){
      if(results.length>=0){ //사용자가 존재 한다면
        done(null,results[0]);
      }else{
        var newuser={ 
          'authId':authId,
          'displayName':profile.displayName,
          'email':profile.emails[0].value
        };
        var sql ='INSERT INTO users SET ?';
        conn.query(sql, newuser,function(err,results){
          if(err){
            console.log(err);
            done('Error');
          }else{
            done(null,newuser);
          }
        })
      }
    });
  }
));


app.post( //콜백 대신에 passport가 위임해서 post해주는것
  '/auth/login',
  //이 밑에 이것들은 middleware라고 한
  passport.authenticate(
    'local', //passport 전략중에 local 이라는 로그인 방식이 실행 되는것! 그리고 위에 new LocalStrategy의 콜백 함수가 실행 되도록 약속이 되어 있는것!
    {
      successRedirect:'/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false //왜 인증에 실패했는지 메세지 보내주는 근데 우리는 일단 스킵
    }
  )
);

//인증을 하는 과정에서 facebook과 나의 app이 왔다갔다 하는 작업을 한번 더 하기에
app.get('/auth/facebook',
  passport.authenticate('facebook',{
      scope:'email'
    }
  )
);



app.get('/auth/facebook/callback',
  passport.authenticate('facebook',
  {
    failureRedirect: '/auth/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/welcome');
  }
);

// app.post('/auth/login',function(req,res){
//   var uname=req.body.username;
//   var pwd=req.body.password;
//   for(var i=0; i<users.length; i++){
//     var user=users[i];
//     if(uname===user.username){
//         return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
//           if(hash===user.password){ //인증된 사용자
//             req.session.displayName=user.displayName;
//             req.session.save(function(){
//               res.redirect('/welcome');
//             })
//           }else{
//               res.send('Who are you? <a href="/auth/login">login</a>');
//           }
//         });
//     }
//  }
//  res.send('Who are you? <a href="/auth/login">login</a>');
// });

app.get('/auth/login',function(req,res){
  var output=`
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name='username' placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  <a href="/auth/facebook"> facebook</a>
  `;
  res.send(output);
})
app.listen(3003, function(){
  console.log('Connetced 3003!!!')
});
