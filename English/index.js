/*

SETUP

 */

//Constants
const fallingconstant = 0.92;
const jumpingconstant = 2.23;
const stoppingconstant = 85;
const groundconstant = 27.605;
const ceilingconstant = -7;
const pipespeedconstant = 0.55;
const pipedeathconstant = 36.7 + pipespeedconstant;

//preset variables
var gamestarted = 0;
//velocity of the bird
var velocityY = 12.5;

var survived = 0;
var score = 0;

var fallinginterval = '';
var pipemovinginterval = '';


//html elements
bird = document.getElementById("bird");
text = document.getElementsByTagName("h1");

pipes = document.getElementsByClassName("pipe");
//changing it into an array so foreach works on it
pipes = Array.from(pipes);

safezones = document.getElementsByClassName("safezone");
safezones = Array.from(safezones);

/*

GENERALIST FUNCTIONS

*/
   //Starting the game, setting the variable to 1 so the jumping functions know when to execute
   document.addEventListener("keydown", (e) => {
       if(event.keyCode == 32 && gamestarted==0){
           startgame()
           gamestarted=1;
       }
       else if(event.keyCode == 32 && gamestarted==1){
           //Should fix the issue with two falling intervals starting within 35ms time frame, if it doesn't, just try not to notice it :).
           setTimeout(() => {
               jumping()
             }, 35);
       }
   });

//Starting the game
function startgame(){
   //we hide the text in the beginning
   text[0].style.visibility = "hidden";
   pipesetup(80)

   //we set the score to 0
   score = 0;
   text[1].innerHTML = "0";

   //we set the starting velocity of the bird
   velocityY = 12.5
   bird.style.top = velocityY + "em";

   //we activate the intervals
   fallinginterval = setInterval(falling, 35);
   pipemovinginterval = setInterval(pipemoving, pipespeedconstant*100);
}



//Ending the game
function stopgame(){
   //clearing the intervals
   clearInterval(fallinginterval);
   clearInterval(pipemovinginterval);

   //setting the variable to 2 so no actions is permitted
   gamestarted = 2;

   //showing the game over text
   text[0].innerHTML = "Press spacebar to restart"
   text[0].style.visibility = "visible";

   //waiting a second before a player can start so it doesn't double click and start the falling interval twice
   setTimeout(() => {
       gamestarted = 0;
     }, 1000);

}

/*

BIRD FUNCTIONS

*/

//Function responsible for falling animation
function falling(){
    //adding the falling constant to the bird velocity every 35ms
    velocityY += fallingconstant;
    bird.style.top = velocityY + "em";

    //stops the game if you touch the ground
    if(velocityY > groundconstant){
        stopgame()
    }

}
function restartinterval(){
    //resetting the interval
    clearInterval(fallinginterval);

    //timing the event by stoppingconstant so the game feels smoother
    setTimeout(() => {

       //it fixed the issue with two intervals starting after death
       if(gamestarted==1){
        fallinginterval = setInterval(falling, 35);
       }

    }, stoppingconstant )
}

function jumping(){
    //Stopping the function from executing if game was lost
    if(gamestarted==2){
        return;
    }

    //Jumping only allowed when jump doesn't send you too far out of the map
    if(velocityY-jumpingconstant>ceilingconstant){

        velocityY -= jumpingconstant;
        bird.style.top = velocityY + "em";

        //restarting the interval so the jumping feels smoother
        restartinterval()
    } else{
        //if you try jumping higher than ceilingconstant it teleports you back
        bird.style.top = ceilingconstant + "em"
    }
}

/*

PIPES FUNCTIONS

*/
    //starting pipe setup
    function pipesetup(i){
       //setting the starting locations for the pipes
        pipes.forEach(pipe => {
            pipe.style.left = i + "em"
            i += (pipedeathconstant/1.5);
        });

        //setting the starting locations for the safezones
        safezones.forEach(safezone => {
            safezone.style.top = piperandom(0) + "em";
        })
    }

    //pipe movement
    function pipemoving(){
       //updating the score
        text[1].innerHTML = score;

        //pipes related movements
        pipes.forEach(pipe => {
           //pipe velocity
            var velocityX = Number((pipe.style.left).replace("em", ""));
            //top of the safezone represented as a child of pipe
            var safezonetop = Number(pipe.children[0].style.top.replace("em", "")) + 0.75;


            //if bird velocity is between a safezonestop and safezonebottom (which is always 5 em lower), pipes don't kill us
            if(safezonetop <= velocityY && velocityY <= safezonetop + 5) {
                survived = 1;
            }
            else{
                survived = 0;
            }

            //if velocityX is the same as the farthest X position of the bird (pipedeathconstant) it kill us unless we our at proper Y coordinates
            if(velocityX < pipedeathconstant && velocityX > (pipedeathconstant-pipespeedconstant-3) && survived != 1){
                stopgame();
            }

            //updates our score if the pipes are farther than the position of the bird
            if(velocityX < pipedeathconstant-3 && velocityX > pipedeathconstant-3-pipespeedconstant){
               score++;
            }

            //if pipes pass 10em of screen, we teleport them the farthest pipe starting location
            if(velocityX <= -10){
               //we generate a random safezone position
                pipe.children[0].style.top = piperandom(safezonetop) + "em";
                //teleportation
                velocityX = (pipedeathconstant/1.5)*3.5;
            }

            //responsible for movement, we subtract the pipespeedconstant from the velocity of the pipe so it moves to the left
            velocityX -= pipespeedconstant;
            pipe.style.left = velocityX + "em"
        });
    }

    //Generating a random location for a safezone
    function piperandom(safezonetop){
       //Generating a random number between 1.50 and 20.50 and assigning it to the style.top of the safezone element.
        safezonetop = (Math.random() * (1.49 - 20.51) + 20.51);
        return safezonetop;
    }
