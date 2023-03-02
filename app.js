//npm install --save express
//npm install --save socket.io
//npm install nodemon


const express = require("express"); //will act as the signaling server
const http = require("http"); //

const PORT = process.env.PORT || 3000; //process.env.PORT when hosting the app, otherwise will use port 3000 for local

const app = express(); //app will be the express app
const server = http.createServer(app); //passing the express app to create a server
const io = require("socket.io")(server); //adds socket io to our server


app.use(express.static("public")); //lets the public folder and its files accessible from outside of the server

//when site is access, will send the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html")//dirname is the main path the proj is stored
})

let connectedPeers = [];

io.on("connection", (socket) => {//if the connection will occur, we'll get the socket and execute the func
    console.log("User connceted to Socket.io server");
    console.log(socket.id);
    connectedPeers.push(socket.id); //pushes the connected IDs to an array
    console.log(connectedPeers);

    socket.on("pre-offer", (data) => {
        /* data:
        pre-offer
        {
        callType: 'CHAT_PERSONAL_CODE',
        calleePersonalCode: 'HYWX2IJgYMALoaeeAAAD'
        }
        */
        const { calleePersonalCode, callType } = data;
        //checks connectedPeer array if the code is currently connected
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === calleePersonalCode
        );

        if (connectedPeer) {
            const data = {
                callerSocketId: socket.id,
                callType
            }
            io.to(calleePersonalCode).emit("pre-offer", data); //if connectedpeer is available emit data to them
        } else { //if callee not found, emit back to caller data
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND"
            }
            io.to(socket.id).emit("pre-offer-answer", data)
        }

    })

    socket.on("pre-offer-answer", (data) => {
        console.log("pre offer answer received acals")
        console.log(data);
        const { callerSocketId } = data

        //check if user is connected/exists
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === callerSocketId
        );
        console.log("socketidz")
        console.log(callerSocketId);
        if (connectedPeer) {
            io.to(data.callerSocketId).emit("pre-offer-answer", data);
        }
    });

    socket.on("webRTC-signaling", (data) => {
        const { connectedUserSocketId } = data;

        //check if user is connected/exists
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );
        //after checking if callee is connected, emit data to them for webrtc offer
        if (connectedPeer) {
            io.to(connectedUserSocketId).emit("webRTC-signaling", data);
        }
    });

    socket.on("user-hanged-up", (data) => {
        const { connectedUserSocketId } = data;

        //check if user is connected/exists
        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit("user-hanged-up", data);
        }
    });

    socket.on('disconnect', () => { //listens if the client disconnects (Close browser/tab, lose internet conn, refreshes)
        console.log("User Disconnected");

        //Once disconnected, filter peerSocketId (method will only return elements that returns true)
        const newConnectedPeers = connectedPeers.filter((peerSocketId) =>
            peerSocketId !== socket.id
        );
        //Updates the connected pears with new filtered elements
        connectedPeers = newConnectedPeers;
    });
});
server.listen(PORT, () => { //Starts the server
    console.log(`Listening on PORT: ${PORT}`)
})
