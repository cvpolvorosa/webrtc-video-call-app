const socket = io("/"); //Defines the connection. Alt: io("localhost:3000"); / is used incase we'll deploy it


socket.on("connect", () => {
    console.log("Successfully connected to WSS server");
    //socket.io uses protocols for transferring data between client-server; an implementation for WebSockets
    console.log(socket.id);
});