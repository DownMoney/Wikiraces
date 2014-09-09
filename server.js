//http://en.wikipedia.org/wiki/Special:Random

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var client = require('http');
var io = require('socket.io')(http);

app.use("/static", express.static(__dirname + '/static'));

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

app.get('/wiki/:page', function(req, res){
	getPage(endpoint+req.params.page, function(html){
		res.write(html);
	});
});

var users = {};
var end = '';
var start = 'http://en.wikipedia.org/wiki/Steve_Jobs';
var endpoint = 'http://en.wikipedia.org';


getRandom(function(page){
	start = page;
	console.log('START: '+page);
});

getRandom(function(page){
	end ='/wiki/Radiator';
	console.log('END: '+page);
});


io.on('connection', function(socket){
  console.log('a user connected');

socket.on('disconnect', function(){
    console.log('user disconnected');
    delete users[socket.id];
    io.sockets.emit('update', users);
  });
  
  socket.on('new_user', function(data)
  {
  	users[socket.id] = {name: data.name, page: start, count: 0, pages:[start]};
  	io.sockets.emit('update', users);
  	socket.emit('end', end);
  	getPage(endpoint+start, function(html){
  		socket.emit('page', html);
  	});
  	
  });

  socket.on('navigate', function(data){

  	getPage(endpoint+data.page, function(html){
  		socket.emit('page', html);
  	});

  	if(data.page == end)
  		io.emit('winner', {name:data.name, count: users[socket.id]['count']});
  	
  	if(socket.id in users)
  	{
		users[socket.id]['page'] = data.page;
		users[socket.id]['pages'].push(data.page);
		users[socket.id]['count'] += 1;
		io.sockets.emit('new_page', {user: users[socket.id]['name'], page:data.page});
	}



  	io.sockets.emit('update', users);

  	
  	
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getPage(url, fn){
	console.log(url);

	client.get(url, function(res) {
    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });

    res.on('end', function() {
       fn(body);
    });
}).on('error', function(e) {
      console.log("Got error: ", e);
});
}

function getRandom(fn){
	getPage('http://en.wikipedia.org/w/api.php?action=query&list=random&rnlimit=1&format=json&rnnamespace=0', function(data){
		var json = JSON.parse(data);
		var page = '/wiki/'+json['query']['random'][0]['title'].replace(/\s/g, '_');
		
		fn(page);
	});
}