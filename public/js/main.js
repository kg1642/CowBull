

//----------CLIENT-SIDE SOCKET CODE----------//
//Init socket object
var socket = io();
loop_count = 1;
var found_another_player = false;
var find_another_player;
var roomId;
var user_id;
var br = document.createElement("br");
function ConnectWithAnotherUser(){
	find_another_player = setInterval(another_player_socket_request, 1000);
}
//Receive data from the server using .on()
socket.on('seq-num', function (data) {
	//console.log(data);
	console.log(data[3]);
	roomId = data[3];
	//drawData(data);
});

socket.on('id', function (data) {
	//console.log(data);
	user_id = data;
	//drawData(data);
});


socket.on('found_another_player', function(data){
	found_another_player = data;
	if (found_another_player == true || loop_count==10){
		clearInterval(find_another_player);
	}
})

function another_player_socket_request(){
	loop_count = loop_count + 1;
	console.log('Not Found');
	socket.emit('get_another_player', 'asd');
}

function sendData(){
	//var guess = document.getElementById('guess').value;
	socket.emit('start_play', [roomId, true]);
}

// socket.on('guess_back', function (data) {
// 		document.getElementById('user_input').innerHTML = data;
// });

function countDown(start_game_user_id) {
  if(count === 0) {
    clearInterval(timer);
    if (start_game_user_id===user_id){
    	console.log('Here');
    	socket.emit('get_random_number', [roomId, true]);
    }
  } else {
  	console.log(count);
    document.getElementById('user_input').innerHTML = count;
    count--;
  }
}

var count = 3;
var timer;
var random_number;
socket.on('start_play', function (data) {
		if (data[0] == true){
			timer = setInterval(countDown, 1000, data[1]);
		}
});

socket.on('random_number', function (data) {
	random_number = data;
	document.getElementById('guess_box').style.display = 'block';
	//play_game(random_number)
});

function checkDuplicates(guess){
	if (guess[0]===guess[1] || guess[0]===guess[2] || guess[0]===guess[3] || guess[1]===guess[2] || guess[1]==guess[3] || guess[2]===guess[3]){
		alert('All Digits must be unique');
		return false
	}
	return true
}

function checkGuess(guess){
	if (guess.length != 4){
		alert('It must be a four digit number')
		return false
	}
	if (!(/^\d+$/.test(guess))){
		alert('It must be an Integer with four digits');
		return false
	}
	if (guess[0]==='0'){
		alert('First digit cannot be zero');
		return false
	}
	return checkDuplicates(guess)
}

function getCows(guess){
	var cows = 0;
	for (i=0; i<4; i++){
		if (parseInt(guess[i])==random_number[i]){
			cows = cows+1;
		}
	}
	return cows
}

function getBulls(guess){
	var bulls = 0;
	for (i=0; i<4; i++){
		for (j=0; j<4; j++){
			if (parseInt(guess[i])==random_number[j] && i!=j){
				//console.log(guess[i], random_number[j]);
			bulls = bulls+1;
			}
		}
	}
	return bulls
}


function guessNumber(){
	guess = document.getElementById('guess').value
	if (checkGuess(guess)){
		cows = getCows(guess)
		bulls = getBulls(guess)
		document.getElementById('CowBullValue').appendChild(br);
		var cow_bull_value = document.createTextNode(cows+" C "+bulls+" B");
		document.getElementById('CowBullValue').appendChild(cow_bull_value);
	}
	return
}

//
//setInterval(sendData, 1000);