import { Actions } from 'react-native-router-flux';
import './UserAgent';
import io from 'socket.io-client/dist/socket.io';
var Event = require('./Events');
var moment = require('moment');

export var socket = null;
export var _convId = null;
export var _isInCall = false; //האם המשתמש בשיחה ברגע זה

var _pc = null;
var ErrorHandler = require('../ErrorHandler');
var serverSrv = require('./serverSrv');
var SQLite = require('react-native-sqlite-storage')

import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
export const pcPeers = {};
export let localStream;
export let container;
export function makeCall(callback) {
    try {

    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => makeCall', error);
    }
}

export function Connect(convId, hungUpCallback, IsIncomingCall, isVideo, isPTT) {
    try {
        if (convId) {
            _convId = convId;
        }
        if (_isInCall == true) {
            return;
        }
        _isInCall = true;
        //socket.disconnect();
        socket = io.connect('https://server-sagi-uziel.c9users.io:8081', { transports: ['websocket'], query: { uid: serverSrv._uid, convId: _convId } });
        if (hungUpCallback) {
            socket.on('hungUp', hungUpCallback);
        }
        socket.on('exchange', (data) => {
            try {
                exchange(data);
            } catch (error) {
                ErrorHandler.WriteError('liveSrv.js => exchange', error);
            }
        });
        socket.on('leave', (socketId) => {
            try {
                leave(socketId);
            } catch (error) {
                ErrorHandler.WriteError('liveSrv.js => leave', error);
            }
        });

        socket.on('connect', (data) => {
            try {
                if (convId && !IsIncomingCall) {
                    var callType = 'voice';
                    if (isVideo == true) {
                        callType = 'video';
                    } else if (isPTT == true) {
                        callType = 'ptt';
                    }
                    socket.emit('makeCall', () => { console.log('make a call'); }, convId, callType);
                }
                Event.trigger('NewLiveChat');

                getLocalStream(isVideo, true, (stream) => {
                    try {
                        localStream = stream;
                        Event.trigger('container_setState', { selfViewSrc: stream.toURL() });
                        Event.trigger('container_setState', { status: 'ready', info: 'Please enter or create room ID' });
                    } catch (error) {
                        ErrorHandler.WriteError('liveSrv.js => getLocalStream', error);
                    }
                });
            } catch (error) {
                ErrorHandler.WriteError('liveSrv.js => connect', error);
            }
        });
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => Connect', error);
    }
}

export function hungUp() {
    try {
        if (socket) {
            socket.emit('hungUp');
            socket.close();
            socket.disconnect();
            if (_pc != null) {
                _pc.close();
            }
        }
        _isInCall = false;
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => hungUp', error);
    }
}

export function getLocalStream(isVideo, isFront, callback) {
    try {
        if (!isVideo) {
            isVideo = false;
        }
        MediaStreamTrack.getSources(sourceInfos => {
            try {
                let videoSourceId;
                for (const i = 0; i < sourceInfos.length; i++) {
                    const sourceInfo = sourceInfos[i];
                    if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                        videoSourceId = sourceInfo.id;
                    }
                }
                getUserMedia({
                    audio: true,
                    video: isVideo
                }, function (stream) {
                    callback(stream);
                }, logError);
            } catch (error) {
                ErrorHandler.WriteError('liveSrv.js => getSources', error);
            }
        });
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => getLocalStream(1)', error);
    }
}

export function join(roomID) {
    try {
        socket.emit('join', roomID, function (socketIds) {
            try {
                for (const i in socketIds) {
                    const socketId = socketIds[i];
                    _pc = createPC(socketId, true);
                }
            } catch (error) {
                ErrorHandler.WriteError('liveSrv.js => socket.emit => join', error);
            }
        });
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => join', error);
    }
}

function createPC(socketId, isOffer) {
    const pc = new RTCPeerConnection(configuration);
    pcPeers[socketId] = pc;

    pc.onicecandidate = function (event) {
        try {
            if (event.candidate) {
                socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
            }
        } catch (error) {
            ErrorHandler.WriteError('liveSrv.js => createPC => onicecandidate', error);
        }
    };

    function createOffer() {
        try {
            pc.createOffer(function (desc) {
                pc.setLocalDescription(desc, function () {
                    socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription });
                }, logError);
            }, logError);
        } catch (error) {
            ErrorHandler.WriteError('liveSrv.js => createPC => createOffer', error);
        }
    }

    pc.onnegotiationneeded = function () {
        try {
            if (isOffer) {
                createOffer();
            }
        } catch (error) {
            ErrorHandler.WriteError('liveSrv.js => createPC => pc.onnegotiationneeded', error);
        }
    }

    pc.oniceconnectionstatechange = function (event) {
        try {
            if (event.target.iceConnectionState === 'completed') {
                setTimeout(() => {
                    getStats();
                }, 1000);
            }
            if (event.target.iceConnectionState === 'connected') {
                createDataChannel();
            }
        } catch (error) {
            ErrorHandler.WriteError('liveSrv.js => createPC => oniceconnectionstatechange', error);
        }
    };
    pc.onsignalingstatechange = function (event) {
    };

    pc.onaddstream = function (event) {
        try {
            Event.trigger('container_setState', { info: 'One peer join!', statusPtt: 'green' });
            Event.trigger('add_remoteList', socketId, event);
        } catch (error) {
            ErrorHandler.WriteError('liveSrv.js => createPC => pc.onaddstream', error);
        }
    };
    pc.onremovestream = function (event) {
    };

    pc.addStream(localStream);
    function createDataChannel() {
        try {
            if (pc.textDataChannel) {
                return;
            }
            const dataChannel = pc.createDataChannel("text");

            dataChannel.onerror = function (error) {
                console.log("dataChannel.onerror", error);
            };

            dataChannel.onmessage = function (event) {
                Event.trigger('receiveTextData', { user: socketId, message: event.data });
            };

            dataChannel.onopen = function () {
                Event.trigger('container_setState', { textRoomConnected: true });
            };

            dataChannel.onclose = function () {
                console.log('OnClose!');
            };
            pc.textDataChannel = dataChannel;
        } catch (error) {
            ErrorHandler.WriteError('liveSrv.js => createDataChannel => catch', error);
        }
    }
    return pc;
}

function exchange(data) {
    try {
        const fromId = data.from;
        let pc;
        if (fromId in pcPeers) {
            pc = pcPeers[fromId];
        } else {
            pc = createPC(fromId, false);
        }
        _pc = pc;
        if (data.sdp) {
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
                    try {
                        if (pc.remoteDescription.type == "offer")
                            pc.createAnswer(function (desc) {
                                try {
                                    pc.setLocalDescription(desc, function () {
                                        try {
                                            socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
                                        } catch (error) {
                                            ErrorHandler.WriteError('liveSrv.js => pc.setRemoteDescription => pc.createAnswer => setLocalDescription', error);
                                        }
                                    }, logError);
                                } catch (error) {
                                    ErrorHandler.WriteError('liveSrv.js => pc.setRemoteDescription => pc.createAnswer', error);
                                }
                            }, logError);
                    } catch (error) {
                        ErrorHandler.WriteError('liveSrv.js => pc.setRemoteDescription', error);
                    }
                }, logError);
        } else {
            try {
                pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                ErrorHandler.WriteError('liveSrv.js => exchange => addIceCandidate', error);
            }
        }
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => exchange', error);
    }
}

function leave(socketId) {
    try {
        const pc = pcPeers[socketId];
        const viewIndex = pc.viewIndex;
        pc.close();
        delete pcPeers[socketId];

        Event.trigger('delete_remoteList', socketId);
        Event.trigger('container_setState', { info: 'One peer leave!', statusPtt: 'red' });
        if (!pcPeers.length) {
            Event.trigger('hungUp');
        }
        if (socket) {
            socket.close();
            socket.disconnect();
        }
        if (_pc != null) {
            _pc.close();
        }
        _isInCall = false;
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => leave', error);
    }
}

function logError(error) {
    ErrorHandler.WriteError("## logError", error);
}

export function mapHash(hash, func) {
    try {
        const array = [];
        for (const key in hash) {
            const obj = hash[key];
            array.push(func(obj, key));
        }
        return array;
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => mapHash', error);
    }
}

function getStats() {
    try {
        const pc = pcPeers[Object.keys(pcPeers)[0]];
        if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
            const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
            pc.getStats(track, function (report) {
            }, logError);
        }
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => getStats', error);
    }
}
