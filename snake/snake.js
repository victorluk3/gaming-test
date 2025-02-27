const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

let user = {
  id: 'user',
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 5,
  trail: [{x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2}],
  score: 0,
  color: 'lime',
  speed: 2,
  boostedSpeed: 4,
  isBoosted: false
};

let paused = false

const circle = {
  x: 60,
  y: 60,
  radius: 25,
  color: 'blue'
};

const boost = {
  x: canvas.width - 150,
  y: canvas.width - 150,
  radius: 25,
  color: 'breen'
};


// Joystick data
let joystick = {
  baseX: 100, // Base position
  baseY: canvas.height - 150,
  baseRadius: 50,
  knobX: 100, // Knob position
  knobY: canvas.height - 150,
  knobRadius: 30,
  active: false
};

// Touch positions
let touchStart = { x: 0, y: 0 };
let touchMove = { x: 0, y: 0 };

// Draw joystick
function drawJoystick() {
  // Draw base
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(joystick.baseX, joystick.baseY, joystick.baseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw knob
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.arc(joystick.knobX, joystick.knobY, joystick.knobRadius, 0, Math.PI * 2);
  ctx.fill();
}

function updateJoystick() {
  if (joystick.active) {
    const dx = touchMove.x - joystick.baseX;
    const dy = touchMove.y - joystick.baseY;

    const distance = Math.hypot(dx, dy);
    const maxDistance = joystick.baseRadius;

    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      joystick.knobX = joystick.baseX + Math.cos(angle) * maxDistance;
      joystick.knobY = joystick.baseY + Math.sin(angle) * maxDistance;
    } else {
      joystick.knobX = touchMove.x;
      joystick.knobY = touchMove.y;
    }

    // Normalize direction
    // snake.direction.x = (joystick.knobX - joystick.baseX) / maxDistance;
    // snake.direction.y = (joystick.knobY - joystick.baseY) / maxDistance;
  } else {
    // Reset joystick knob to center when inactive
    joystick.knobX = joystick.baseX;
    joystick.knobY = joystick.baseY;

  }
}





// Función para dibujar el círculo
function drawCircle() {
  ctx.fillStyle = 'rgba(0,0,255,0.5)';
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'blue';
  ctx.font = '12px Arial';
  ctx.fillText('pause', 45, 63);

  ctx.fillStyle = 'rgba(0,0,255,0.5)';
  ctx.beginPath();
  ctx.arc(boost.x, boost.y, boost.radius, 0, Math.PI * 2);
  ctx.fill();


}

// Verifica si un punto está dentro de un círculo
function isInsideCircle(px, py, cx, cy, radius) {
  return Math.hypot(px - cx, py - cy) < radius;
}

function isInsideCube(px, py, cubo) {

  if (
    px >= cubo.x &&
    px <= cubo.x + cubo.width &&
    py >= cubo.y &&
    py <= cubo.y + cubo.height
  ) {

    return true

  }

  return false


}



// Eventos de clic/touch
canvas.addEventListener('click', (e) => {
  if(isMobile()) return

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (isInsideCircle(mouseX, mouseY,circle.x, circle.y, circle.radius)) {
    
    pause()
    localStorage.setItem('pause', paused)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('players', JSON.stringify(players))
    localStorage.setItem('carnadas', JSON.stringify(carnadas))

  } else if(isInsideCube(mouseX, mouseY, buttonResume) && paused) {

    paused = false
    //check if exist stored data
    let cUser = localStorage.getItem('user')
    if(cUser != null) {
      user = JSON.parse(cUser)
    }
    let cPlayers = localStorage.getItem('players')
    if(cPlayers != null) {
      players = JSON.parse(cPlayers)
    }

    let cCarnadas = localStorage.getItem('carnadas')
    if(cCarnadas != null) {
      carnadas = JSON.parse(cCarnadas)
    }

    gameLoop()
  } else if(isInsideCube(mouseX, mouseY, buttonReset) && paused) {
    //reset
    paused = false
    localStorage.clear()
    startGame()
  } else {
    //boost.active = true
  }



});

let menuRect = {
  width: 250,
  height: 200,
  x: 0,
  y: 0
}

let buttonResume = {
  width: 200,
  height: 50,
  x: 0,
  y: 0
}

let buttonReset = {
  width: 200,
  height: 50,
  x: 0,
  y: 0
}

function menu(){
  menuRect.x = (canvas.width / 2) - (menuRect.width / 2)
  menuRect.y = (canvas.height / 2) - (menuRect.height / 2)

  buttonResume.x = (canvas.width / 2) - (buttonResume.width / 2)
  buttonResume.y = menuRect.y + 30

  ctx.fillStyle = 'rgba(0,0,0,0.5)';       // Define el color de relleno
  ctx.fillRect(menuRect.x,menuRect.y, menuRect.width, menuRect.height); // Dibuja un cuadrado en (x: 50, y: 50) con ancho y alto de 100px
  ctx.strokeStyle = 'black';      // Define el color de los bordes
  ctx.lineWidth = 5;            // Define el grosor del borde
  ctx.strokeRect(menuRect.x,menuRect.y, menuRect.width, menuRect.height); // Dibuja un cuadrado con bordes en (x: 200, y: 50)

  // button resume
  ctx.fillStyle = 'rgb(0, 143, 209)';       // Define el color de relleno
  ctx.fillRect(buttonResume.x, buttonResume.y, buttonResume.width, buttonResume.height); // Dibuja un cuadrado en (x: 50, y: 50) con ancho y alto de 100px
  ctx.strokeStyle = 'white';      // Define el color de los bordes
  ctx.lineWidth = 1;            // Define el grosor del borde
  ctx.strokeRect(buttonResume.x, buttonResume.y, buttonResume.width, buttonResume.height); // Dibuja un cuadrado con bordes en (x: 200, y: 50)
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Resume', buttonResume.x + 10, buttonResume.y + 30);


  buttonReset.x = buttonResume.x
  buttonReset.y = buttonResume.y + buttonResume.height + 20
    // button reset
    ctx.fillStyle = 'rgb(0, 143, 209)';       // Define el color de relleno
    ctx.fillRect(buttonReset.x, buttonReset.y, buttonReset.width, buttonReset.height); // Dibuja un cuadrado en (x: 50, y: 50) con ancho y alto de 100px
    ctx.strokeStyle = 'white';      // Define el color de los bordes
    ctx.lineWidth = 1;            // Define el grosor del borde
    ctx.strokeRect(buttonReset.x, buttonReset.y, buttonReset.width, buttonReset.height); // Dibuja un cuadrado con bordes en (x: 200, y: 50)
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Reset', buttonReset.x + 10, buttonReset.y + 30);


}


function pause(){
  paused = !paused
  console.log('click', paused)

  if(!paused)
    gameLoop()
  else
    menu()
}

const touches = {}; // Almacena información de los toques activos

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Evita el comportamiento predeterminado de desplazamiento
  const rect = canvas.getBoundingClientRect();

  for (let i = 0; i < e.touches.length; i++) {
    const touch = e.touches[i];
    touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (isInsideCircle(touchX, touchY,circle.x, circle.y, circle.radius)) {
    
      pause()
      localStorage.setItem('pause', paused)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('players', JSON.stringify(players))
      localStorage.setItem('carnadas', JSON.stringify(carnadas))
  
    } else if(isInsideCube(touchX, touchY, buttonResume) && paused) {
  
      paused = false
      //check if exist stored data
      let cUser = localStorage.getItem('user')
      if(cUser != null) {
        user = JSON.parse(cUser)
      }
      let cPlayers = localStorage.getItem('players')
      if(cPlayers != null) {
        players = JSON.parse(cPlayers)
      }
  
      let cCarnadas = localStorage.getItem('carnadas')
      if(cCarnadas != null) {
        carnadas = JSON.parse(cCarnadas)
      }
  
      gameLoop()
    } else if(isInsideCube(touchX, touchY, buttonReset) && paused) {
      //reset
      paused = false
      localStorage.clear()
      startGame()
    }else if (isInsideCircle(touch.clientX, touch.clientY, joystick.x, joystick.y, joystick.radius)) {
      joystick.active = true;
    } else if (isInsideCircle(touchX, touchY, boost.x, boost.y, boost.radius)) {
      console.log('boost')
      boost.active = true;
    }

    const dx = touch.clientX - joystick.baseX;
    const dy = touch.clientY - joystick.baseY;
    const distance = Math.hypot(dx, dy);
  
    if (distance <= joystick.baseRadius) {
      joystick.active = true;
      touchStart.x = touch.clientX;
      touchStart.y = touch.clientY;
      touchMove.x = touch.clientX;
      touchMove.y = touch.clientY;
    }


  }


  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Evita el comportamiento predeterminado de desplazamiento
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    touchPad.offsetX = touchX - touchPad.x;
    touchPad.offsetY = touchY - touchPad.y;
    touchPad.x = touchX;
    touchPad.y = touchY;

    if (joystick.active) {
      touchMove.x = touchX;
      touchMove.y = touchY;
    }
  });
  



//   if (isInsideCircle(touchX, touchY)) {
//     paused = !paused
//     console.log('touch', paused)
//     gameLoop()

//   }

//   if(isInsideBoost(touchX, touchY)){
//     user.speed = 4
//   }
});



// Detectar cuando se levantan los toques
canvas.addEventListener('touchend', (e) => {
  const rect = canvas.getBoundingClientRect();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    delete touches[touch.identifier];

  
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

   
    if (isInsideCircle(touchX, touchY, joystick.baseX, joystick.baseY, joystick.baseRadius)) {
      //joystick.active = true;
      if (joystick.active) {
        joystick.active = false;

        joystick.knobX = joystick.baseX;
        joystick.knobY = joystick.baseY;
      }
    } else if(isInsideCircle(touchX, touchY, boost.x, boost.y, boost.radius)){
      boost.active = false;
    }

  }
});

// canvas.addEventListener('touchend', (e) => {
//   const rect = canvas.getBoundingClientRect();
//   const touchX = e.touches[0].clientX - rect.left;
//   const touchY = e.touches[0].clientY - rect.top;
//   if(isInsideBoost(touchX, touchY)){
//     user.speed = 2
//   }

// });


//`hsl(${Math.random() * 360}, 100%, 50%)`

let players = []; // Array for AI enemies only.


function generateEnemies(){
  players = []
  // Create AI enemies
  for (let i = 1; i <= 9; i++) {
    let pos = { x: Math.random() * canvas.width, y: Math.random() * canvas.height}
  players.push({
    id: `enemy_${i}`,
    x: pos.x,
    y: pos.y,
    size: 5,
    trail: [{x: pos.x, y: pos.y},{x: pos.x, y: pos.y},{x: pos.x, y: pos.y},{x: pos.x, y: pos.y},{x: pos.x, y: pos.y}],
    score: 5,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
  });
  }
}

generateEnemies()


let carnadas = []; // Array to store bait
function generateCarnada() {
  if(paused) return

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 5,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 3,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 5,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 3,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 3,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 3,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 3,
    color: 'red'
  });

  carnadas.push({
    x: (Math.random() * 2000) - 500,
    y: (Math.random() * 2000) - 500,
    size: 3,
    color: 'red'
  });
}


let touchPad = { active: false, x: 0, y: 0, offsetX: 0, offsetY: 0 };
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  joystick.baseY = canvas.height - 150;
  joystick.knobY = canvas.height - 150;

  boost.x = canvas.width - 150;
  boost.y = canvas.height - 150;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Event listeners for controls
canvas.addEventListener('mousemove', (e) => {
  if (!touchPad.active) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }
});
canvas.addEventListener('mousedown', (e) => {
  if(isMobile()) return

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (isInsideCircle(mouseX, mouseY,circle.x, circle.y, circle.radius)) {
    //pause()
  } else if(isInsideCube(mouseX, mouseY, buttonResume)) {
    //pause()
  } else if(isInsideCube(mouseX, mouseY, buttonReset)) {
    //reset
    //paused = false
    //startGame()
  } else {
    boost.active = true
  }

});

canvas.addEventListener('mouseup', () => {
  boost.active = false;
});

function isMobile() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /mobile|android|iphone|ipod|ipad/.test(userAgent);
}

function moveUser() {
  const speed = boost.active ? user.boostedSpeed : user.speed;

  if (isMobile()) {
    // user.x += touchPad.offsetX * 0.1;
    // user.y += touchPad.offsetY * 0.1;
    // snake.direction.x = ;
    // snake.direction.y = (joystick.knobY - joystick.baseY) / 2;

    const angle = Math.atan2((joystick.knobY - joystick.baseY) / 2, (joystick.knobX - joystick.baseX) / 2);
    user.x += Math.cos(angle) * speed;
    user.y += Math.sin(angle) * speed;

    // const angle = Math.atan2(touchPad.y - canvas.height / 2, touchPad.x - canvas.width / 2);
    // user.x += Math.cos(angle) * speed;
    // user.y += Math.sin(angle) * speed;
  } else {
    const angle = Math.atan2(mouse.y - canvas.height / 2, mouse.x - canvas.width / 2);
    user.x += Math.cos(angle) * speed;
    user.y += Math.sin(angle) * speed;
  }

  user.trail.push({ x: user.x, y: user.y });
  if (user.trail.length > user.size) user.trail.shift();

  checkCollisionWithCarnadas(user);
}

function moveEnemies() {
  players.forEach((enemy) => {
    const targetCarnada = carnadas.reduce((closest, carnada) => {
      const distToCarnada = Math.hypot(enemy.x - carnada.x, enemy.y - carnada.y);
      const distToClosest = Math.hypot(enemy.x - closest.x, enemy.y - closest.y);
      return distToCarnada < distToClosest ? carnada : closest;
    }, { x: Infinity, y: Infinity });

    const randomFactor = Math.random() * 0.5 - 0.25;
    const angle = Math.atan2(targetCarnada.y - enemy.y, targetCarnada.x - enemy.x) + randomFactor;
    enemy.x += Math.cos(angle) * 2;
    enemy.y += Math.sin(angle) * 2;

    enemy.trail.push({ x: enemy.x, y: enemy.y });
    if (enemy.trail.length > enemy.size) enemy.trail.shift();

    checkCollisionWithCarnadas(enemy);
    checkCollisionsWithPlayers(enemy);
  });
}

function checkCollisionWithCarnadas(player) {
  carnadas = carnadas.filter((carnada) => {
    const dist = Math.hypot(player.x - carnada.x, player.y - carnada.y);
    if (dist < 7) {
      player.size += 1;

      if(carnada.hasOwnProperty('point'))
        player.score += carnada.point
      else
        player.score += 1;
      return false;
    }
    return true;
  });
}

const collisionDistance = 5
function checkCollisionsWithPlayers(player) {
    
    // Recorremos todas las serpientes (jugadores enemigos)
    players.forEach((otherPlayer) => {
      if (player !== otherPlayer) {
        // Obtener la cabeza de cada jugador (primer punto del rastro)
        const headPlayer = player.trail[0];
        const headOtherPlayer = otherPlayer.trail[0];

  
        // Verificar colisión entre las cabezas de los jugadores (ambos mueren si chocan)
        const distHeadToHead = Math.hypot(headPlayer.x - headOtherPlayer.x, headPlayer.y - headOtherPlayer.y);
  
        if (distHeadToHead < collisionDistance) {
          // Ambos jugadores mueren si las cabezas chocan
          //resetPlayer(player);
          resetPlayer(otherPlayer);
          resetPlayer(player);
        }
  
        // Verificar colisión entre la cabeza de un jugador y el cuerpo de otro (parte del rastro)
        for (let i = 1; i < otherPlayer.trail.length; i++) {  // Comienza desde 1 para evitar colisionar con la cabeza
          const bodyPart = otherPlayer.trail[i];
          const distHeadToBody = Math.hypot(headPlayer.x - bodyPart.x, headPlayer.y - bodyPart.y);
          
          if (distHeadToBody < collisionDistance) {
            // El jugador muere si la cabeza choca con cualquier parte del cuerpo de otro jugador
            resetPlayer(player);
          }
        }
      }
    });
  
    // Detectar colisión entre la cabeza del jugador y el cuerpo de las serpientes
    const headUser = user.trail[user.trail.length -1];  // La cabeza del jugador
    players.forEach((enemy) => {
      const headEnemy = enemy.trail[enemy.trail.length - 1];  // La cabeza de cada serpiente enemiga
  
      // Comprobamos si la cabeza del jugador colisiona con la cabeza de una serpiente
      const distToEnemyHead = Math.hypot(headUser.x - headEnemy.x, headUser.y - headEnemy.y);
      //const collisionDistance = (user.size + enemy.size) / 2; // Definir la distancia de colisión entre el jugador y una serpiente
      //const collisionDistance = 10  

      if (distToEnemyHead < collisionDistance) {
        // Si el jugador colisiona con la cabeza de una serpiente, ambos mueren
        resetPlayer(user);
        resetPlayer(enemy);
        //drawCollision(enemy);
      }
  
      // Comprobar colisión entre la cabeza del jugador y el cuerpo de la serpiente
      for (let i = 1; i < enemy.trail.length; i++) {
        const bodyPart = enemy.trail[i];
        const distHeadToBody = Math.hypot(headUser.x - bodyPart.x, headUser.y - bodyPart.y);
  
        if (distHeadToBody < collisionDistance) {
          // El jugador muere si la cabeza colisiona con el cuerpo de una serpiente
          resetPlayer(user);
        }
      }
    });

    players.forEach((enemy) => {
      const headEnemy = enemy.trail[enemy.trail.length -1];  // La cabeza de cada serpiente enemiga

      // Comprobar colisión entre la cabeza del jugador y el cuerpo de la serpiente
      for (let i = 1; i < user.trail.length; i++) {
        const bodyPart = user.trail[i];
        const distHeadToBody = Math.hypot(headEnemy.x - bodyPart.x, headEnemy.y - bodyPart.y);
  
        if (distHeadToBody < collisionDistance) {
          // El jugador muere si la cabeza colisiona con el cuerpo de una serpiente
          resetPlayer(enemy);
          //drawCollision(enemy);

        }
      }
    });
}

  // Función para reiniciar cualquier jugador o serpiente
  function resetPlayer(player) {

    //print body
    let print = 1
    for(let i=0;i<player.trail.length;i++){
      let x = player.trail[i].x
      let y = player.trail[i].y
      let color = player.color
      print++
      if(print==3) {
        carnadas.push({
          x: x,
          y: y,
          size: 3,
          point: 3,
          color: color
        });
        print = 0
      }

    }


    player.size = 5;
    let pos = { x: Math.random() * 2000 - 400, y: Math.random() * 2000 - 400}
    player.trail = [{x: pos.x, y: pos.y},{x: pos.x, y: pos.y},{x: pos.x, y: pos.y},{x: pos.x, y: pos.y},{x: pos.x, y: pos.y}];
    player.score = 0;
    player.x = pos.x;
    player.y = pos.y;


    if(player.id == 'user') {
        player.trail = [{x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
        {x: canvas.width / 2, y: canvas.height / 2}]
    }

    player.score = player.trail.length - 5

}

function drawPlayer(player) {
  ctx.fillStyle = player.color;
  player.trail.forEach((point, index) => {
    const size = 5;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fill();

  });
  ctx.fillStyle = 'black';
  ctx.fillText(''+player.id, player.trail[player.trail.length-1].x, player.trail[player.trail.length-1].y );

}

function drawCarnadas() {
  carnadas.forEach((carnada) => {
    ctx.fillStyle = carnada.color;
    ctx.beginPath();
    ctx.arc(carnada.x, carnada.y, carnada.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLeaderboard() {
  const allPlayers = [user, ...players];
  allPlayers.sort((a, b) => b.score - a.score);
  const leaderboardHeight = 50 + allPlayers.length * 20;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(canvas.width - 200, 30, 190, leaderboardHeight);

  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Leaderboard', canvas.width - 190, 30);


  allPlayers.forEach((player, index) => {
    ctx.fillText(
      `${index + 1}. ${player.id} - ${player.score}`,
      canvas.width - 190,
      50 + index * 20
    );
  });

  ctx.fillStyle = 'black';
  ctx.fillText('x:'+parseInt(user.trail[0].x)+ ', y:'+(parseInt(user.trail[0].y)), canvas.width - 130, 20);
}

function centerUser() {
  ctx.translate(canvas.width / 2 - user.x, canvas.height / 2 - user.y);
}

setInterval(generateCarnada, 2000);


function startGame(){
  carnadas = []

  for (let i = 0; i < 70; i++) generateCarnada();

  user.trail = [{x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2},{x: canvas.width / 2, y: canvas.height / 2}, {x: canvas.width / 2, y: canvas.height / 2},
    {x: canvas.width / 2, y: canvas.height / 2}]
  user.score = user.trail.length - 5

  generateEnemies()
  gameLoop()
}

function gameLoop() {
  if(paused) return

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  centerUser();

  // delimitar mapa
  //linea vertical izquierda
  ctx.beginPath();            // Inicia un nuevo trazo
  ctx.moveTo(-500, -500);         // Mueve el lápiz al punto inicial 
  ctx.lineTo(-500, 1500);       // Traza una línea hasta el punto final
  ctx.strokeStyle = 'black';    // Define el color de la línea
  ctx.lineWidth = 2;          // Define el grosor de la línea
  ctx.stroke();               // Dibuja la línea en el canvas

   //linea horizontal inferior
  ctx.beginPath();            // Inicia un nuevo trazo
  ctx.moveTo(-500, 1500);         // Mueve el lápiz al punto inicial 
  ctx.lineTo(1500, 1500);       // Traza una línea hasta el punto final 
  ctx.stroke();               // Dibuja la línea en el canvas


  //linea horizontal superior
  ctx.beginPath();            // Inicia un nuevo trazo
  ctx.moveTo(-500, -500);         // Mueve el lápiz al punto inicial 
  ctx.lineTo(1500, -500);       // Traza una línea hasta el punto final 
  ctx.stroke();               // Dibuja la línea en el canvas

  //linea vertical derecha
  ctx.beginPath();            // Inicia un nuevo trazo
  ctx.moveTo(1500, -500);         // Mueve el lápiz al punto inicial 
  ctx.lineTo(1500, 1500);       // Traza una línea hasta el punto final 
  ctx.stroke();               // Dibuja la línea en el canvas



  moveUser();
  moveEnemies();

  drawCarnadas();
  players.forEach(drawPlayer);
  drawPlayer(user);
  ctx.restore();

  drawLeaderboard();
  // Dibujamos el círculo
  drawCircle();
  if(isMobile()) {
    updateJoystick();
    drawJoystick();
  }

  requestAnimationFrame(gameLoop);
}

startGame()



let isPaused = localStorage.getItem('pause')
if(isPaused != null && isPaused == 'true'){
  paused = true
  menu()
}