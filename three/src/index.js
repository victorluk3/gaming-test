import * as THREE from 'three';
import scene from './basic/Scene.js'
import camera from './basic/Player.js'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const loader = new GLTFLoader();


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.position.set(-1,2.1,10)
scene.add( cube );


camera.lookAt(cube.position)


//create a blue LineBasicMaterial
// const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );

// const points = [];
// points.push( new THREE.Vector3( -3, 0, 0 ) );
// points.push( new THREE.Vector3( 0, 3, 0 ) );
// points.push( new THREE.Vector3( 5, 0, 0 ) );

// const geometry2 = new THREE.BufferGeometry().setFromPoints( points );

// const line = new THREE.Line( geometry2, material2 );
// scene.add( line );

const light = new THREE.AmbientLight(0x5555ff, 0.05);

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
light.add( directionalLight );
scene.add(light);

const directionalLight2 = new THREE.AmbientLight( 0xffffff, 0.30 );
directionalLight2.position.z = 10
directionalLight2.position.x = -10
directionalLight2.position.y = 5
// directionalLight2.lookAt(cube);
scene.add(directionalLight2);


// Controles de primera persona
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());


loader.load( 'src/cube.glb', function ( gltf ) {

     gltf.scene.scale.set(10, 10, 10);
	scene.add( gltf.scene);

    console.log('house scene added', gltf.scene)

}, undefined, function ( error ) {

	console.error( error );

} );

let maxY = 20
let sunXdir = 0.05
let yDirectionUp = true

// Creación de un obstáculo (caja)
const box = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.7, 15),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
box.position.set(-2, 0, 5); // Altura = 1 (mitad de la caja)
scene.add(box);

// Bounding Box de la caja
const boxBB = new THREE.Box3().setFromObject(box);



function animate() {
    directionalLight2.position.x += sunXdir
    if(directionalLight2.position.y > maxY)
        yDirectionUp = false

    if(3 > directionalLight2.position.y )
        yDirectionUp = true

    if(yDirectionUp)
        directionalLight2.position.y += 0.1
    else
        directionalLight2.position.y -= 0.1

    if(directionalLight2.position.x > 20 || directionalLight2.position.x < -10)
        sunXdir = sunXdir * -1

    directionalLight2.lookAt(cube);


    cube.rotation.x += 0.01;

    if (controls.isLocked) {

        camera.update({boxBB, box})

    }
    // cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );

function moveX(val) {
    camera.position.x += val;
    camera.position.z -= val;
    camera.lookAt(cube.position)

}

window.moveX = moveX


