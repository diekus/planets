window.addEventListener('DOMContentLoaded', function(){});
/* SOCKET SETUP */
var socket = io('localhost:3000'); // socket.emit('chat message', 'msg');
socket.on('chat message', function(msg){
    console.log(msg);
});
/* BABYLON SETUP */
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

let createScene = function(){
    let scene = new BABYLON.Scene(engine);
    let  camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
    let ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
    return scene;
}

let scene = createScene();
engine.runRenderLoop(function() { //render loop
    scene.render();
});
window.addEventListener('resize', function() { //resize the window
    engine.resize();
});

/* PLANETS APP */
let createStar = function(r, x, y, z,) {

}