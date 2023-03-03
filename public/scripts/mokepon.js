console.error = function() {};

// SECTIONS
const petSelection = document.getElementById('petSelection');
const mapViewSection = document.getElementById('mapView');
const attacksSelection = document.getElementById('attacksSelection');
const resultSection = document.getElementById('result');
const resetSection = document.getElementById('reset');
resetSection.style.display = 'none';

// BUTTONS
const petSelectionButton = document.getElementById('petSelectionButton');
const resetButton = document.getElementById('resetButton');

// SPANS
const playerPetSpan = document.getElementById('playerPet');
const enemyPetSpan = document.getElementById('enemyPet');
const playerLivesSpan = document.getElementById('playerLives');
const enemyLivesSpan = document.getElementById('enemyLives');
const playerAttacksSet = document.getElementById('playerAttacks');
const enemyAttacksSet = document.getElementById('enemyAttacks');

// GENERAL USAGE
const cardsContainer = document.getElementById('cardsContainer');
const attacksContainer = document.getElementById('attacksContainer');
const map = document.getElementById('map');

// GENERAL FUNCTIONS
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setIndexPlayers(player, enemy) {
  playerAttackIndex = playerAttacks[player];
  enemyAttackIndex = enemyAttacks[enemy];
}

// CLASSES
class Mokepon {
  constructor(name, image, lives, mapImage, id = null) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.lives = lives;
    this.attacks = [];
    this.width = 40;
    this.height = 40;
    this.x = getRandomNumber(0, map.width - this.width);
    this.y = getRandomNumber(0, map.height - this.height);
    this.mapImage = new Image();
    this.mapImage.src = mapImage;
    this.Xspeed = 0;
    this.Yspeed = 0;
  }

  drawMokepon() {
    lienzo.drawImage(
      this.mapImage,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

// PROJECT VARIABLES
let playerID;
let enemyID;
let mokepons = [];
let enemyPets = [];
let playerAttacks =[];
let enemyAttacks = [];
let mokeponsOption;
let hipodogeInput;
let capipepoInput;
let ratigueyaInput;
let playerPet;
let playerPetObject;
let mokeponAttacks;
let enemyMokeponAttacks;
let fireButton;
let waterButton;
let grassButton;
let buttons = [];
let playerAttackIndex;
let enemyAttackIndex;
let playerWins = 0;
let enemyWins = 0;
let lienzo = map.getContext("2d");
let mapHeight;
let mapWidth = window.innerWidth - 20;
let interval;
const mapwidthMax = 350;

// GAME INITIAL CHARACTERS
let hipodoge = new Mokepon('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png');
let capipepo = new Mokepon('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png');
let ratigueya = new Mokepon('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png');

const HIPODOGE_ATAQUES = [
  { name: '💧', id: 'waterButton' },
  { name: '💧', id: 'waterButton' },
  { name: '💧', id: 'waterButton' },
  { name: '🔥', id: 'fireButton' },
  { name: '🌱', id: 'grassButton' },
];

const CAPIPEPO_ATAQUES = [
  { name: '🌱', id: 'grassButton' },
  { name: '🌱', id: 'grassButton' },
  { name: '🌱', id: 'grassButton' },
  { name: '💧', id: 'waterButton' },
  { name: '🔥', id: 'fireButton' },
];

const RATIGUEYA_ATAQUES = [
  { name: '🔥', id: 'fireButton' },
  { name: '🔥', id: 'fireButton' },
  { name: '🔥', id: 'fireButton' }, 
  { name: '💧', id: 'waterButton' },
  { name: '🌱', id: 'grassButton' },
];

hipodoge.attacks.push(...HIPODOGE_ATAQUES);
capipepo.attacks.push(...CAPIPEPO_ATAQUES);
ratigueya.attacks.push(...RATIGUEYA_ATAQUES);

mokepons.push(hipodoge, capipepo, ratigueya);

// CANVAS
let mapBackground = new Image();
mapBackground.src = './assets/mokemap.png';

if (mapWidth > mapwidthMax) {
  mapWidth = mapwidthMax - 20;
}

mapHeight = mapWidth * 600 / 800;
map.width = mapWidth;
map.height = mapHeight;

window.addEventListener('load', lauchGame); // Where all starts...

function joinGame() {
  fetch("http://localhost:8080/join")
    .then(function (res) {
      if (res.ok) {
        res.text()
          .then(function (response) {
            playerID = response;
          });
      }
    });
}

function asignMokepon(playerPet) {
  fetch(`http://localhost:8080/mokepon/${playerID}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mokeponName: playerPet
    })
  });
}

function showAttacks(attacks) {
  attacks.forEach((attack) => {
    mokeponAttacks = `<button id=${attack.id} class="attack-button">${attack.name}</button>`;
    attacksContainer.innerHTML += mokeponAttacks;
  });

  fireButton = document.getElementById('fireButton');
  waterButton = document.getElementById('waterButton');
  grassButton = document.getElementById('grassButton');
  buttons = document.querySelectorAll('.attack-button');
}

function pullAttacks(playerPet) {
  let attacks;
  for (let i = 0; i < mokepons.length; i++) {
    if (playerPet === mokepons[i].name) {
      attacks = mokepons[i].attacks;
    }
  }

  showAttacks(attacks);
}

function getPetObject() {
  for (let i = 0; i < mokepons.length; i++) {
    if (playerPet === mokepons[i].name) {
      return mokepons[i]
    }
      
  }
}

function sendPosition(x, y) {
  fetch(`http://localhost:8080/mokepon/${playerID}/position`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      x,
      y
    })
  })
  .then(function (res) {
    if (res.ok) {
      res.json()
        .then(function ({ enemies }) {
          enemyPets = enemies.map(function (enemy) {
            let enemyMokepon = null;
            const mokeponName = enemy.mokepon.name || '';
            
            if (mokeponName === "Hipodoge") {
              enemyMokepon = new Mokepon('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png', enemy.id);
            } else if (mokeponName === "Capipepo") {
              enemyMokepon = new Mokepon('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png', enemy.id);
            } else if (mokeponName === "Ratigueya") {
              enemyMokepon = new Mokepon('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png', enemy.id);
            }
            
            enemyMokepon.x = enemy.x;
            enemyMokepon.y = enemy.y;

            return enemyMokepon;
          })
        });
    }
  });
}

function keyPressed(event) {
  switch (event.key) {
    case 'ArrowUp':
      playerPetObject.Yspeed = -5;
      break;
    case 'ArrowDown':
      playerPetObject.Yspeed = 5;
      break;
    case 'ArrowLeft':
      playerPetObject.Xspeed = -5;
      break;
    case 'ArrowRight':
      playerPetObject.Xspeed = 5;
      break;
    default:
      break;
  }
}

function moveOnTouch(way) {
  switch(way) {
    case 'UP':
      playerPetObject.Yspeed = -5;
      break;
    case 'DOWN':
      playerPetObject.Yspeed = 5;
      break;
    case 'LEFT':
      playerPetObject.Xspeed = -5;
      break;
    case 'RIGHT':
      playerPetObject.Xspeed = 5;
      break;
    default:
      break;
  }
}

function stopMovement() {
  playerPetObject.Xspeed = 0;
  playerPetObject.Yspeed = 0;
}

function setMessage(result) {
  let newPlayerAttack = document.createElement('p');
  let newEnemyAttack = document.createElement('p');

  resultSection.innerHTML = result;
  newPlayerAttack.innerHTML = playerAttackIndex;
  newEnemyAttack.innerHTML = enemyAttackIndex;

  playerAttacksSet.appendChild(newPlayerAttack);
  enemyAttacksSet.appendChild(newEnemyAttack);

  // console.log(playerAttacksSet);
  // console.log(enemyAttacksSet);
}

function setResultMessage(finalResult) {
  resultSection.innerHTML = finalResult;
  resetSection.style.display = 'block';
}

function checkLives() {
  if (playerWins === enemyWins) {
    setResultMessage("THIS WAS A TIE");
  } else if (playerWins > enemyWins) {
    setResultMessage("GONGRATULATIONS, YOU WIN");
  } else {
    setResultMessage('SORRY, YOU LOSE');
  }
}


function fight() {
  clearInterval(interval);
  
  for (let i = 0; i < playerAttacks.length; i++) {

    if (playerAttacks[i] === enemyAttacks[i]) {
      setIndexPlayers(i, i);
      setMessage("TIE");
    } else if (playerAttacks[i] === 'FIRE' && enemyAttacks[i] === 'GRASS') {
      setIndexPlayers(i, i);
      setMessage("YOU WIN");
      playerWins++;
      playerLivesSpan.innerHTML = playerWins;
    } else if (playerAttacks[i] ==='WATER' && enemyAttacks[i] === 'FIRE') {
      setIndexPlayers(i, i);
      setMessage("YOU WIN");
      playerWins++;
      playerLivesSpan.innerHTML = playerWins;
    } else if (playerAttacks[i] === 'GRASS' && enemyAttacks[i] === 'WATER') {
      setIndexPlayers(i, i);
      setMessage("YOU WIN");
      playerWins++;
      playerLivesSpan.innerHTML = playerWins;
    } else {
      setIndexPlayers(i, i);
      setMessage("YOU LOSE");
      enemyWins++;
      enemyLivesSpan.innerHTML = enemyWins;
    }
  }

  checkLives();
}

function getEnemyAttacks() {
  fetch(`http://localhost:8080/mokepon/${enemyID}/attacks`)
    .then(function (res) {
      if (res.ok) {
        res.json()
          .then(function ({ attacks }) {
            if (attacks.length === 5) {
              enemyAttacks = attacks;
              fight();
            }
          });
      }
    });
}


function sendAttacks() {
  fetch(`http://localhost:8080/mokepon/${playerID}/attacks`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      attacks: playerAttacks
    })
  });

  interval = setInterval(getEnemyAttacks, 50);
}

function setAttacks() {
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      if (e.target.textContent === '🔥') {
        playerAttacks.push('FIRE');
        button.style.background = '#112f58';
        button.disabled = true;
      } else if (e.target.textContent === '💧') {
        playerAttacks.push('WATER');
        button.style.background = '#112f58';
        button.disabled = true;
      } else {
        playerAttacks.push('GRASS');
        button.style.background = '#112f58';
        button.disabled = true;
      }
      if (playerAttacks.length === 5) {
        sendAttacks();
      }
    });
  });
}

function asignEnemyPet(enemy) {
  enemyPetSpan.innerHTML = enemy.name;
  enemyMokeponAttacks = enemy.attacks;
  setAttacks();
}

function checkCollide(enemy) {
  const enemyUP = enemy.y;
  const enemyDOWN = enemy.y + enemy.height;
  const enemyRIGHT = enemy.x + enemy.width;
  const enemyLEFT = enemy.x;

  const playerUP = playerPetObject.y;
  const playerDOWN = playerPetObject.y + playerPetObject.height;
  const playerRIGHT = playerPetObject.x + playerPetObject.width;
  const playerLEFT = playerPetObject.x;

  if (
    playerDOWN < enemyUP ||
    playerUP > enemyDOWN ||
    playerRIGHT < enemyLEFT ||
    playerLEFT > enemyRIGHT
  ) { return }

  stopMovement();
  clearInterval(interval);

  enemyID = enemy.id;
  mapViewSection.style.display = 'none';
  attacksSelection.style.display = 'flex';
  asignEnemyPet(enemy);
}

function drawCanvas() {
  playerPetObject.x = playerPetObject.x + playerPetObject.Xspeed;
  playerPetObject.y = playerPetObject.y + playerPetObject.Yspeed;
  
  lienzo.clearRect(0, 0, map.width, map.height);
  lienzo.drawImage(
    mapBackground,
    0,
    0,
    map.width,
    map.height
  );

  playerPetObject.drawMokepon();
  sendPosition(playerPetObject.x, playerPetObject.y);
  
  enemyPets.forEach(function (mokepon) {
    mokepon.drawMokepon();
    checkCollide(mokepon);
  })
}

function launchMap() {
  playerPetObject = getPetObject(playerPet);
  interval = setInterval(drawCanvas, 50);
  
  window.addEventListener('keydown', keyPressed);
  window.addEventListener('keyup', stopMovement);
}

function selectPlayerPet() {
  petSelection.style.display = 'none';
  
  if (hipodogeInput.checked) {
    playerPetSpan.innerHTML = hipodogeInput.id;
    playerPet = hipodogeInput.id;
  } else if (capipepoInput.checked) {
    playerPetSpan.innerHTML = capipepoInput.id;
    playerPet = capipepoInput.id;
  } else if (ratigueyaInput.checked) {
    playerPetSpan.innerHTML = ratigueyaInput.id;
    playerPet = ratigueyaInput.id;
  } else {
    alert('Please select a pet');
    window.location.reload();
  }

  asignMokepon(playerPet);
  pullAttacks(playerPet);

  launchMap();
  mapViewSection.style.display = 'flex';
}

function lauchGame() {
  attacksSelection.style.display = 'none';
  mapViewSection.style.display = 'none';

  mokepons.forEach((mokepon) => {
    mokeponsOption = `
    <input type="radio" name="pet" id=${mokepon.name} />
    <label class="mokepon-card" for=${mokepon.name}>
      <p>${mokepon.name}</p>
      <img src=${mokepon.image} alt=${mokepon.name} />
    </label>
    `;
    cardsContainer.innerHTML += mokeponsOption;

    hipodogeInput = document.getElementById('Hipodoge');
    capipepoInput = document.getElementById('Capipepo');
    ratigueyaInput = document.getElementById('Ratigueya');
  })

  joinGame();
    
  petSelectionButton.addEventListener('click', selectPlayerPet);
  resetButton.addEventListener('click', function () {
    window.location.reload();
  });
}
