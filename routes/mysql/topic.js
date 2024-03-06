module.exports=function(){
  var route =require('express').Router();

  var conn =require('../../config/mysql/db')();


  route.get('/add', function(req, res){
    var sql='SELECT id,title FROM topic';
    conn.query(sql,function(err,topics,fields){
      if(err){
         console.log(err);
         res.status(500).send('Internal Server Error');
       }
      res.render('topic/add',{topics:topics, user:req.user})
    });
  });


  route.post('/add', function(req, res){
    var title = req.body.title;
    var description =req.body.description;
    var author=req.body.author;

    var sql='INSERT INTO topic(title,description,author) VALUES(?,?,?)';
    conn.query(sql,[title,description,author],function(err,rows,fields){
      if(err){
        consol.log(err);
        res.status(500).send('Internal Server Error');
      }else{
        res.redirect('/topic/'+rows.insertId);
      }
    })
  });


  route.get(['/:id/edit'], function(req,res){
    var sql='SELECT id,title FROM topic';
    conn.query(sql,function(err,topics,fields){
      var id=req.params.id;
      if(id){
        var sql='SELECT * FROM topic where id=?';
        conn.query(sql,[id],function(err,topic,fields){
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
          }else{
            res.render('topic/edit',{topics:topics, topic:topic[0], user:req.user}); //topic의 값들은 배열이기에 하나의 값만 가져오기 위해서 0을 붙힌것
          }
        })
      }else{
        console.log('There is no id');
        res.status(500).send('Internal Server Error');
      }
    });
  });

  route.post(['/:id/edit'], function(req,res){
    var title=req.body.title;
    var description=req.body.description;
    var author=req.body.author;
    var id=req.params.id;

    var sql='UPDATE topic SET title=?, description=?,author=? where id=?';
    conn.query(sql,[title,description,author,id],function(err,rows,fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }else{
        res.redirect('/topic/'+id);
      }
    })
  });

  route.get(['/:id/delete'], function(req,res){
    var sql='SELECT id,title FROM topic';
    var id=req.params.id;
    conn.query(sql,function(err,topics,fields){
      var sql='SELECT * FROM topic where id=?';//그 행이 실제로 있는지 확인하는것!
      conn.query(sql,[id],function(err,topic,fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          //res.send(topic);
          if(topic.length===0){
            console.log('There is no id.');
            res.status(500).send('Internal Server Error!!!');
          }else{
            res.render('topic/delete',{topics:topics,topic:topic[0],user:req.user});
          }
        }
      })
    });
  });


  route.post(['/:id/delete'], function(req,res){
    var id=req.params.id;
    var sql='Delete From topic where id=?';
    conn.query(sql,[id], function(err,result){
      //res.send(result);
      res.redirect('/topic/');
    })
  });
  route.get(['/','/:id'], function(req,res){
    var sql='SELECT id,title FROM topic';
    conn.query(sql,function(err,topics,fields){
      var id=req.params.id;
      if(id){
        var sql='SELECT * FROM topic where id=?';
        conn.query(sql,[id],function(err,topic,fields){
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
          }else{
            res.render('topic/view',{topics:topics,topic:topic[0]},user:req.user); //topic의 값들은 배열이기에 하나의 값만 가져오기 위해서 0을 붙힌것
          }
        })
      }else{
        res.render('topic/view',{topics:topics, user:req.user});
      }
    });
  });

  return route;
}
