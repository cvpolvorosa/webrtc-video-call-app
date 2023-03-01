//npm install --save express
//npm install --save socket.io
//npm install nodemon

const { Socket } = require("dgram");
const express = require("express"); //will act as the signaling server
const http = require("http"); //

const PORT = process.env.PORT || 3000; //process.env.PORT when hosting the app, otherwise will use port 3000 for local

const app = express(); //app will be the express app
const server = http.createServer(app); //passing the express app to create a server
const io = require("socket.io")(server); //adds socket io to our server


app.use(express.static("public")); //lets the public folder and its files accessible from outside of the server

//when site is access, will send the index.html file
app.get('/', (req,res) => {
    res.sendFile(__dirname + "/public/index.html")//dirname is the main path the proj is stored
})

let connectedPears = [];

io.on("connection", (socket) => {//if the connection will occur, we'll get the socket and execute the func
    console.log("User connceted to Socket.io server");
    console.log(socket.id);
    connectedPears.push(socket.id); //pushes the connected IDs to an array
    console.log(connectedPears);
    socket.on('disconnect', () => { //listens if the client disconnects (Close browser/tab, lose internet conn, refreshes)
        console.log("User Disconnected");

        //Once disconnected, filter peerSocketId (method will only return elements that returns true)
        const newConnectedPeers = connectedPears.filter((peerSocketId) => {
            return peerSocketId !== socket.io;
        });
        //Updates the connected pears with new filtered elements
        connectedPears = newConnectedPeers;
    });
});
server.listen(PORT, ()=> { //Starts the server
    console.log(`Listening on PORT: ${PORT}`)
})
