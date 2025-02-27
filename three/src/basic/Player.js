import * as THREE from 'three';

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let velocityY = 0; // Velocidad en el eje Y
const gravity = -0.01; // Gravedad (valor negativo para que baje)
const jumpStrength = 0.2; // Potencia del salto
let isJumping = false; // Evita saltos dobles
const floorHeight = 1; // Altura mínima del suelo


camera.position.y = 3;
camera.position.z = 20;
camera.position.x = -5;

// Variables para movimiento
const speed = 0.1;
const keys = { w: false, s: false, a: false, d: false, space: false, shift: false };

document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
    if (event.code === "Space" && !isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
    }
});
document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

// Bounding Box de la cámara
const playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

function update({boxBB, box}){
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // Evita moverse en el eje Y

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    let nextPosition = camera.position.clone();

    if (keys.w) nextPosition.addScaledVector(direction, speed);
    if (keys.s) nextPosition.addScaledVector(direction, -speed);
    if (keys.a) nextPosition.addScaledVector(right, speed);
    if (keys.d) nextPosition.addScaledVector(right, -speed);

    

    // Actualizar Bounding Box de la cámara
    playerBB.setFromCenterAndSize(nextPosition, new THREE.Vector3(1, 2, 1));

    let isCollision = false
    // Comprobar colisión con la caja
    if (playerBB.intersectsBox(boxBB)) {
        isCollision = true
        console.log(box)
        const boxTop = box.position.y + box.geometry.parameters.height; // La altura máxima de la caja (mitad de su tamaño)
        // Si el jugador está sobre la caja, lo deja subirse
        if (camera.position.y >= boxTop ) {
  
            camera.position.y = boxTop; // Se ajusta a la altura de la caja
            velocityY = 0; // Detiene la caída
            isJumping = false; // Permite saltar de nuevo desde la caja
        } else {
            // Bloquea el movimiento si choca con la caja lateralmente
            nextPosition.copy(camera.position);
        }
    }

    // Aplicar el movimiento final
    camera.position.copy(nextPosition);


    // Simulación de salto
    velocityY += gravity; // Aplicar gravedad
    camera.position.y += velocityY; // Aplicar velocidad vertical
    
    

    // Limitar la caída al suelo
    if (camera.position.y <= floorHeight) {
        camera.position.y = floorHeight;
        velocityY = 0;
        isJumping = false; // Permitir otro salto
    }


}

camera.update = update



export default camera