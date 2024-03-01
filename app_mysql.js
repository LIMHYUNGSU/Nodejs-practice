var express = require('express');
var app = express();
var bodyParser=require('body-parser');
var fs=require('fs');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database: 'o2'
});

conn.connect();

app.locals.pretty = true;

app.use(bodyParser.urlencoded({ extended: false }))


app.set('views', './views_mysql');
app.set('view engine', 'jade');

app.get('/topic/add', function(req, res){
  var sql='SELECT id,title FROM topic';
  conn.query(sql,function(err,topics,fields){
    if(err){
       console.log(err);
       res.status(500).send('Internal Server Error');
     }
    res.render('add',{topics:topics})
  });
});


app.post('/topic/add', function(req, res){
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


app.get(['/topic/:id/edit'], function(req,res){
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
          res.render('edit',{topics:topics, topic:topic[0]}); //topic의 값들은 배열이기에 하나의 값만 가져오기 위해서 0을 붙힌것
        }
      })
    }else{
      console.log('There is no id');
      res.status(500).send('Internal Server Error');
    }
  });
});

app.post(['/topic/:id/edit'], function(req,res){
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

app.get(['/topic/:id/delete'], function(req,res){
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
          res.render('delete',{topics:topics,topic:topic[0]});
        }
      }
    })
  });
});


app.post(['/topic/:id/delete'], function(req,res){
  var id=req.params.id;
  var sql='Delete From topic where id=?';
  conn.query(sql,[id], function(err,result){
    //res.send(result);
    res.redirect('/topic/');
  })
});


app.get(['/topic','/topic/:id'], function(req,res){
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
          res.render('view',{topics:topics,topic:topic[0]}); //topic의 값들은 배열이기에 하나의 값만 가져오기 위해서 0을 붙힌것
        }
      })
    }else{
      res.render('view',{topics:topics});
    }
  });
});



app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
