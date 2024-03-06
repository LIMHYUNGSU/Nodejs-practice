
var app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);

var auth = require('./routes/mysql/auth')(passport);
app.use('/auth/',auth);




app.get('/welcome',function(req,res){
  if(req.user && req.user.displayName){
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">Logout</a>
    `);
  }else{
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});;




//
// app.post('/auth/register',function(req,res){
//   hasher({password:req.body.password}, function(err,pass,salt,hash){
//     var user={
//       authId:'local:'+req.body.username,
//       username:req.body.username,
//       password:hash,
//       salt:salt,
//       displayName:req.body.displayName
//     };
//     var sql='INSERT INTO users SET ?';
//     conn.query(sql,user, function(err,results){
//       if(err){
//         console.log(err);
//         res.status(500);
//       }else{  //등록하자마자 바로 로그인 하는
//         req.login(user,function(err){
//           req.session.save(function(){
//             res.redirect('/welcome');
//           });
//         });
//       }
//     });
//   });
// });
//
// app.get('/auth/register',function(req,res){
//   res.render('auth/register');
// });
//
//
// app.get('/auth/login',function(req,res){
//   res.render('auth/login');
// });
//
//
//
//
// app.post( //콜백 대신에 passport가 위임해서 post해주는것
//   '/auth/login',
//   //이 밑에 이것들은 middleware라고 한
//   passport.authenticate(
//     'local', //passport 전략중에 local 이라는 로그인 방식이 실행 되는것! 그리고 위에 new LocalStrategy의 콜백 함수가 실행 되도록 약속이 되어 있는것!
//     {
//       successRedirect:'/welcome',
//       failureRedirect: '/auth/login',
//       failureFlash: false //왜 인증에 실패했는지 메세지 보내주는 근데 우리는 일단 스킵
//     }
//   )
// );
//
// //인증을 하는 과정에서 facebook과 나의 app이 왔다갔다 하는 작업을 한번 더 하기에
// app.get('/auth/facebook',
//   passport.authenticate('facebook',{
//       scope:'email'
//     }
//   )
// );
//
//
//
// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook',
//   {
//     failureRedirect: '/auth/login'
//   }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/welcome');
//   }
// );
//
//
//
// app.get('/auth/logout', function(req, res, next) {
//   req.logout(function(err) {
//     if (err) {
//         return next(err);
//     }else{
//       req.session.save(function(){
//         res.redirect('/welcome');
//       });
//     }
//   });
// });


app.listen(3003, function(){
  console.log('Connetced 3003!!!')
});
