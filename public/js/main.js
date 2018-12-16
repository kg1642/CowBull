

var socket = io();
var loop_count = 1;
var found_another_player = false;
var find_another_player;
var roomId;
var user_id;
var number_of_guesses = 0;
var br = document.createElement("br");
var game_type;
var single_player_random_number;
var multiplayer_random_number;
var random_number;
var single_player_score = 1000;
var multiplayer_score = 1000;
var player_score;
var count = 5;
var timer;
var random_number;
var user_name;
var opponent_score;
var player_score = 1000;
var calc_score;
var user_name;
var opponent_user_name;
var game_over = false;
var guess_list = [];

$(document).ready(function(){
	document.getElementById('no_player_found').style.display = 'none';
    $('#guess').keypress(function(e){
      if(e.keyCode==13 && game_over==false)
      	$('#guess_submit').click();
    });
});


//makes the display of various divs none at the beginning of a game
function removeDivs(){
	document.getElementById('player_score_div').style.display = 'none';
	document.getElementById('opponent_score_div').style.display = 'none';
	document.getElementById('after_win').style.display = 'none';
	document.getElementById('guess_box').style.display = 'none';
	document.getElementById('searching_user').style.display = 'none';
	document.getElementById('no_player_found').style.display = 'none';
	document.getElementById('single_player_start_game').style.display = 'none';
	document.getElementById('correct_answer').style.display = 'none';
	document.getElementById('no_player_found').style.display = 'none';
	document.getElementById('CowBullValue').style.display = 'none';
}

//this function gets run when a user chooses multiplayer option
function multiPlayer(){
	console.log('multiPlayer')
	guess_list = [];
	removeDivs();
	game_over = false;
	number_of_guesses = 0;
	document.getElementById('guess_submit').disabled = false;
	document.getElementById("lets_play_button").disabled = true;
	game_type = "multi_player";
	player_score = 1000;
	loop_count = 0;
	document.getElementById('searching_user').style.display = 'block';
	document.getElementById('no_player_found').style.display = 'none';
	find_another_player = setInterval(another_player_socket_request, 500);
}

//displaying answer for the instructions part 
function diplayAnswer(){
	document.getElementById('answer').style.display = 'block';
	document.getElementById('show_answer').style.display  ='none';
}

//check opponent found or not when a user chooses multiplayer
socket.on('another_player_data', function (data) {
	roomId = data[3];
	console.log('Room ID:', roomId);
	count = 5;
	//if an opponent found, start the countdown to start the game
	if (data[0] == true){
		document.getElementById('searching_user').style.display = 'none';
		timer = setInterval(countDown, 1000, data[1]);
	}
});

//get the user name of the opponent
socket.on('opponent_user_name', function(data){
	opponent_user_name = data;
	console.log(opponent_user_name);
})

//get id for the user
socket.on('id', function (data) {
	//console.log(data);
	console.log('User ID:',data)
	user_id = data;
	//drawData(data);
});


socket.on('found_another_player', function(data){
	found_another_player = data;
	if (found_another_player == true){
		clearInterval(find_another_player);
		document.getElementById('searching_user').style.display = 'none';
		return
	}
})

//keep on calling the server to find an opponent until found or loop count reaches 40 (20 seconds)
function another_player_socket_request(){
	loop_count = loop_count + 1;
	console.log('Not Found');
	if(loop_count==40){
		document.getElementById('searching_user').style.display = 'none'
		document.getElementById('no_player_found').style.display = 'block';
		//alert('No one is online right now. Try again later.')
		document.getElementById("lets_play_button").disabled = false;
		clearInterval(find_another_player);
		return
	}
	socket.emit('get_another_player', 'asd');
}

function sendData(){
	//var guess = document.getElementById('guess').value;
	socket.emit('start_play', [roomId, true]);
}

// socket.on('guess_back', function (data) {
// 		document.getElementById('user_input').innerHTML = data;
// });

//countdown before the game starts
function countDown(start_game_user_id) {
	//if countdown is zero call server to get a random number else decrease the count
  if(count === 0) {
    clearInterval(timer);
    if (game_type=='multi_player'){
    	document.getElementById('another_player_found_div').style.display = 'none';
    	if (start_game_user_id === user_id){
    		socket.emit('get_multiplayer_random_number', [roomId, true]);
    	}
    } else {
    		document.getElementById('single_player_start_game').style.display = 'none';
    		socket.emit('get_single_player_random_number', true)
    }
  } else {
  	if (game_type=='multi_player'){
  		document.getElementById('another_player_found_div').style.display = 'block';
  		document.getElementById('multi_count').innerHTML = count;
  	} else{
  		document.getElementById('single_player_start_game').style.display = 'block';
  		document.getElementById('single_count').innerHTML = count;
  	}
    count--;
  }
}

//getting the random number for multiplayer game
socket.on('multiplayer_random_number', function (data) {
	multiplayer_random_number = data;
	game_type = "multi_player"; //change game_type to multi_player

	//show the relevant divs
	document.getElementById('another_player_found_div').style.display = 'none';
	document.getElementById('guess_box').style.display = 'block';
	document.getElementById('player_score_div').style.display = 'block';
	document.getElementById('opponent_score_div').style.display = 'block';
	document.getElementById('CowBullValue').innerHTML="";
	document.getElementById('CowBullValue').style.display="block";
	//document.getElementById('CowBullValue').style.height = window.innerHeight - 10 - $("#CowBullValue").position().top; 
	
	//start calculating the score
	calc_score = setInterval(score, 1000);
});

//check for duplicates in the guess entered
function checkDuplicates(guess){
	if (guess[0]===guess[1] || guess[0]===guess[2] || guess[0]===guess[3] || guess[1]===guess[2] || guess[1]==guess[3] || guess[2]===guess[3]){
		alert('All Digits must be unique');
		return false
	}
	return true
}

//check whether the guess is valid or not
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

//get the current random number
function getRandomNUmber(){
	if (game_type=='single_player'){
		return single_player_random_number
	}else{
		return multiplayer_random_number
	}
}


//function to calculate the number of cows in the guess
function getCows(guess){
	var random_number = getRandomNUmber();
	var cows = 0;
	for (i=0; i<4; i++){
		if (parseInt(guess[i])==random_number[i]){
			cows = cows+1;
		}
	}
	return cows
}

//get the number of bulls in the guess
function getBulls(guess){
	var random_number = getRandomNUmber();
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


//this function gets run when a guess is made
function guessNumber(){
	guess = document.getElementById('guess').value
	//console.log('Random Number', random_number);
	if (checkGuess(guess)){
		number_of_guesses = number_of_guesses + 1
		cows = getCows(guess)
		bulls = getBulls(guess)
		if (guess_list.includes(guess)){
			player_score = (player_score - 10)
		} else {
			//scoring mechanism
			player_score = (player_score - 10)+(cows*6)+(bulls*3);
		}			
		guess_list.push(guess);
		//document.getElementById('CowBullValue').appendChild(br);
		var p = document.createElement('p');
		//display the results
		p.innerHTML = number_of_guesses+": <b>"+guess+"</b>--> <font color='green'>"+cows+" Cows </font><font color='red'>"+bulls+" Bulls<font color='green'>";

		//var cow_bull_value = document.createTextNode(number_of_guesses+": "+cows+" C "+bulls+" B   \u000a");
		document.getElementById('CowBullValue').appendChild(p);
		var hints_div = document.getElementById("CowBullValue");
		hints_div.scrollTop = hints_div.scrollHeight;
		document.getElementById('guess').value="";
		if (cows == 4){
			//if number of cows is 4 then the game is over
			player_score = player_score + 100;
			document.getElementById("score").innerHTML = player_score;
			clearInterval(calc_score);
			game_over = true;
			//sending game over to the server
			socket.emit("game_over", [game_type, roomId, user_id, opponent_score, player_score, user_name, opponent_user_name]);
			console.log('Congratulations! You won the game.');
			//score();
			//alert('You won the game');
		}
	}
	return
}

//this function gets run when single player is clicked
function singlePlayer(){
	removeDivs();
	game_over = false;
	guess_list = [];
	number_of_guesses = 0;
	document.getElementById("lets_play_button").disabled = true;
	document.getElementById('guess_submit').disabled = false;
	console.log('Single Player clicked');
	game_type = "single_player";
	player_score = 1000;
	document.getElementById('no_player_found').style.display = 'none'
	count = 5 
	timer = setInterval(countDown, 1000, 'null');
}

//getting the random number for single player game
socket.on('single_player_random_number', function (data){
	//console.log(data);
	game_type = "single_player";
	single_player_random_number = data;
	document.getElementById('CowBullValue').innerHTML="";
	document.getElementById('guess_box').style.display = 'block';
	document.getElementById('CowBullValue').style.display = 'block';
	var cowbull_height = (window.innerHeight - 85 - $("#CowBullValue").position().top);
	document.getElementById('CowBullValue').style.height = String(cowbull_height)+"px"; 
	document.getElementById('player_score_div').style.display = 'block';
	//start calculating the score
	calc_score = setInterval(score, 1000);

})

//displaying the score
function score(){
	player_score = player_score - (Math.ceil(number_of_guesses/10));
	if (game_type=='multi_player'){
		socket.emit('player_score', [player_score, roomId, user_id]);
	}
	document.getElementById('score').innerHTML = player_score;
}


//get the user name of the user
function getUserName(){
	user_name = document.getElementById('user_name').value;
	if (user_name.length < 3){
		alert('User name should contain at least 3 letters.')
		return
	}
	socket.emit('user_name', user_name);
	$("#choseGameType").modal()
}

//get and display opponent score
socket.on('opponent_score', function(data){
	opponent_score = data;
	document.getElementById('opponent_score').innerHTML = data;
});

//server sends this when game os over
socket.on("game_over_server", function(data){
	game_over = true;
	console.log('Inside game_over_server');
	document.getElementById('lets_play_button').disabled = false
	document.getElementById('guess_submit').disabled = true;
	document.getElementById("after_win").style.display = "block";
	document.getElementById("CowBullValue").style.display = "none";
	document.getElementById('correct_answer').style.display = 'block';
	var user_winner = data[0];
	//displaying based on who won and game type
	if (data[1]=="multi_player"){
		clearInterval(calc_score);
		document.getElementById('correct_answer').innerHTML = "<p><h3>Correct Answer: "+multiplayer_random_number.join("")+"</h3></p>";
		if (user_winner == user_id){
			console.log('You won');
			document.getElementById("after_win_p").innerHTML = "<h3><font color ='blue'>Game Over. Congratulations, you won the game!</font></h3>";
		} else {
			console.log('You lost');
			document.getElementById("after_win_p").innerHTML = "<h3>Game Over. Your opponent won this time. Get them next time!</h3>";
		}
	} else {
		console.log('Congratulations! You got it.');
		document.getElementById('correct_answer').innerHTML = "<p><h3>Correct Answer:"+single_player_random_number.join("")+"</h3></p>";
		document.getElementById("after_win_p").innerHTML = "<h3><font color ='blue'> Congratulations! You got it.</font></h3>"
	}
	$("after_win_p").append('<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#user_name_div" id="lets_play_button">Play Again</span></button>')
});

//getting high scores 
function highScores(){
	$.ajax({
		url: "/api/highScores",
		type: 'GET',
		dataType: 'json',
		error: function(data){
			console.log(data);
			//alert("Oh No! Try a refresh?");
		},
		success: function(data){
			console.log(data);
			popupHighScores(data);
		}
	});
}

//creating a popup for high scores
function popupHighScores(data){
	var single_player_scores = data['single_player_scores'];
	var multi_player_scores = data['multi_player_scores'];
	var high_scores = "<p><h3><br>Single Player High Scores</h3></p><br>"
	if (single_player_scores.length>0){
		high_scores+="<table id='single_player_high_score_table' class='table table-hover'><tr><th>User Name</th><th>Score</th></tr>"
		single_player_scores.slice(0,5).forEach(function(player){
			high_scores+="<tr><td>"+player.user_name+"</td><td>"+player.score+"</td></tr>"
		})
		high_scores+="</table><br>"
	} else {
		high_scores+="<p>There are no records.</p><br><br>"
	}
	high_scores+="<p><h3>Multi Player High Scores</h3></p><br>"
	if (multi_player_scores.length>0){
		high_scores+="<table id='multi_player_high_score_table' class='table table-hover'><tr><th>User Name</th><th>Score</th><th>Played Against</th></tr>"
		multi_player_scores.slice(0,5).forEach(function (player){
			high_scores+="<tr><td>"+player.user_name+"</td><td>"+player.score+"</td><td>"+player.played_against+"</td></tr>"
		})
		high_scores+="</table>";
	} else {
		high_scores+="<p>There are no records.</p><br><br>"
	}
	$("#high_scores_div_main").modal()
	document.getElementById('high_scores_div').innerHTML = high_scores;
}
//highScores()
//
//setInterval(sendData, 1000);