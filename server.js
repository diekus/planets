const io = require('socket.io')(3000); //npm run devStart

io.on('connection', socket => {
    let protostar = createStar(socket.id);
    stars.push(protostar);
    console.log(`star ${socket.id} connected. # Stars: ${stars.length}`);
    socket.emit('star-connected', stars); //sends existing stars INCLUDING self to paint

    socket.broadcast.emit('new-star-joined', protostar); //lets others know theres a new star to create

    socket.on('disconnect', () => {
        socket.broadcast.emit('star-disconnected', socket.id);
        deleteStar(socket.id);
        console.log(`star ${socket.id} disconnected. # Stars: ${stars.length}`);
    });

});

/* SPACE SETUP */
let xConfines = 20;
let yConfines = 20;
let zConfines = 20;
let initialMaxRadius = .7;
let stars = []; //contains all stars in the scene

let createStar = id => {
    let newStarData = {
        id: id,
        r: Math.random() * initialMaxRadius,
        x: Math.random() * xConfines,
        y: Math.random() * yConfines,
        z: Math.random() * zConfines}
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