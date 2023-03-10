import * as store from "./store.js" //imports all exported functions from store.js
import * as wss from "./wss.js"
import * as webRTCHandler from "./webRTCHandler.js"
import * as constants from "./constants.js"
import * as ui from "./ui.js"
import * as recordingUtls from "./recordingUtils.js"
//initialization of socket io connection
const socket = io("/"); //Defines the connection. Alt: io("localhost:3000"); / is used incase we'll deploy it
wss.registerSocketEvents(socket); //passing the connection to register socket events

//executes func for getting local preview
webRTCHandler.getLocalPreview();

//register event listener for personal code copy button
const personalCodeCopyButton = document.getElementById("personal_code_copy_button");
personalCodeCopyButton.addEventListener("click", () => { //event listener for when copy button is clicked
    const personalCode = store.getState().socketId; //gets id directly from store
    navigator.clipboard && navigator.clipboard.writeText(personalCode); //copies to clipboard
})

//register event listener for connection buttons
const personalCodeChatButton = document.getElementById("personal_code_chat_button");
personalCodeChatButton.addEventListener("click", () => {
    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.CHAT_PERSONAL_CODE;
    webRTCHandler.sendPreOffer(callType, calleePersonalCode);
})

const personalCodeVideoButton = document.getElementById("personal_code_video_button");
personalCodeVideoButton.addEventListener("click", () => {
    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE;
    webRTCHandler.sendPreOffer(callType, calleePersonalCode);
})


//event listeneres for video call buttons

const micButton = document.getElementById("mic_button");
micButton.addEventListener("click", () => {
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled; //get audio track
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled);
})

const cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", () => {
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled; //get video track
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);
})

const switchForScreenSharingButton = document.getElementById("screen_sharing_button");
switchForScreenSharingButton.addEventListener("click", () => {
    const screenSharingActive = store.getState().screenSharingActive;
    webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

//messenger feature

const newMessageInput = document.getElementById("new_message_input");
newMessageInput.addEventListener("keydown", (event) => {
    console.log("change occured");
    const key = event.key;

    if (key === "Enter") {
        webRTCHandler.sendMessageUsingDataChannel(event.target.value);
        ui.appendMessage(event.target.value, true); //true, because if we are sending the message put it on the right hand side
        newMessageInput.value = ""; //empties string after sending
    }
})

const sendMessageButton = document.getElementById("send_message_button");
sendMessageButton.addEventListener("click", () => {
    const message = newMessageInput.value;
    webRTCHandler.sendMessageUsingDataChannel(message);
    ui.appendMessage(message, true)
    newMessageInput.value = ""; //empties string after sending
})

//for recording

const startRecordingButton = document.getElementById("start_recording_button");
startRecordingButton.addEventListener("click", () => {
    recordingUtls.startRecording();
    ui.showRecordingPanel();
});

const stopRecordingButton = document.getElementById("stop_recording_button");
stopRecordingButton.addEventListener("click", () => {
    recordingUtls.stopRecording();
    ui.resetRecordingButtons();
});

const pauseRecordingButton = document.getElementById("pause_recording_button");
pauseRecordingButton.addEventListener("click", () => {
    recordingUtls.pauseRecording();
    ui.switchRecordingButtons(true);
});

const resumeRecordingButton = document.getElementById("resume_recording_button");
resumeRecordingButton.addEventListener("click", () => {
    recordingUtls.resumeRecording();
    ui.switchRecordingButtons();
});


//hang up

const hangUpButton = document.getElementById("hang_up_button");
hangUpButton.addEventListener("click", () => {
    webRTCHandler.handleHangup();
});


const hangUpChatButton = document.getElementById("hang_up_button");
hangUpChatButton.addEventListener("click", () => {
    webRTCHandler.handleHangup();
});
