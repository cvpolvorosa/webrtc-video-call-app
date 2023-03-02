import * as wss from "./wss.js"
import * as constants from "./constants.js"
import * as ui from "./ui.js"
import * as store from "./store.js"

let connectedUserDetails;
let peerConnection; //defines local peer connection

//webRTC implementation part
const defaultConstraints = { //constraints for media permission
    audio: true,
    video: true,
}

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:13902" //free stun server offered and maintained by Google
        }
    ]
}

export const getLocalPreview = () => { //gets local video
    navigator.mediaDevices.getUserMedia(defaultConstraints)
        .then((stream) => { //used then, because this is a promise
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        }).catch((err) => { //logs error why there is no access to media
            console.log("An error occured when trying to get an access to the camera");
            console.log(err);
        })
}

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration); //new RTC connection between local and remote peer
    console.log("Getting ice candidates from Google STUN Server")
    //Gets info about our internet connection
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            //send our ice candidates to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate
            })
        }
    }

    peerConnection.onconnectionstatechange = (event) => {
        //This event will occur if the ICE candidates will successfully exchanged
        if (peerConnection.connectionState === "connected") {
            console.log("successfully connected to other peer");
        }

    }

    //when connection is established, this is for receiving tracks to stream the remote user
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    //tracks for audio and video
    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    }

    //add our stream to peer connection (if it is video call)
    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const localStream = store.getState().localStream;

        //adds the audio and video track to the peer connection
        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }

    }
}

/*----------------------------------------------*/
export const sendPreOffer = (callType, calleePersonalCode) => {
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode
    }

    if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const data = {
            callType,
            calleePersonalCode
        }
        ui.showCallingDialog(callingDialogRejectCallHandler);
        wss.sendPreOffer(data);
    }
};


export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    }

    if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
    }
}

//accept pre offer answer
const acceptCallHandler = () => {
    console.log("call accepted")
    createPeerConnection(); //webrtc create connection
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType); //callee side; show call elements

}

//reject pre offer answer
const rejectCallHandler = () => {
    console.log("call rejected")
    sendPreOfferAnswer();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}

const callingDialogRejectCallHandler = () => {
    console.log("rejecting")
}

//func for sending pre offer answer, either accept or reject
const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer,
    };
    ui.removeAllDialogs();
    console.log("connected socketid")
    console.log(connectedUserDetails.socketId)
    wss.sendPreOfferAnswer(data);
}

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;
    console.log("pre offer answer received yes")
    console.log(data);
    ui.removeAllDialogs();
    //if user is not found/exists
    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        ui.showInfoDialog(preOfferAnswer);
    }

    //if callee is in another call
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        ui.showInfoDialog(preOfferAnswer);
    }

    // rejected
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        ui.showInfoDialog(preOfferAnswer);
    }

    //accepted
    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        ui.showCallElements(connectedUserDetails.callType); //caller side; show call elements
        createPeerConnection(); //webrtc create connection
        //send webrtc offer and establish connection
        sendWebRTCOffer();
    }
};

//caller side; create peer connection offer if callee accepted
const sendWebRTCOffer = async () => {
    const offer = await peerConnection.createOffer(); //includes our sdp information
    await peerConnection.setLocalDescription(offer);
    //set our sdp and then send it to other user
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer: offer
    });
};

//callee
export const handleWebRTCOffer = async (data) => {
    //await remote desc coming from caller side
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer(); //creating an answer from our sdp information
    await peerConnection.setLocalDescription(answer); //saves it
    wss.sendDataUsingWebRTCSignaling({ //sends it
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer
    });
    console.log("webRTC offer came")
    console.log(data)
};

export const handleWebRTCAnswer = async (data) => {
    console.log("handling webrtc answer")
    await peerConnection.setRemoteDescription(data.answer);
}

export const handleWebRTCCandidate = async (data) => {
    try { //attempts to get a peerconnection and add ICE candidate to the connection
        await peerConnection.addIceCandidate(data.candidate);
    } catch (err) {
        console.error("Error occured when trying to add received ice candidate", err);
    }
}

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if (screenSharingActive) {

    } else {
        console.log("switching for screensharing")
        try {
            //for getting screensharing access
            const screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true //only passes video without audio
            });

            store.setScreenSharingStream(screenSharingStream);
            //replace the video track which sender is sending to the screen share display
            const senders = peerConnection.getSenders(); //getSenders specific peerconnection object, every sender is responsible for sending audio, video, display
            
            const sender = senders.find((sender) => {
                return (sender.track.kind === screenSharingStream.getVideoTracks()[0].kind);
            });
            //if sender is found, replace the tracker the sender is sending
            if (sender) {
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);

            //change our local preview to the screen share
            ui.updateLocalVideo(screenSharingStream);
        } catch (err) {
            console.error("Error occured when switching for screensharing", err)
        }
    }
}