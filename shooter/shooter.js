import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let scene, camera, renderer, controls;
let bullets = 5, ammo = 30, score = 0;
let targets = [];
const bulletSpeed = 50;
const objects = [];
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let joystick, joystickInner, joystickCenter;
let joystickDirection = new THREE.Vector2(0, 0); // Dirección del joystick
let isTouching = false; // Para saber si estamos tocando el joystick


init();
animate();

document.addEventListener('click', shoot);
document.addEventListener('keydown', reload);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

toStart();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Azul claro
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);
    document.addEventListener('click', () => controls.lock());
    
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    
    // Plataforma
    let platformGeometry = new THREE.PlaneGeometry(100,100);
    let platformMaterial = new THREE.MeshBasicMaterial({ color: 0x005500, side: THREE.DoubleSide });
    let platform = new THREE.Mesh(platformGeometry, platformMaterial);
    //platform.rotation.x = Math.PI / 2; // Aseguramos que la plataforma esté horizontal

    platform.rotation.x = Math.PI / 2;
    platform.position.set(10, -1, 10); // Posición de la plataforma
    scene.add(platform);
    
    for (let i = 0; i < 5; i++) createTarget();
    
    let crosshair = document.createElement('div');
    crosshair.style.position = 'absolute';
    crosshair.style.width = '10px';
    crosshair.style.height = '10px';
    crosshair.style.background = 'red';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(crosshair);

        // Crear joystick
        createJoystick();

            // Agregar eventos para el joystick
    window.addEventListener('mousemove', onJoystickMove);
    window.addEventListener('touchmove', onJoystickMove);
    window.addEventListener('touchstart', onJoystickTouchStart);
    window.addEventListener('touchend', onJoystickTouchEnd);

}

function createJoystick() {
    // Crear el fondo del joystick
    joystick = document.createElement('div');
    joystick.style.position = 'absolute';
    joystick.style.left = '10%';
    joystick.style.bottom = '10%';
    joystick.style.width = '150px';
    joystick.style.height = '150px';
    joystick.style.borderRadius = '50%';
    joystick.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    joystick.style.touchAction = 'none';
    document.body.appendChild(joystick);

    // Crear la palanca del joystick
    joystickInner = document.createElement('div');
    joystickInner.style.position = 'absolute';
    joystickInner.style.width = '50px';
    joystickInner.style.height = '50px';
    joystickInner.style.borderRadius = '50%';
    joystickInner.style.backgroundColor = 'blue';
    joystickInner.style.left = '50%';
    joystickInner.style.top = '50%';
    joystickInner.style.transform = 'translate(-50%, -50%)';
    joystick.appendChild(joystickInner);

    joystickCenter = { x: joystick.offsetWidth / 2, y: joystick.offsetHeight / 2 }; // Centro del joystick
}

function onJoystickMove(event) {
    if (isTouching) {
        // Prevenir el comportamiento por defecto en dispositivos táctiles
        event.preventDefault();
        
        let touchX, touchY;
        
        // Si es un mouse
        if (event.type === 'mousemove') {
            touchX = event.clientX;
            touchY = event.clientY;
        }
        
        // Si es un toque
        if (event.type === 'touchmove') {
            touchX = event.touches[0].clientX;
            touchY = event.touches[0].clientY;
        }

        // Obtener la dirección del movimiento en relación al centro del joystick
        let dx = touchX - (joystick.offsetLeft + joystickCenter.x);
        let dy = touchY - (joystick.offsetTop + joystickCenter.y);
        
        // Limitar el movimiento de la palanca dentro del área del fondo
        let distance = Math.min(Math.sqrt(dx * dx + dy * dy), joystick.offsetWidth / 2);
        let angle = Math.atan2(dy, dx);
        
        let joystickX = distance * Math.cos(angle);
        let joystickY = distance * Math.sin(angle);
        
        joystickInner.style.left = `50% + ${joystickX}px`;
        joystickInner.style.top = `50% + ${joystickY}px`;
        
        // Actualizar dirección del joystick
        joystickDirection.set(joystickX / (joystick.offsetWidth / 2), joystickY / (joystick.offsetHeight / 2));
    }
}

function onJoystickTouchStart() {
    isTouching = true;
}

function onJoystickTouchEnd() {
    isTouching = false;
    joystickDirection.set(0, 0); // Detener el movimiento
    joystickInner.style.left = '50%';
    joystickInner.style.top = '50%';
}



function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    renderer.render(scene, camera);
}

function createTarget() {
    let geometry = new THREE.SphereGeometry(1, 22, 22);
    let material = new THREE.MeshBasicMaterial({ color: 0xffa500 }); // Naranja
    let target = new THREE.Mesh(geometry, material);
    target.position.set(Math.random() * 50 - 5, parseInt(Math.random() * 10), Math.random() * -60);
    scene.add(target);
    targets.push(target);
}

function createExplosionEffect(position) {
    // Crear la geometría de las partículas (un pequeño círculo)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    
    // Creamos una lista de posiciones y velocidades para las partículas
    const positions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3); // Velocidades para cada partícula
    
    for (let i = 0; i < particlesCount; i++) {
        // Posiciones iniciales
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        
        // Velocidades aleatorias (dispersión hacia afuera)
        velocities[i * 3] = (Math.random() - 0.5); // Velocidad en X
        velocities[i * 3 + 1] = (Math.random() - 0.5); // Velocidad en Y
        velocities[i * 3 + 2] = (Math.random() - 0.5); // Velocidad en Z
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Material de las partículas (color y opacidad)
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xff4500, // Naranja
        size: 0.3,
        //map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/ball.png'),
        blending: THREE.AdditiveBlending,
        transparent: true,
    });
    
    // Crear el sistema de partículas
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    
    // Añadir las partículas a la escena
    scene.add(particles);
    
    // Función para actualizar las partículas
    function animateParticles() {
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < particlesCount; i++) {
            const index = i * 3;
            
            // Actualizar las posiciones de las partículas con su velocidad
            positions[index] += velocities[index];
            positions[index + 1] += velocities[index + 1];
            positions[index + 2] += velocities[index + 2];
        }
        
        // Informar a THREE.js que las posiciones han cambiado
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animar las partículas durante 1 segundo
    let time = 0;
    const interval = setInterval(() => {
        animateParticles();
        time++;
        
        // Eliminar las partículas después de 1 segundo
        if (time > 60) { // 60 frames (~1 segundo)
            scene.remove(particles);
            clearInterval(interval);
        }
    }, 16); // 16ms para 60 fps
}


function shoot() {
    if (bullets > 0) {
        bullets--;
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        let intersects = raycaster.intersectObjects(targets);
        
        if (intersects.length > 0) {
            // Efecto de impacto
            let impactGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            let impactMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            // let impact = new THREE.Mesh(impactGeometry, impactMaterial);
            // impact.position.copy(intersects[0].point);
            // scene.add(impact);

            // Crear el efecto de explosión en el punto de impacto
            createExplosionEffect(intersects[0].point);
            
            // Eliminar objetivo y crear nuevo
            scene.remove(intersects[0].object);
            targets.splice(targets.indexOf(intersects[0].object), 1);
            score++;
            updateHUD();
            createTarget();

            // Eliminar el impacto después de un segundo
            //setTimeout(() => scene.remove(impact), 1000);
        }
    }
}

function reload(event) {
    if (event.key === 'r' && ammo > 0) {
        let needed = 5 - bullets;
        let reloadAmount = Math.min(needed, ammo);
        bullets += reloadAmount;
        ammo -= reloadAmount;
        updateHUD();
    }
}

function updateHUD() {
    document.getElementById('hud').innerHTML = `Score: ${score} | Bullets: ${bullets} | Ammo: ${ammo}`;
}

function toStart() {
    let hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.position = 'absolute';
    hud.style.top = '10px';
    hud.style.right = '10px';
    hud.style.color = 'white';
    hud.style.fontSize = '20px';
    document.body.appendChild(hud);
    updateHUD();
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

function movePlayer() {
    direction.set(0, 0, 0); // Inicializamos el vector de dirección

    // Tomamos en cuenta la rotación de la cámara (solo el ángulo en Y)
    const angle = camera.rotation.y;

    // Movimiento con teclas (sin joystick)
    if (moveForward) direction.z -= 1;
    if (moveBackward) direction.z += 1;
    if (moveLeft) direction.x -= 1;
    if (moveRight) direction.x += 1;

    // Aplicamos la rotación del jugador basada en la rotación de la cámara
    // Usamos applyAxisAngle para rotar el vector de dirección sobre el eje Y de la cámara
    const rotatedDirection = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);


    // Normalizamos la dirección para que el movimiento no sea más rápido al ir en diagonal
    rotatedDirection.normalize();

    // Creamos la velocidad multiplicando por un valor para que el movimiento sea suave
    velocity.copy(rotatedDirection).multiplyScalar(0.1);

    // Actualizamos la posición del jugador usando el control de la cámara
    controls.getObject().position.add(velocity);
}