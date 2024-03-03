var express=require('express');
var session=require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser=require('body-parser');
var bkfd2Password = require("pbkdf2-password");

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();


var sha256=require('sha256');
var app=express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'sd124adsdafase11',
  resave: false,
  saveUninitialized: true,
  store:new FileStore()
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
});
var users=[
  {
    authId:'local:gud8926',
    username:'gud8926',
    password:'cm0AwW86Lm/cqmTIW87xLi87kxDNX8Hh1BwrlJxy2Gm31pNzXM6Mb1K8B6RxAKySAKRX/Fb2b1HDEyjVJEnpYmCxaZGz2/YWLlZz/1u25cB3peT2WXKpXnd5iet1PbYkpqAH254fHidW7R/Mz8YKTtQFjZp0p8dixb0gk0sHYnc=',
    salt:'A74nAk8lBg5OA6v7R/yEGH+shBEiagOgX6hYkVIFMUyQ1yYBIEpg3gmoePJ98giGPFJF1x7m1q6VrdtDXwZ7dw==',
    displayName:'INGIMAN' //화면에 표시하는 닉네임
  }
];


app.post('/auth/register',function(req,res){
  hasher({password:req.body.password}, function(err,pass,salt,hash){
    var user={
      authId:'local:'+req.body.username,
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
//passport session
//로그인 인증과 관련된것을 할때 사용자가 인증되었는지 여부를 session정보를 통해 유지한다.
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null,user.authId);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser',id);
  for(var i=0; i<users.length; i++){
    var user=users[i];
    if(user.authId === id){
      return done(null,user);
    }
  }
  done('There is no user!');
});


passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
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
    for(var i=0; i<users.length;i++){
      var user=users[i];
      if(user.authId===authId){ //이미 users배열에 존재하는 user인지 확인하는
        return done(null, user); //인증된 사용자!!
      }
    }
    var newuser={ //users라는 배열에 새로운 유저를 push 하것다!!!
      'authId':authId,
      'displayName':profile.displayName,
      'email':profile.emails[0].value
    };
    users.push(newuser);
    done(null,newuser);
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
