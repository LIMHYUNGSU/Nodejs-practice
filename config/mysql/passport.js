
module.exports=function(app){
  var conn=require('./db')(); //같은 디렉토리에 있기때문에 이렇게만 해도 됨/ 함수 형태 이니깐 () 붙여야 함
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;

  app.use(passport.initialize());
  app.use(passport.session()); //이것을 사용하기 위해서는 무조건 위에 있는 session 뒤에 있어야 함(session이 정의 되있어야 사용가능하니깐)


  passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserializeUser',id);
    var sql='SELECT * FROM users Where authId=?';
    conn.query(sql,[id], function(err, results){
      if(err){
        console.log(err);
        done('There is no user.');
      }else{
        done(null, results[0]);
      }
    });
  });


  passport.use(new LocalStrategy(
    function(username, password, done){
      var uname = username;
      var pwd = password;
      var sql = 'SELECT * FROM users where authId=?';
      conn.query(sql,['local:'+uname],function(err,results){
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


  return passport;
};
