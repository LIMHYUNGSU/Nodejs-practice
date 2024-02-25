var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database: 'o2'
});

conn.connect();

// var sql='SELECT *FROM topic';
// conn.query(sql, function(err,rows,fields){
//   if(err){
//     console.log(err);
//   }else{
//     for(var i=0; i<rows.length; i++){
//       console.log(rows[i].author);
//     }
//   }
// });
// var sql='INSERT into topic(title,description,author) VALUES(?,?,?)';
// var params=['Supervisor','Watcher','graphittie']
// conn.query(sql,params,function(err,rows,fields){
//   if(err){
//     console.log(err);
//   }else{
//     console.log(rows.insertID);
//   }
// });
// var sql='UPDATE topic SET title=?, description=? where id=?';
// var params=['NPM','leezche',1];
// conn.query(sql,params,function(err,rows,fields){
//   if(err){
//     console.log(err);
//   }else{
//     console.log(rows);
//   }
// });
var sql='Delete from topic where id=?';
var params=[7];
conn.query(sql,params,function(err,rows,fields){
  if(err){
    console.log(err);
  }else{
    console.log(rows);
  }
});
conn.end();
