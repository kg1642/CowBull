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

//initializing variables 
var sequenceNumberByClient = new Map();
var rooms = new Set();
var total_clients_connected = new Set();
var total_available_clients = new Set();

// database connection information
var cloudant_USER = process.env.CLOUDANTUSER;
var cloudant_DB = process.env.CLOUDANTDB;
var cloudant_KEY = process.env.CLOUDANTKEY;
var cloudant_PASSWORD = process.env.CLOUDANTPASSWORD;

var cloudant_URL = "https://" + cloudant_USER + ".cloudant.com/" + cloudant_DB;

app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
  next();
});

// randomly get key of a connected client
function getRandomKey(collection) {
    let index = Math.floor(Math.random() * collection.size);
    let cntr = 0;
    for (let key of collection.keys()) {
        if (cntr++ === index) {
            return key;
        }
    }
}


//generate the random number which will be sent to the players
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
    // add the client to the client list
    total_clients_connected.add(socket);
    // when socket disconnects, remove it from all the lists
    socket.on("disconnect", () => {
        sequenceNumberByClient.delete(socket);
        total_clients_connected.delete(socket);
    	total_available_clients.delete(socket);
        console.info(`Client gone [id=${socket.id}]`);
    });
    // emit that a new client is added
    socket.emit('id', socket.id);
    
    // finding another player for multiplayer game
    socket.on('get_another_player', function (data){
    	sequenceNumberByClient.set(socket, 1);
    	//console.log('Some Data Sent');
    	//io.emit('seq-num', data);
    	total_available_clients.add(socket);
    	client_to_connect = socket;
    	if (total_available_clients.size > 1){
    		while(client_to_connect==socket){
    			client_to_connect = getRandomKey(sequenceNumberByClient)
    			//client_to_connect = sequenceNumberByClient.get(random_key);
    		}
		//creating room Id
    		var roomId = Math.random().toString(36).substring(2, 13);
    		//socket.room = roomId;
    		socket.join(roomId);
    		//client_to_connect.room = roomId;
    		client_to_connect.join(roomId);
		
		//add the player to the room and delete it from available list
    		rooms.add(roomId);
    		total_available_clients.delete(socket);
    		sequenceNumberByClient.delete(socket);
    		sequenceNumberByClient.delete(client_to_connect);
    		total_available_clients.delete(client_to_connect);
		//send the info of opponent (another player) to the game
    		io.in(roomId).emit('found_another_player', true)
    		io.in(roomId).emit('another_player_data',[true, socket.id, client_to_connect.id, roomId])
    		socket.emit('opponent_user_name', client_to_connect.user_name);
    		socket.to(roomId).emit('opponent_user_name', socket.user_name)
    		//console.log(client_to_connect.id);
    		//io.emit('seq-num', [io.id, client_to_connect.id]);
    	}
    	else { 
		//if opponent (another player) not found send false
    		socket.emit('found_another_player', false)
    	}
    });
	
    socket.on('guess', function(data){
    	io.sockets.in(data[1]).emit('guess_back', data[0]);
    });
	
    // receive the username and save
    socket.on('user_name', function(data){
    	//console.log(data)
    	socket['user_name'] = data;
    	//console.log(socket.user_name)
    })

    // send the random number for multiplayer game to the frontend
    socket.on('get_multiplayer_random_number', function(data){
    	random_number = getRandomNumber(4)
    	io.in(data[0]).emit('multiplayer_random_number', random_number);
    });
	
    // send the random number for single player game to the frontend
    socket.on('get_single_player_random_number', function (data){
    	random_number = getRandomNumber(4);
    	console.log(random_number);
    	socket.emit('single_player_random_number', random_number);
    });
    // send players score
    socket.on('player_score', function(data){
    	socket.to(data[1]).emit('opponent_score', data[0]);
    });
    // on game over save data and let the users know who won based on the game type
    socket.on('game_over', function(data){
    	var user_winner = data[2];
    	var game_type = data[0];
    	if (game_type=='multi_player'){
    		io.in(data[1]).emit('game_over_server', [user_winner, game_type]);
    		socket.to(data[1]).emit('opponent_score', data[4]);
    	} else {
    		socket.emit('game_over_server', [user_winner, game_type]);
    	}
    	saveData(data);
    	
    });
    //console.log(client_to_connect.id);
    console.log(total_clients_connected.size, total_available_clients.size);
});

/*-----
ROUTES
-----*/
//Main Page Route
app.get("/", function(req, res){
	res.render('index');
});

// save data in Cloudant 
function saveCloudant(data){
	console.log(data);
	//Send the data to the db
	Request.post({
		url: cloudant_URL,
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true,
		body: data
	},
	function (error, response, body){
		if (response.statusCode == 201){
			//console.log(body);
			//res.json(body);
			a = 2;
		}
		else{
			console.log("Uh oh...");
			console.log("Error: " + res.statusCode);
			//res.send("Something went wrong...");
		}
	});
}

function saveData(data){
	game_type = data[0]
	if (game_type=="single_player"){
		var obj = {'user_name': data[5],
					'game_type':'single_player',
					'score':data[4],
					'played_against':'',
					'won':''};
		saveCloudant(obj)
	} else {
		saveCloudant({'user_name':data[5], 'game_type':data[0],'score':data[4],'played_against':data[6],'won':'1'});
		saveCloudant({'user_name':data[6], 'game_type':data[0],'score':data[3],'played_against':data[5],'won':'0'})
	}
}

function predicateBy(prop){
   return function(a,b){
      if( a[prop] > b[prop]){
          return -1;
      }else if( a[prop] < b[prop] ){
          return 1;
      }
      return 0;
   }
}

// route to get the high scores
app.get("/api/highScores", function(req, res){
	Request.get({
		url: cloudant_URL+"/_all_docs?include_docs=true",
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	},
	function (error, response, body){
		var theRows = body.rows;
		//Filter the results to match the current word
		var single_player_scores = [];
		var multi_player_scores = [];
		theRows.forEach(function(d){
			if (d.doc.game_type=="single_player"){
				single_player_scores.push(d.doc);
			} else if (d.doc.game_type=="multi_player"){
				multi_player_scores.push(d.doc)
			}
		})
		single_player_scores.sort(predicateBy("score"));
		multi_player_scores.sort(predicateBy("score"));
		//return top 5 scorers
		res.json({'single_player_scores':single_player_scores.slice(0,5), 'multi_player_scores':multi_player_scores.slice(0,5)});
	});
})

app.post("/save", function(req,res){
	//Get the data from the body
	var data = req.body;
	console.log(data);
	//Send the data to the db
	Request.post({
		url: cloudant_URL,
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true,
		body: data
	},
	function (error, response, body){
		if (response.statusCode == 201){
			console.log("Saved!");
			//res.json(body);
		}
		else{
			console.log("Uh oh...");
			console.log("Error: " + res.statusCode);
			res.send("Something went wrong...");
		}
	});
});

// get the score of a player based on user name
app.get("/api/score/:user_name", function(req, res){
	var user_name = req.params.user_name;
	console.log('Making a db request for: ' + user_name);
	//Use the Request lib to GET the data in the CouchDB on Cloudant
	Request.get({
		url: cloudant_URL+"/_all_docs?include_docs=true",
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	},
	function (error, response, body){
		var theRows = body.rows;
		//Filter the results to match the current word
		var user_name_scores = [];
		theRows.forEach(function(d){
			if (d.doc.user_name==user_name){
				user_name_scores.push(d.doc);
			}
		});
		if (user_name_scores.length<1){
			res.json({'error':1, 'desc':'No record found'})
		}else{
			res.json({'error':0, 'total_games':user_name_scores.length, 'games':user_name_scores});
		}
	});
});
