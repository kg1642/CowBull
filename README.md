# CowBull

[CowBull](https://cowbull2.herokuapp.com) is a number guessing game. You can choose to play single player or multiplayer. If you choose single player, you will be playing against the computer but if you choose multiplayer, you will be playing against another player who is chosen randomly. For both single and multiplayer, you will be guessing a randomly selected four digit number (secret number). All the four digits in the number are unique and the number is greater than 1000. In multiplayer, you will try to guess the number earlier than your opponent. Your final score depends upon how fast you guesed the secret number and the number of your guesses.
![Main Page](https://github.com/kg1642/CowBull/blob/master/public/media/mainpage.png)
![Single Player Game in Action](https://github.com/kg1642/CowBull/blob/master/public/media/singleplayer.png)

# Motivation and Process

Cowbull is a popular game back home in Nepal. I used to play the game with my friends during my high school years. I designed this game and put it online so that other people also can play and have fun.
I wanted to recreate the fun I had when I used to play this game with my friends. Working on the project did bring back wonderful memories. 

# Design Decisions

Although, Cowbull is a simple game, it requires a bit of thinking and concentration. When you are thinking of a guess, you do not want to be distracted by other things in the page. Therefore, I decided to go for a clean design. There are not
any unncessary objects in the page. I also make sure any extra information you need is provided via a popup. Popup can be easily dismissed, can exist in the same page and makes the page look more cleaner.
I also decided to make the background light blue. I feel that the color light blue provides a peaceful vibe and it adds to the idea of making the webpage clean and distraction free.

# Resources

* [Nodejs](https://nodejs.org/en/)
* [Socket](https://socket.io/)

# APIs and Usage

The project also provides users APIs to get information about the users' score. Currently, only two type of API call can be made:

1. Get High Scores:
   * Description: Returns back top 5 scores for both Single Player and Multi Player game
   * Url : https://cowbull2.herokuapp.com/api/highScores

2. Get Score of a particular user
   * Description : Returns back all the scores of a particular user
   * Url : https://cowbull2.herokuapp.com/api/score/<user_name>
   * Example :https://cowbull2.herokuapp.com/api/score/krishna
   
 
# Next Steps:
The next step for this project would be to allow users to invite their friends to play against each other. Currently, the users do not have the option to choose whom to play against.
Allowing them to choose an opponent will be a good addition to the game. 
