const io = require('socket.io')(3000); //npm run devStart

io.on('connection', socket => {
    let newStar = createStar(socket.id);
    stars.push(newStar);
    console.log(`star ${socket.id} connected. # Stars: ${stars.length}`);
    socket.emit('star-connected', stars); //sends existing stars INCLUDING self to paint

    socket.broadcast.emit('new-star-joined', newStar); //lets others know theres a new star to create

    socket.on('disconnect', () => {
        socket.broadcast.emit('star-disconnected', socket.id);
        deleteStar(socket.id);
        console.log(`star ${socket.id} disconnected. # Stars: ${stars.length}`);
    });

    socket.on('reg-star-in-const', (m) => { //adds a star to a constellation
        if(formingConstellation) {
            currentConstellation.push(getStar(m));
        }
    });

    let drawConstellations = () => {
        socket.broadcast.emit('draw-consts', ''); //tells clients to draw the constellations
    };
    
    let updateConstellationInfo = () => {
        socket.broadcast.emit('ud-const-info', constellations); //updates the constellation information in the client
        console.log('broadcasting constellations');
    };
});



/* SPACE SETUP */
let xConfines = 20;
let yConfines = 20;
let zConfines = 20;
let initialMaxRadius = .4;
let stars = []; //contains all stars in the scene
let constellations = [];
let currentConstellation = [];
let formingConstellation = false;

let createStar = id => {
    let newStarData = {
        id: id,
        r: Math.random() * initialMaxRadius,
        x: Math.random() * xConfines * numSign(),
        y: Math.random() * yConfines  * numSign(),
        z: Math.random() * zConfines * numSign()}
    return newStarData;
};

let deleteStar = id => {
    for(i = 0; i < stars.length; i++) {
        if(stars[i].id == id) {
            stars.splice(i, 1);
            break;
        } 
    }
};

let numSign = () => {
    s = Math.random() > 0.5? 1 : -1;
    return s;
};