/*
*
*
SOCKET.IO SETUP
*
*
*/
const socket = io('https://wss-space.glitch.me:30000'); //io('http://localhost:3000');
let stars = [];
let selfStar = null;
let constellations = [];
let loadedShip = null;

socket.on('star-connected', data => {
    selfStar = data[data.length - 1];
    scene.activeCamera.position = new BABYLON.Vector3(selfStar.x, selfStar.y, selfStar.z);
    stars = data;
    //stars.splice(stars.length -1, 1);
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

socket.on('ud-const-info', consts => {
   constellations = consts;
});

socket.on('draw-consts', () => {
    for(c = 0; c < constellations.length; c++){
        drawConstellation(constellations[c]);
    }
});

/*
*
*
BABYLON SETUP
*
*
*/
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

scene.beforeRender = function () {
    if(loadedShip != null)
        loadedShip.rotation.y += .1;  
    //scene.activeCamera.position.x += .001;
}

/*
*
ASSET MANAGER - SHIP
*
*/
let addShip = () => {
    let assetManager = new BABYLON.AssetsManager(scene);
    let shipTask = assetManager.addMeshTask('ship-task', '', 'models/', 'saucer.glb');
    shipTask.onSuccess = (task) => {
        console.log('peyi');
        task.loadedMeshes[0].position = new BABYLON.Vector3(0, 0, 10);
    };
    shipTask.onError = (task, msg, exc) => {
        console.log(msg, exc);
    };
    assetManager.load();
    loadedShip = getMesh('__root__');
};

/*
*
*
PLANETS APP
*
*
*/
//sets the scene ambient color
scene.ambientColor = new BABYLON.Color3(1, 1, 1);
//material for the stars
let getStarMaterial = () => {
    let mat = new BABYLON.StandardMaterial("starMaterial", scene);  
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    mat.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    mat.ambientColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 1;
    return mat;
};

let createStar = function(id, r, x, y, z) {
    let sphere = BABYLON.MeshBuilder.CreateSphere(id, {segments: 4, diameter: r}, scene);
    sphere.position = new BABYLON.Vector3(x, y, z);
    sphere.material = getStarMaterial();
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
            delStar = scene.meshes.splice(i, 1);
            if(delStar.length > 0) { delStar[0].dispose(); }
            break;
        }
    }
};

// Skybox
let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:200.0}, scene);
var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
skyboxMaterial.backFaceCulling = false;
var files = [
    "imgs/bg/space_left.jpg",
    "imgs/bg/space_up.jpg",
    "imgs/bg/space_front.jpg",
    "imgs/bg/space_right.jpg",
    "imgs/bg/space_down.jpg",
    "imgs/bg/space_back.jpg",
];
skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromImages(files, scene);
skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.disableLighting = true;
skybox.material = skyboxMaterial;

// time the constellation will be visible
let constellationTime = 10000; //10s

//auxiliary method to help transform position date from stars into drawing points for the mesh builder
let createConstellationMeshData = (listStars) => {
    let constell = [];
    listStars.forEach((s)=>{
        constell.push(new BABYLON.Vector3(s.x, s.y, s.z));
    });
    return constell;
};

//draws a constellation based on a list of points 
let drawConstellation = (listStars) => {
    let constellPoints = createConstellationMeshData(listStars);
    let constName = `const-${Date.now()}`;
    let constellation = BABYLON.MeshBuilder.CreateLines(constName, {points: constellPoints}, scene);
    
    var promConstellation = new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, constellationTime);
    });

    promConstellation.then(function(value) {
        for (cm = 0; cm < scene.meshes.length; cm++) { //removes it from the meshes
            if (scene.meshes[cm].name == constName) {
                delConst = scene.meshes.splice(cm, 1);
                delConst.dispose();
                break;
            }
        }
    });
};

//registers star into a constellation
canvas.addEventListener('dblclick', (e) => {
    socket.emit('reg-star-in-const', selfStar.id);
});

//retrieves a reference to a star from the collection
let getStar = id => {
    for(s = 0; s < stars.length; s++) {
        if(stars[s].id = id){
            return stars[s];
        }
    }
};

let getMesh = (id) => {
    let mesh = null;
    for(m = 0; m < scene.meshes.length; m++) {
        if(scene.meshes[m].id == id) {
            mesh = scene.meshes[m];
            break; 
        }
    }
    return mesh;
};

addShip();