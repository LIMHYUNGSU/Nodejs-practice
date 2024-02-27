var express=require('express');
var app=express();
var cookieParser = require('cookie-parser')
app.use(cookieParser('fajno823421sdad@$!@'));

var products={ //데이터베이스 대체용
  1:{title:'The history of web 1'},
  2:{title:'The next web'}
};
app.get('/products',function(req,res){
  var output='';
  for(var name in products){ //name은 1또는 2를 가르키겠지 (자바스크립트 for문)
    output+=`
    <li>
      <a href="/cart/${name}">${products[name].title}</a>
    </li>`
  }
  res.send(`<h1>Products</h1><ul>${output}</ul>
    <a href="/cart">Cart</a>`);
})
/*
cart={
  1:2
  2:1
}
*/
app.get('/cart/:id',function(req,res){
  var id=req.params.id;
  if(req.signedCookies.cart){
    var cart=req.signedCookies.cart;
  }else{ //최초로 실행된
    var cart={};
  }
  if(!cart[id]){
    cart[id]=0;  //3:0이라는 코드
  }
  cart[id]=parseInt(cart[id])+1;
  res.cookie('cart',cart,{signed:true});
  res.redirect('/cart');
})

app.get('/cart',function(req,res){
  var cart=req.signedCookies.cart;
  if(!cart){
    res.send('Empty');
  }else{
    var output='';
    for(var id in cart){
      output+=`<li>${products[id].title} (${cart[id]})</li>`
    }
  }
  res.send(`
    <h1>Cart</h1>
    <ul>${output}</ul>
    <a href="/Products">Products List</a>`);
})

app.get('/count', function(req,res){
  if(req.signedCookies.count){
    var count= parseInt(req.signedCookies.count); //req.cookies.count가 문자이므로 숫자로 바꿔주는것
  }else{
    var count=0;
  }
  count=count+1;
  res.cookie('count',count,{signed:true});
  res.send('count: '+count);
})

app.listen(3003, function(){
  console.log('Connetced 3003!!!')
});
