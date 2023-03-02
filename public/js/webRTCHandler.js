import * as wss from "./wss.js"
import * as constants from "./constants.js"
import * as ui from "./ui.js"

let connectedUserDetails;

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
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
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
        //send webrtc offer and establish connection
    }

}