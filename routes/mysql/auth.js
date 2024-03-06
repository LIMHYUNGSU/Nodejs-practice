module.exports=function(passport){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var conn=require('../../config/mysql/db')(); //같은 디렉토리에 없기에 찾아 가야 한다 현제 auth.js의 부모의 부모의 형제의 mysql의 db이다 ㅋㅋ
  //router level midlewear를 사용하기 위해서
  var route =require('express').Router();


  //내가 바꾸고 싶은 단어를 Ctrl+D 누르면 전체 잡힘
  route.post( //콜백 대신에 passport가 위임해서 post해주는것
    '/login',
    //이 밑에 이것들은 middleware라고 한
    passport.authenticate(
      'local', //passport 전략중에 local 이라는 로그인 방식이 실행 되는것! 그리고 위에 new LocalStrategy의 콜백 함수가 실행 되도록 약속이 되어 있는것!
      {
        successRedirect:'/topic',
        failureRedirect: '/auth/login',
        failureFlash: false //왜 인증에 실패했는지 메세지 보내주는 근데 우리는 일단 스킵
      }
    )
  );

  route.get('/facebook',
    passport.authenticate(
      'facebook',
      {scope:'email'}
    )
  );



  route.get('/facebook/callback',
    passport.authenticate(
      'facebook',
      {
        successRedirect:'/topic',
        failureRedirect: '/auth/login'
      }
    )
  );

  route.post('/register',function(req,res){
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

  route.get('/register',function(req,res){
    var sql='SELECT id,title FROM topic';
    conn.query(sql,function(err,topics,fields){
      res.render('auth/register',{topics:topics});
    });
  });


  route.get('/login',function(req,res){
    var sql='SELECT id,title FROM topic';
    conn.query(sql,function(err,topics,fields){
      res.render('auth/login',{topics:topics});
    });
  });

  route.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) {
          return next(err);
      }else{
        req.session.save(function(){
          res.redirect('/topic');
        });
      }
    });
  });

  return route;
};
