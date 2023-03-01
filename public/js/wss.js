import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js"

let socketIO = null;

export const registerSocketEvents = (socket) => { //after socket connection is passed; register socket listeners
    socketIO = socket;
    socket.on("connect", () => {
        
        console.log("Successfully connected to WSS server");
        //socket.io uses protocols for transferring data between client-server; an implementation for WebSockets
        console.log(socket.id);
        store.setSocketId(socket.id); //saves the socket.id
        ui.updatePersonalCode(socket.id); //sends socket id to ui to update the personal code field
    });

    socket.on("pre-offer", (data) => { //callee side, if pre-offer was emitted
        webRTCHandler.handlePreOffer(data);
    })
};

export const sendPreOffer = (data) => {
    socketIO.emit("pre-offer", data); //After successful connection, emit to the server that we're passing the data

}