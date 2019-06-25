/* SOCKET SETUP */
const socket = io('http://localhost:3000');
let stars = [];
let selfStar = null;

socket.on('star-connected', data => {
    selfStar = data[data.length - 1];
    scene.activeCamera.position = new BABYLON.Vector3(selfStar.x, selfStar.y, selfStar.z);
    stars = data;
    stars.splice(stars.length -1, 1);
    console.log(`you (${selfStar.id}) are now connected`);
    console.log(stars);
    stars.forEach(element => {
        createStar(element.id, element.r, element. x, element.y, element.z);        
    });
});

socket.on('new-star-joined', newStar => {
    console.log(`star ${newStar.id} joined`);
    stars.push(newStar);
    createStar(newStar.id, newStar.r, newStar.x, newStar.y, newStar.z);
});

socket.on('star-disconnected', usrId => {
    deleteStar(usrId);
    console.log(`star ${usrId} disconnected`);
});

/* BABYLON SETUP */
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

let createScene = function(){
    let scene = new BABYLON.Scene(engine);
    let  camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, 0), scene);;
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);
    let light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
    //let ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
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
let createStar = function(id, r, x, y, z) {
    let sphere = BABYLON.MeshBuilder.CreateSphere(id, {segments: 8, diameter: r}, scene);
    sphere.position = new BABYLON.Vector3(x, y, z);
}

let deleteStar = id => {
    for(i = 0; i < stars.length; i++) {
        if(stars[i].id == id) {
            stars.splice(i, 1);
            break;
        }
    }
    for(i = 0; i < scene.meshes.length; i++) { //Deletes from BabylonJS scene (scene.meshes[])
        if(scene.meshes[i].id = id) {
            scene.meshes.splice(i, 1);
            break;
        }
    }
    
};