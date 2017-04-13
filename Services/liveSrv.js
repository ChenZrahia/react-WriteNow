import { Actions } from 'react-native-router-flux';
import './UserAgent';
//import io from 'socket.io-client/socket.io';
import io from 'socket.io-client/dist/socket.io';
var Event = require('./Events');
var moment = require('moment');

//אימות

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
        if(_isInCall == true){
            return;
        }
        _isInCall = true;
        //socket.disconnect();
        socket = io.connect('https://server-sagi-uziel.c9users.io:8081', { transports: ['websocket'], query: { uid: serverSrv._uid, convId: _convId } }); 
        if (hungUpCallback) {
            socket.on('hungUp', hungUpCallback);
        }
        socket.on('exchange', (data) => {
            exchange(data);
        });
        socket.on('leave', (socketId) => {
            leave(socketId);
        });

        socket.on('connect', (data) => {
            if (convId && !IsIncomingCall) {
                var callType = 'voice';
                if (isVideo == true) {
                    callType = 'video';
                } else if (isPTT == true){
                    callType = 'ptt';
                }
                socket.emit('makeCall', () => { console.log('make a call'); }, convId, callType);
            }
            
            Event.trigger('NewLiveChat');

            getLocalStream(isVideo, true, (stream) => {
                localStream = stream;
                Event.trigger('container_setState', { selfViewSrc: stream.toURL() });
                Event.trigger('container_setState', { status: 'ready', info: 'Please enter or create room ID' });
            });
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
    if (!isVideo) {
        isVideo = false;
    }
    MediaStreamTrack.getSources(sourceInfos => {
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
    });
}

export function join(roomID) {
    socket.emit('join', roomID, function (socketIds) {
        for (const i in socketIds) {
            const socketId = socketIds[i];
            _pc = createPC(socketId, true);
        }
    });
}

function createPC(socketId, isOffer) {
    const pc = new RTCPeerConnection(configuration);
    pcPeers[socketId] = pc;

    pc.onicecandidate = function (event) {
        if (event.candidate) {
            socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
        }
    };

    function createOffer() {
        pc.createOffer(function (desc) {
            pc.setLocalDescription(desc, function () {
                socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription });
            }, logError);
        }, logError);
    }

    pc.onnegotiationneeded = function () {
        if (isOffer) {
            createOffer();
        }
    }

    pc.oniceconnectionstatechange = function (event) {
        if (event.target.iceConnectionState === 'completed') {
            setTimeout(() => {
                getStats();
            }, 1000);
        }
        if (event.target.iceConnectionState === 'connected') {
            createDataChannel();
        }
    };
    pc.onsignalingstatechange = function (event) {
    };

    pc.onaddstream = function (event) {
        Event.trigger('container_setState', { info: 'One peer join!', statusPtt: 'green' });
        Event.trigger('add_remoteList', socketId, event);
    };
    pc.onremovestream = function (event) {
    };

    pc.addStream(localStream);
    function createDataChannel() {
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
    }
    return pc;
}

function exchange(data) {
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
            if (pc.remoteDescription.type == "offer")
                pc.createAnswer(function (desc) {
                    pc.setLocalDescription(desc, function () {
                        socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
                    }, logError);
                }, logError);
        }, logError);
    } else {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

function leave(socketId) {
    const pc = pcPeers[socketId];
    const viewIndex = pc.viewIndex;
    pc.close();
    delete pcPeers[socketId];

    Event.trigger('delete_remoteList', socketId);
    Event.trigger('container_setState', { info: 'One peer leave!', statusPtt: 'red' });
    if (!pcPeers.length) {
        Event.trigger('hungUp');
    }
    if(socket){
        socket.close();
        socket.disconnect();
    }
    if (_pc != null) {
        _pc.close();
    }
    _isInCall = false;
}

function logError(error) {
    console.log("logError", error);
}

export function mapHash(hash, func) {
    const array = [];
    for (const key in hash) {
        const obj = hash[key];
        array.push(func(obj, key));
    }
    return array;
}

function getStats() {
    const pc = pcPeers[Object.keys(pcPeers)[0]];
    if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
        const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
        pc.getStats(track, function (report) {
        }, logError);
    }
}
