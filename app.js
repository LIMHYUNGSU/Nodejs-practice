var express = require('express');
var app = express();
var bodyParser=require('body-parser');

app.locals.pretty = true; // jade문법 예쁘게 보이기

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/form', function(req,res){
  res.render('form');
});
app.get('/form_receiver',function(req,res){
  var title=req.query.title;
  var description=req.query.description;
  res.send(title+','+description);
})
app.post('/form_receiver',function(req,res){
  var title=req.body.title;
  var description=req.body.description;
  res.send(title+','+description);
})

app.get('/topic/:id', function(req,res){
  var topics=[
    'Javascript is...',
    'Nodejs is ...',
    'Express is ...'
  ];
  var output = `
    <a href="/topic/0">Javascript</a><br>
    <a href="/topic/1">Nodejs</a><br>
    <a href="/topic/2">Express</a><br>
    ${topics[req.params.id]}
  `
  res.send(output);
});
app.get('/topic/:id/:mode' ,function(req,res){
  res.send(req.params.id +',' + req.params.mode)
})
app.get('/template', function(req,res){
  res.render('temp', {time:Date(), _title:'Jade'});
});

app.get('/',function(req, res){
  res.send('Hello home page');
});
app.get('/dynamic',function(req,res){
  var output = `
  <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        Hello Dynamic!
    </body>
    </html>`
  res.send(output)
});
app.get('/route', function(req,res){
  res.send('Hello Router, <img src="/route.png">');
});
app.get('/login', function(req,res){
  res.send('Login please');
});
app.listen(3000,function(){
  console.log('Conneted 3000 port!');
});
