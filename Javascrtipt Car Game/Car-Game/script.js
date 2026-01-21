const road = document.querySelector('.road');
const scoreDisplay = document.getElementById('score');
const startScreen = document.querySelector('.start-screen');
const gameOverScreen = document.querySelector('.game-over-screen');
const pauseScreen = document.querySelector('.pause-screen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const finalScoreSpan = document.getElementById('finalScore');

let playerCar;
let gameActive = false;
let gamePaused = false;
let score = 0;
let animationFrameId;

let playerLateralSpeed = 5;
let currentRoadSpeed = 0;
const initialRoadSpeed = 5;
const playerAcceleration = 0.2;
const playerDeceleration = 0.15;
const playerMaxSpeedBonus = 8;
const playerMinSpeedBonus = -3;

const keys = {
  'a': false, 'd': false, 'arrowleft': false, 'arrowright': false,
  'w': false, 'arrowup': false, 's': false, 'arrowdown': false
};

// MOBILE BUTTONS
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const mobileControls = document.querySelector('.mobile-controls');

function bindTouch(btn,key){
  if(!btn) return;
  btn.addEventListener("touchstart",()=>keys[key]=true);
  btn.addEventListener("touchend",()=>keys[key]=false);
  btn.addEventListener("touchcancel",()=>keys[key]=false);
}

bindTouch(btnLeft,"a");
bindTouch(btnRight,"d");
bindTouch(btnUp,"w");
bindTouch(btnDown,"s");

// KEYBOARD
document.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(keys.hasOwnProperty(key)) keys[key]=true;
  if(key==='escape' && gameActive) togglePause();
});
document.addEventListener('keyup',e=>{
  const key=e.key.toLowerCase();
  if(keys.hasOwnProperty(key)) keys[key]=false;
});

// BUTTONS
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);

function togglePause(){
  if(!gameActive) return;
  gamePaused=!gamePaused;
  if(gamePaused){
    cancelAnimationFrame(animationFrameId);
    pauseScreen.style.display='block';
    pauseButton.textContent='RESUME';
  }else{
    pauseScreen.style.display='none';
    pauseButton.textContent='PAUSE';
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

function setupGame(){
  road.innerHTML='';
  score=0;
  scoreDisplay.textContent='SCORE: 0';
  gameOverScreen.style.display='none';
  pauseScreen.style.display='none';
  pauseButton.style.display='block';
  currentRoadSpeed=initialRoadSpeed;
  gamePaused=false;
  pauseButton.textContent='PAUSE';
  for(const k in keys) keys[k]=false;

  playerCar=document.createElement('div');
  playerCar.setAttribute('class','car player');
  road.appendChild(playerCar);
  playerCar.x=(road.offsetWidth/2)-(playerCar.offsetWidth/2);
  playerCar.y=road.offsetHeight-playerCar.offsetHeight-120;
  playerCar.style.left=playerCar.x+'px';
  playerCar.style.top=playerCar.y+'px';
}

function startGame(){
  setupGame();
  startScreen.style.display='none';
  gameActive=true;
  animationFrameId=requestAnimationFrame(gameLoop);
  addInitialLines();
  addEnemyCars();

  // Show mobile buttons only on small screens
  if(window.innerWidth <= 900 && mobileControls){
    mobileControls.style.display='flex';
  }
}

function endGame(){
  gameActive=false;
  cancelAnimationFrame(animationFrameId);
  finalScoreSpan.textContent=Math.floor(score);
  gameOverScreen.style.display='block';
  pauseButton.style.display='none';
}

// ---------------- ROAD LINES ----------------
function addInitialLines(){
  document.querySelectorAll('.line').forEach(l=>l.remove());
  const numLines=Math.ceil(road.offsetHeight/150)+1;
  for(let i=0;i<numLines;i++){
    let line=document.createElement('div');
    line.setAttribute('class','line');
    line.style.top=(i*150)-100+'px';
    road.appendChild(line);
  }
}

function moveLines(){
  document.querySelectorAll('.line').forEach(l=>{
    l.style.top=l.offsetTop+currentRoadSpeed+'px';
    if(l.offsetTop>road.offsetHeight) l.style.top='-100px';
  });
}

// ---------------- ENEMY CARS ----------------
function createEnemyCar(){
  let enemy=document.createElement('div');
  enemy.setAttribute('class','car enemy');
  road.appendChild(enemy);
  let minX=0, maxX=road.offsetWidth-enemy.offsetWidth;
  enemy.x=Math.floor(Math.random()*(maxX-minX+1))+minX;
  enemy.y=(Math.random()*road.offsetHeight/2)*-1-100;
  enemy.style.left=enemy.x+'px';
  enemy.style.top=enemy.y+'px';
}

function addEnemyCars(){
  document.querySelectorAll('.enemy').forEach(e=>e.remove());
  for(let i=0;i<3;i++) createEnemyCar();
}

function moveEnemyCars(){
  document.querySelectorAll('.enemy').forEach(e=>{
    if(isCollision(playerCar,e)) endGame();
    e.style.top=e.offsetTop+currentRoadSpeed+'px';
    if(e.offsetTop>road.offsetHeight){ e.remove(); createEnemyCar(); }
  });
}

function isCollision(p,e){
  let pr=p.getBoundingClientRect(), er=e.getBoundingClientRect();
  return !(pr.bottom<er.top||pr.top>er.bottom||pr.right<er.left||pr.left>er.right);
}

// ---------------- PLAYER CAR ----------------
function movePlayerCar(){
  if((keys['a']||keys['arrowleft']) && playerCar.x>0) playerCar.x-=playerLateralSpeed;
  if((keys['d']||keys['arrowright']) && playerCar.x<(road.offsetWidth-playerCar.offsetWidth)) playerCar.x+=playerLateralSpeed;
  playerCar.style.left=playerCar.x+'px';
}

// ---------------- GAME LOOP ----------------
function gameLoop(){
  if(gameActive && !gamePaused){
    if(keys['w']||keys['arrowup']){
      currentRoadSpeed=Math.min(currentRoadSpeed+playerAcceleration,initialRoadSpeed+playerMaxSpeedBonus);
    }else if(keys['s']||keys['arrowdown']){
      currentRoadSpeed=Math.max(currentRoadSpeed-playerDeceleration,initialRoadSpeed+playerMinSpeedBonus);
    }else{
      if(currentRoadSpeed>initialRoadSpeed) currentRoadSpeed=Math.max(currentRoadSpeed-playerDeceleration,initialRoadSpeed);
      else if(currentRoadSpeed<initialRoadSpeed) currentRoadSpeed=Math.min(currentRoadSpeed+playerDeceleration,initialRoadSpeed);
    }

    movePlayerCar();
    moveLines();
    moveEnemyCars();

    scoreDisplay.textContent='SCORE: '+Math.floor(score += currentRoadSpeed/10);

    animationFrameId=requestAnimationFrame(gameLoop);
  }
}

// Hide mobile buttons if user resizes to PC
window.addEventListener('resize', ()=>{
  if(mobileControls){
    if(window.innerWidth > 900) mobileControls.style.display='none';
    else if(gameActive) mobileControls.style.display='flex';
  }
});

setupGame();
