//vars
var express = require('express')();
var http = require('http').createServer(express);
var mongo = require('mongodb');
var io = require('socket.io')(http);
const port = process.env.PORT || 8080;

var postdata = [];
var sockets = [];
var socketcount = 0;
var i;

//http
http.listen(port, function() {
  console.log('hosting on port 8080');
});

//mongodb
var MongoClient = mongo.MongoClient;
var url = 'mongodb+srv://username:password4@chatroomcluster-qhfkh.mongodb.net/test?retryWrites=true&w=majority';
var client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

//express
express.get('/', function(req, res) {
  res.statusCode = 200;
  res.sendFile(__dirname + "/index.html");
});

//use an array to update

//socket.io
io.on('connection', function(socket) {
  socket.id = socketcount;
  socketcount += 1;
  console.log('Socket Connect');
  socket.emit("update", getPosts());
  
  
  
  socket.on('post', function(data) {
    addPost(data.user, data.content);
  });
  
  socket.on('disconnect', function() {
    console.log('Socket Disconnect');
    delete sockets[socket.id];
  });
  
  sockets.push(socket);
});

//function
function getPosts() {
  client.connect(function(err) {
    //if (err) {throw err}
    console.log("database connect");
    var db = client.db('data');
    var posts = db.collection('posts');
    posts.find().toArray(function(err, items) {
      postdata = items;
    });
    client.close();
  });
  return postdata;
}

function addPost(user, content) {
  client.connect(function(err) {
    //if (err) {throw err}
    console.log("database connect");
    var db = client.db('data');
    var posts = db.collection('posts');
    posts.insertOne({
      user: user,
      content: content
    }, function(err, result) {
      
    });
    client.close();
  });
  
  for (i in sockets) {
    sockets[i].emit('update', [{user: user, content: content}]);
  }
}