let state = {
    socketId: null,
    localStream: null, //reference to stream (camera, audio)
    remoteStream: null, //reference to other user's stream
    screenSharingStream: null, //for screen sharing feature
    allowConnectionsFromStrangers: false, //omegle feature
    screenSharingActive: false
};

//below are setters for each state
export const setSocketId = (socketId) => {
    state = {
        ...state, //spread operator to take all of the prev. values (not initial)
        socketId //is equal to "socketId: socketId". This is to set the socketId with the passed params
    };
};

export const setLocalStream = (stream) => {
    state = {
        ...state,
        localStream: stream
    };
};

export const setAllowConncetionsFromStrangers = (allowConnection) => {
    state = {
        ...state,
        allowConnectionsFromStrangers: allowConnection
    };
};

export const setScreenSharingActive = (screenSharingActive) => {
    state={
        ...state,
        screenSharingActive //same with "screenSharingActive: screenSharingActive"
    };
};

export const setScreenSharingStream = (stream) => {
    state = {
        ...state,
        screenSharingStream: stream
    };
};

export const setRemoteStream = (stream) => {
    state = {
        ...state,
        remoteStream: stream
    };
};

//getter
export const getState = () => {
    return state;
}; 