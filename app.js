//Set up requirements
var express = require("express");
var Request = require('request');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

//Create an 'express' object
var app = express();
app.use(favicon(__dirname + '/public/media/favicon.ico'));
//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

// Enable json body parsing of application/json
app.use(bodyParser.json());

var port = process.env.PORT || 3000;
// Start the server & save it to a var
var server = app.listen(port);
//Pass the server var as an arg to the 'io' init requirement
var io = require('socket.io')(server);
console.log('Express started on port ' + port);

var sequenceNumberByClient = new Map();
var rooms = new Set();
var total_clients_connected = new Set();
var total_available_clients = new Set();

function getRandomKey(collection) {
    let index = Math.floor(Math.random() * collection.size);
    let cntr = 0;
    for (let key of collection.keys()) {
        if (cntr++ === index) {
            return key;
        }
    }
}

function getRandomNumber(num){
	var arr = [0,1,2,3,4,5,6,7,8,9]
	random_number =  arr.map(a => [a,Math.random()]).sort((a,b) => {return a[1] < b[1] ? -1 : 1;}).slice(0,num).map(a => a[0]);
	while(random_number[0]==0){
		random_number =  arr.map(a => [a,Math.random()]).sort((a,b) => {return a[1] < b[1] ? -1 : 1;}).slice(0,num).map(a => a[0]);
	}
	return random_number;
}

io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);
    total_clients_connected.add(socket);
    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        sequenceNumberByClient.delete(socket);
        total_clients_connected.delete(socket);
    	total_available_clients.delete(socket);
        console.info(`Client gone [id=${socket.id}]`);
    });
    socket.emit('id', socket.id);
    
    socket.on('get_another_player', function (data){
    	//console.log('Some Data Sent');
    	//io.emit('seq-num', data);
    	total_available_clients.add(socket);
    	client_to_connect = socket;
    	if (total_available_clients.size > 1){
    		while(client_to_connect==socket){
    			client_to_connect = getRandomKey(sequenceNumberByClient)
    			//client_to_connect = sequenceNumberByClient.get(random_key);
    		}
    		var roomId = Math.random().toString(36).substring(2, 13);
    		//socket.room = roomId;
    		socket.join(roomId);
    		//client_to_connect.room = roomId;
    		client_to_connect.join(roomId);
    		rooms.add(roomId);
    		total_available_clients.delete(socket);
    		total_available_clients.delete(client_to_connect);
    		io.sockets.in(roomId).emit('found_another_player',true)
    		io.sockets.in(roomId).emit('seq-num',['Connected To a Room', socket.id, client_to_connect.id, roomId])
    		//console.log(client_to_connect.id);
    		//io.emit('seq-num', [io.id, client_to_connect.id]);
    	}
    	else { 
    		io.emit('found_another_player', false)
    	}
    });
    socket.on('guess', function(data){
  //   	console.log(data);
  //   	var clients_in_the_room = io.sockets.adapter.rooms[data[1]].sockets; 
		// for (var clientId in clients_in_the_room ) {
  // 			console.log(clientId); //Seeing is believing 
  // 			//var client_socket = io.sockets.connected[clientId];//Do whatever you want with this
		// }
    	io.sockets.in(data[1]).emit('guess_back', data[0]);
    });
    socket.on('start_play', function(data){
    	io.sockets.in(data[0]).emit('start_play', [true, socket.id]);
    });
    socket.on('get_random_number', function(data){
    	random_number = getRandomNumber(4)
    	io.sockets.in(data[0]).emit('random_number', random_number);
    });
    //console.log(client_to_connect.id);
    console.log(total_clients_connected.size, total_available_clients.size);
});


// sends each client its current sequence number
// setInterval(() => {
//     for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
//         client.emit("seq-num", sequenceNumber);
//         sequenceNumberByClient.set(client, sequenceNumber + 1);
//     }
// }, 1000);


/*-----
ROUTES
-----*/
//Main Page Route
app.get("/", function(req, res){
	res.render('index');
});

//Main Socket Connection
// io.on('connection', function (socket) {
//  //console.log('a user connected');
// 	socket.on('drawing', function (data) {
// 		//console.log(data);

// 		//Will send to everyone except the sender
// 		socket.broadcast.emit('news', data);

//   });
// });