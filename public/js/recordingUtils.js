import * as store from "./store.js"
let mediaRecorder;

const vp9Codec = "video/webm; codecs=vp=9"; //define codecs to be used in recording; might not work on firefox; check other options if needed
const vp9Options = { mimeType: vp9Codec };
const recordedChunks = [];

export const startRecording = () => {
    const remoteStream = store.getState().remoteStream;

    //choose codec if supported
    if (MediaRecorder.isTypeSupported(vp9Codec)) {
        mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
    } else {
        mediaRecorder = new MediaRecorder(remoteStream);
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
}

export const pauseRecording = () => {
    mediaRecorder.pause();
}

export const resumeRecording = () => {
    mediaRecorder.resume();
}

export const stopRecording = () => {
    mediaRecorder.stop();
}

const downloadRecordedVideo = () => {
    const blob = new Blob(recordedChunks, {
        type: "video/webm"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style = "display:none;"
    a.href = url;
    a.download = "recording.webm";
    a.click();
    window.URL.revokeObjectURL(url);
}

const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
        downloadRecordedVideo();
    }
}