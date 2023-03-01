import * as store from "./store.js" //imports all exported functions from store.js
import * as wss from "./wss.js"

//initialization of socket io connection
const socket = io("/"); //Defines the connection. Alt: io("localhost:3000"); / is used incase we'll deploy it
wss.registerSocketEvents(socket); //passing the connection to register socket events


//register event for personal code copy button
const personalCodeCopyButton = document.getElementById("personal_code_copy_button");
personalCodeCopyButton.addEventListener("click", () => { //event listener for when copy button is clicked
    const personalCode = store.getState().socketId; //gets id directly from store
    navigator.clipboard && navigator.clipboard.writeText(personalCode); //copies to clipboard
})