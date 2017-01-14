import { Actions } from 'react-native-router-flux';
import './UserAgent';
import io from 'socket.io-client/dist/socket.io';
var Event = require('./Events');
var moment = require('moment');

//אימות

export var socket = null;

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

export function Connect(convId, hungUpCallback) {
    try {
        //socket.disconnect();
        console.log(serverSrv._uid + " Try To Connect To The Server...");
        socket = io.connect('https://server-sagi-uziel.c9users.io:8081', { transports: ['websocket'], query: { uid: serverSrv._uid } });
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
            if(convId){
                socket.emit('makeCall', () => {console.log('make a call');}, convId);
            }
            console.log('connect');
            getLocalStream(true, (stream) => {
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
        socket.emit('hungUp');
        socket.disconnect();
    } catch (error) {
        ErrorHandler.WriteError('liveSrv.js => hungUp', error);
    }
}

export function getLocalStream(isFront, callback) {
    MediaStreamTrack.getSources(sourceInfos => {
        console.log(sourceInfos);
        let videoSourceId;
        for (const i = 0; i < sourceInfos.length; i++) {
            const sourceInfo = sourceInfos[i];
            if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                videoSourceId = sourceInfo.id;
            }
        }
        getUserMedia({
            audio: true,
            video: false
        }, function (stream) {
            console.log('dddd', stream);
            callback(stream);
        }, logError);
    });
}

export function join(roomID) {
    socket.emit('join', roomID, function (socketIds) {
        console.log('join', socketIds);
        for (const i in socketIds) {
            const socketId = socketIds[i];
            createPC(socketId, true);
        }
    });
}

function createPC(socketId, isOffer) {
    const pc = new RTCPeerConnection(configuration);
    pcPeers[socketId] = pc;

    pc.onicecandidate = function (event) {
        console.log('onicecandidate', event.candidate);
        if (event.candidate) {
            socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
        }
    };

    function createOffer() {
        pc.createOffer(function (desc) {
            console.log('createOffer', desc);
            pc.setLocalDescription(desc, function () {
                console.log('setLocalDescription', pc.localDescription);
                socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription });
            }, logError);
        }, logError);
    }

    pc.onnegotiationneeded = function () {
        console.log('onnegotiationneeded');
        if (isOffer) {
            createOffer();
        }
    }

    pc.oniceconnectionstatechange = function (event) {
        console.log('oniceconnectionstatechange', event.target.iceConnectionState);
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
        console.log('onsignalingstatechange', event.target.signalingState);
    };

    pc.onaddstream = function (event) {
        console.log('onaddstream', event.stream);
        Event.trigger('container_setState', { info: 'One peer join!' });
        Event.trigger('add_remoteList', socketId, event);
    };
    pc.onremovestream = function (event) {
        console.log('onremovestream', event.stream);
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
            console.log("dataChannel.onmessage:", event.data);
            Event.trigger('receiveTextData', { user: socketId, message: event.data });
        };

        dataChannel.onopen = function () {
            console.log('dataChannel.onopen');
            Event.trigger('container_setState', { textRoomConnected: true });
        };

        dataChannel.onclose = function () {
            console.log("dataChannel.onclose");
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

    if (data.sdp) {
        console.log('exchange sdp', data);
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            if (pc.remoteDescription.type == "offer")
                pc.createAnswer(function (desc) {
                    console.log('createAnswer', desc);
                    pc.setLocalDescription(desc, function () {
                        console.log('setLocalDescription', pc.localDescription);
                        socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
                    }, logError);
                }, logError);
        }, logError);
    } else {
        console.log('exchange candidate', data);
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

function leave(socketId) {
    const pc = pcPeers[socketId];
    const viewIndex = pc.viewIndex;
    pc.close();
    delete pcPeers[socketId];

    Event.trigger('delete_remoteList', socketId);
    Event.trigger('container_setState', { info: 'One peer leave!' });
    if (!pcPeers.length ) {
        Event.trigger('hungUp');
    }
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
        console.log('track', track);
        pc.getStats(track, function (report) {
            console.log('getStats report', report);
        }, logError);
    }
}
