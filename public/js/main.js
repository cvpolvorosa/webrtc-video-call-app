import * as store from "./store.js" //imports all exported functions from store.js
import * as wss from "./wss.js"

const socket = io("/"); //Defines the connection. Alt: io("localhost:3000"); / is used incase we'll deploy it
wss.registerSocketEvents(socket); //passing the connection to register socket events
