import * as store from "./store.js";
import * as ui from "./ui.js";

export const registerSocketEvents = (socket) => { //after socket connection is passed; register socket listeners
    socket.on("connect", () => {
        console.log("Successfully connected to WSS server");
        //socket.io uses protocols for transferring data between client-server; an implementation for WebSockets
        console.log(socket.id);
        store.setSocketId(socket.id); //saves the socket.id
        ui.updatePersonalCode(socket.id); //sends socket id to ui to update the personal code field
    });
};
