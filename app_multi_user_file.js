var express=require('express');
var session=require('express-session');
var FileStore = require('session-file-store')(session);

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var bodyParser=require('body-parser');


var app=express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'sd124adsdafase11',
  resave: false,
  saveUninitialized: true,
  store:new FileStore
}))

app.get('/count',function(req,res){
  if(req.session.count){
    req.session.count++;
  }else{
    req.session.count=1;
  }
  res.send('count : '+req.session.count);
})
app.get('/auth/logout',function(req,res){
  delete req.session.displayName; //자바스크립트 명령어 delte
  req.session.save(function(){
    res.redirect('/welcome');
    //save는 데이터 store에 저장이 끝났을 인자로 전달한 콜백함수를 나중에 호출하면서 저장이 완전히 끝난후에 redirect하는것 이렇게 하는게 안전하지~
  })
})
app.get('/welcome',function(req,res){
  if(req.session.displayName){
    res.send(`
      <h1>Hello,${req.session.displayName}</h1>
      <a href="/auth/logout">Logout</a>
      `);
  }else{
    res.send(`
      <h1>Welcome</h1>
      <a href="/auth/login">Login</a>
      <a href="/auth/register">register</a>
      `);
  }
})
var users=[
  {
    //hash가 비밀번호가 111111일때 랜덤으로 준 password와 salt 값이다
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
    req.session.displayName=req.body.displayName;
    req.session.save(function(){
      res.redirect('/welcome');
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
})

app.post('/auth/login',function(req,res){
  var uname=req.body.username;
  var pwd=req.body.password;
  for(var i=0; i<users.length; i++){
    var user=users[i];
    if(uname===user.username){
        return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
          if(hash===user.password){ //인증된 사용자
            req.session.displayName=user.displayName;
            req.session.save(function(){
              res.redirect('/welcome');
            })
          }else{
              res.send('Who are you? <a href="/auth/login">login</a>');
          }
        });
    }
  //   if(uname===user.username && hasher(pwd+user.salt)===user.password){
  //     req.session.displayName=user.displayName;
  //     return req.session.save(function(){
  //       res.redirect('/welcome');
  //     });
  //   }
  // }
 }
 res.send('Who are you? <a href="/auth/login">login</a>');
});

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
