var express=require('express');
var session=require('express-session');
var FileStore = require('session-file-store')(session);

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser=require('body-parser');

var sha256=require('sha256');
var app=express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'sd124adsdafase11',
  resave: false,
  saveUninitialized: true,
  store:new FileStore
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

app.get('/auth/logout', function(req, res){
  req.logout();
  req.session.save(function(){
    res.redirect('/welcome');
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
});
var users=[
  {
    username:'gud8926',
    password:'cm0AwW86Lm/cqmTIW87xLi87kxDNX8Hh1BwrlJxy2Gm31pNzXM6Mb1K8B6RxAKySAKRX/Fb2b1HDEyjVJEnpYmCxaZGz2/YWLlZz/1u25cB3peT2WXKpXnd5iet1PbYkpqAH254fHidW7R/Mz8YKTtQFjZp0p8dixb0gk0sHYnc=',
    salt:'A74nAk8lBg5OA6v7R/yEGH+shBEiagOgX6hYkVIFMUyQ1yYBIEpg3gmoePJ98giGPFJF1x7m1q6VrdtDXwZ7dw==',
    displayName:'INGIMAN' //화면에 표시하는 닉네임
  }
];


app.post('/auth/register',function(req,res){
  hasher({password:req.body.password}, function(err,pass,salt,hash){
    var user={
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.login(user,function(err){
      req.session.save(function(){
        res.redirect('/welcome');
      });
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

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null,user.username);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser',id);
  for(var i=0; i<users.length; i++){
    var user=users[i];
    if(user.username === id){
      return done(null,user);
    }
  }
});


passport.use(new LocalStrategy(
  function(username,password,done){
    var uname=username;
    var pwd=password;
    for(var i=0; i<users.length; i++){
      var user=users[i];
      if(uname===user.username){
          return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
            if(hash===user.password){ //인증된 사용자
              console.log('LocalStrategy',user);
              done(null,user);
              // req.session.displayName=user.displayName;
              // req.session.save(function(){
              //   res.redirect('/welcome');
              // })
            }else{
              done(null,false);
              //res.send('Who are you? <a href="/auth/login">login</a>');
            }
          });
      }
   }
   done(null,false);
   //res.send('Who are you? <a href="/auth/login">login</a>');
 }
));
app.post(
  '/auth/login',
  passport.authenticate(
    'local',
    {
      successRedirect:'/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false //왜 인증에 실패했는지 메세지 보내주는 근데 우리는 일단 스킵
    }
  )
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
  `;
  res.send(output);
})
app.listen(3003, function(){
  console.log('Connetced 3003!!!')
});
