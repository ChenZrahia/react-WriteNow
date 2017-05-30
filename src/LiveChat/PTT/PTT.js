import React, { Component } from 'react';
import {
    Image,
    ReactNative,
    ListView,
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
    Modal,
    TextInput,
    TouchableHighlight,
    BackAndroid,
    Vibration,
    AppState
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import IconMat from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import ImageResizer from 'react-native-image-resizer';
import { RTCView } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import FitImage from '../../../plugins/FitImage';
import renderIf from '../../../plugins/renderIf';
import Toast from 'react-native-root-toast';

var dismissKeyboard = require('dismissKeyboard');
var Event = require('../../../Services/Events');
var serverSrv = require('../../../Services/serverSrv');
var ErrorHandler = require('../../../ErrorHandler');
var generalStyle = require('../../../styles/generalStyle');
var Sound = require('react-native-sound');
var liveSrv = require('../../../Services/liveSrv');
var _IsIncomingCall = false;

var mirs1 = new Sound('mirs1.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
    }
});

var mirs2 = new Sound('mirs2.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
    }
});

let container = null;

export default class Call extends Component {
    constructor() {
        super();

        try {
            this.container_setState = this.container_setState.bind(this);
            this.receiveTextData = this.receiveTextData.bind(this);
            this.delete_remoteList = this.delete_remoteList.bind(this);
            this.add_remoteList = this.add_remoteList.bind(this);
            this.hungUp = this.hungUp.bind(this);
            this.getCall = this.getCall.bind(this);
            this.talk = this.talk.bind(this);
            this.endTalk = this.endTalk.bind(this);
            this.connectToServer = this.connectToServer.bind(this);
            this.recall = this.recall.bind(this)
            Event.on('container_setState', this.container_setState);
            Event.on('receiveTextData', this.receiveTextData);
            Event.on('delete_remoteList', this.delete_remoteList);
            Event.on('add_remoteList', this.add_remoteList);
            Event.on('hungUp', this.hungUp);
            Event.on('getPttCall', this.getCall);
            InCallManager.setSpeakerphoneOn(true);
            dismissKeyboard();
            this.callInterval = null;
            this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });
            this.state = {
                startTime: moment(),
                currentTime: 0,
                info: 'Initializing',
                status: 'init',
                roomID: null,
                isFront: true,
                selfViewSrc: null,
                remoteList: {},
                textRoomConnected: false,
                textRoomData: [],
                textRoomValue: '',
                leftBtn: require('../../../img/call-accept.png'),
                statusPtt: 'red'
            };
            this.startCall = this.startCall.bind(this);
            this.pptUp = this.pptUp.bind(this);
            InCallManager.setMicrophoneMute(true);

        } catch (e) {
            ErrorHandler.WriteError("PTT.js -> constructor", e);
        }
    }
    getCall(IsIncomingCall) {
        try {
            _IsIncomingCall = IsIncomingCall;
            var roomId = null;
            if (this.props.convId) {
                roomId = this.props.convId;
                this.setState({ roomID: this.props.convId });
            } else {
                roomId = this.state.roomID;
            }
            liveSrv._convId = roomId;
            serverSrv.enterChatCall(roomId);
            if (roomId) {
                serverSrv.enterChatCall(roomId);
            }
            if (IsIncomingCall == true) {
                mirs1.play((success) => { });
            }
            if (liveSrv._isInCall == true) {
                this.connectToServer();
            }
            if (this.props.convId) {
                serverSrv.GetConvData_ByConvId(this.props.convId, (convData) => {
                    try {
                        //if convData is null or user not exist in local DB  -------- להשלים בדיקה
                        if (convData.groupPicture) {
                            ImageResizer.createResizedImage(convData.groupPicture, 400, 400, 'JPEG', 100, 0, "temp").then((resizedImageUri) => {
                                setTimeout(() => {
                                    this.setState({ userPicture: resizedImageUri });
                                }, 500);
                            }).catch((err) => {
                                ErrorHandler.WriteError('PTT.js => getCall => ImageResizer', err);
                            });
                        }
                    } catch (error) {
                        ErrorHandler.WriteError('PTT.js => getCall => GetConvData_ByConvId', err);
                    }
                });
            } else if (this.props.userPicture) {
                ImageResizer.createResizedImage(this.props.userPicture, 400, 400, 'JPEG', 100, 0, "temp").then((resizedImageUri) => {
                    setTimeout(() => {
                        this.setState({ userPicture: resizedImageUri });
                    }, 500);
                }).catch((err) => {
                    ErrorHandler.WriteError('PTT.js => render => ImageResizer', err);
                });
            }
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> getCall", e);
        }
    }

    componentDidMount() {
        try {
            InCallManager.turnScreenOn();
            container = this;
            BackAndroid.removeEventListener('hardwareBackPress', () => { });
            BackAndroid.addEventListener('hardwareBackPress', () => {
                this.hungUp(true);
            });
            serverSrv.exitChatCall_server((convId) => {
                try {
                    if (this.state && this.state.roomID && this.state.roomID.indexOf(convId) == 0) {
                        this.hungUp();
                    }
                } catch (error) {
                    ErrorHandler.WriteError("PTT.js -> => componentDidMount => exitChatCall_server", e);
                }
            });

            AppState.addEventListener('change', (state) => {
                if (state != 'active') {
                    InCallManager.setMicrophoneMute(false);
                }
            })
        } catch (e) {
            ErrorHandler.WriteError("PTT.js -> componentDidMount", e);
        }
    }

    container_setState(data) {
        try {
            setTimeout(() => {
                container.setState(data);
                if (data && data.status == 'ready') {
                    this._press();
                }
            }, 500);
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> container_setState", error);
        }
    }

    delete_remoteList(socketId) {
        try {
            const remoteList = container.state.remoteList;
            delete remoteList[socketId];
            container.setState({ remoteList: remoteList });
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> delete_remoteList", error);
        }
    }

    add_remoteList(socketId, event) {
        try {
            const remoteList = container.state.remoteList;
            remoteList[socketId] = event.stream.toURL();
            container.setState({ remoteList: remoteList });
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> add_remoteList", error);
        }
    }

    _press(event) {
        try {
            console.log('## setKeepScreenOn ');
            InCallManager.start({ media: 'audio' });
            InCallManager.setForceSpeakerphoneOn(true);
            InCallManager.turnScreenOn();
            InCallManager.setKeepScreenOn(true);
            InCallManager.setMicrophoneMute(true);
            InCallManager.setSpeakerphoneOn(true);
            if (this.refs && this.refs.roomID) {
                this.refs.roomID.blur();
            }
            this.setState({ status: 'connect', info: 'Connecting' });
            liveSrv.join(this.state.roomID);
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> _press", error);
        }
    }

    _switchVideoType() {
        try {
            const isFront = !this.state.isFront;
            this.setState({ isFront });
            liveSrv.getLocalStream(false, isFront, function (stream) {
                try {
                    if (liveSrv.localStream) {
                        for (const id in liveSrv.pcPeers) {
                            const pc = liveSrv.pcPeers[id];
                            pc && pc.removeStream(liveSrv.localStream);
                        }
                        liveSrv.localStream.release();
                    }
                    liveSrv.localStream = stream;
                    liveSrv.container.setState({ selfViewSrc: stream.toURL() });

                    for (const id in liveSrv.pcPeers) {
                        const pc = liveSrv.pcPeers[id];
                        pc && pc.addStream(liveSrv.localStream);
                    }
                } catch (error) {
                    ErrorHandler.WriteError("PTT.js -> _press", error);
                }
            });
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> _switchVideoType", error);
        }
    }

    receiveTextData(data) {
        try {
            const textRoomData = this.state.textRoomData.slice();
            textRoomData.push(data);
            this.setState({ textRoomData, textRoomValue: '' });
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> receiveTextData", error);
        }
    }

    _textRoomPress() {
        try {
            if (!this.state.textRoomValue) {
                return
            }
            const textRoomData = this.state.textRoomData.slice();
            textRoomData.push({ user: 'Me', message: this.state.textRoomValue });
            for (const key in liveSrv.pcPeers) {
                const pc = liveSrv.pcPeers[key];
                pc.textDataChannel.send(this.state.textRoomValue);
            }
            this.setState({ textRoomData, textRoomValue: '' });
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> _textRoomPress", error);
        }
    }

    recall() {
        try {
            var toast = Toast.show("Sending signal...", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0
            });
            liveSrv.socket.emit('makeCall', () => { console.log('make a call'); }, this.props.convId, 3, true);
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> recall", error);
        }
    }

    connectToServer() {
        try {
            liveSrv.Connect(this.props.convId, this.hungUp, _IsIncomingCall, false, true);
            liveSrv.socket.on('leave', () => {
                InCallManager.setKeepScreenOn(false);
                InCallManager.stop();
            });
            liveSrv.socket.on('lineIsFree', () => {
                try {
                    mirs2.play((success) => { });
                    console.log('## InCallManager.setMicrophoneMute ## true 1');
                    InCallManager.setMicrophoneMute(true);
                    this.setState({ statusPtt: 'green' });
                } catch (error) {
                    ErrorHandler.WriteError("PTT.js -> lineIsFree", e);
                }
            });

            liveSrv.socket.on('getPermissionToTalk_serverAnswer', (answer, uidAsked) => {
                try {
                    mirs1.play((success) => { });
                    if (answer == true && uidAsked == serverSrv._uid) {
                        console.log('## InCallManager.setMicrophoneMute ## false  2');
                        InCallManager.setMicrophoneMute(false);
                        InCallManager.setSpeakerphoneOn(true);
                        this.setState({ statusPtt: 'yellow' });
                    } else {
                        console.log('## InCallManager.setMicrophoneMute ## true 3');
                        InCallManager.setMicrophoneMute(true);
                        this.setState({ statusPtt: 'red' });
                    }
                } catch (error) {
                    ErrorHandler.WriteError("PTT.js -> on => getPermissionToTalk_serverAnswer", e);
                }
            });

            liveSrv.socket.on('getPermissionToTalk_serverAsk', (uidAsked) => {
                try {
                    if (this.state.statusPtt == 'green' && uidAsked != serverSrv._uid) {
                        console.log('## InCallManager.setMicrophoneMute ## true 4');
                        InCallManager.setMicrophoneMute(true);
                        this.setState({ statusPtt: 'red' });
                        liveSrv.socket.emit('getPermissionToTalk_clientAnswer', true, uidAsked);
                    } else if (this.state.statusPtt != 'green' && uidAsked != serverSrv._uid) {
                        liveSrv.socket.emit('getPermissionToTalk_clientAnswer', false, uidAsked);
                    }
                } catch (error) {
                    ErrorHandler.WriteError("PTT.js -> on getPermissionToTalk_serverAsk", error);
                }
            });
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> connectToServer", error);
        }
    }

    startCall() {
        try {
            if (liveSrv._isInCall == false) {
                mirs1.stop();
                this.connectToServer();

                if (this.callInterval) {
                    clearInterval(this.callInterval);
                }
                this.setState({ startTime: moment() });
                this.callInterval = setInterval(() => {
                    this.setState({ currentTime: (moment() - this.state.startTime) });
                }, 1000);
                mirs1.play((success) => { });
            } else {
                this.recall();
                mirs1.stop();
                mirs1.play((success) => { });
            }
        } catch (e) {
            ErrorHandler.WriteError("PTT.js -> startCall", e);
        }
    }

    hungUp(isBackAndroid) {
        try {
            this.setState({
                currentTime: 0,
                info: 'Initializing',
                status: 'init',
                roomID: null,
                isFront: true,
                selfViewSrc: null,
                remoteList: {},
                textRoomConnected: false,
                textRoomData: [],
                textRoomValue: '',
                statusPtt: 'red'
            });
            mirs1.stop();
            liveSrv.hungUp();
            console.log('## InCallManager.setMicrophoneMute ## false 5');
            InCallManager.stopRingback();
            InCallManager.setMicrophoneMute(false);
            InCallManager.setKeepScreenOn(false);
            InCallManager.stop();
            if (this.callInterval) {
                clearInterval(this.callInterval);
            }
            console.log('## InCallManager.setMicrophoneMute ## false 6');
            InCallManager.setMicrophoneMute(false);
            InCallManager.setSpeakerphoneOn(true);
            if (this.state.roomID) {
                serverSrv.exitChatCall(this.state.roomID);
            }
            if (isBackAndroid != true) {
                Actions.pop();
            }
            if (serverSrv._isCallMode == true) {
                BackAndroid.exitApp();
            }
        } catch (e) {
            ErrorHandler.WriteError("PTT.js -> hungUp", e);
        }
    }

    pptUp() {
        try {

        } catch (e) {
            ErrorHandler.WriteError("PTT.js -> pptUp", e);
        }
    }

    talk() {
        try {
            if (this.state.statusPtt == 'green') {
                liveSrv.socket.emit('getPermissionToTalk_clientAsk', this.props.convId);
                Vibration.vibrate(10);
            } else {

            }
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> talk", error);
        }
    }

    endTalk() {
        try {
            if (this.state.statusPtt == 'yellow') {
                liveSrv.socket.emit('releaseLine');
                this.setState({ statusPtt: 'green' });
                Vibration.vibrate(10);
            } else {

            }
        } catch (error) {
            ErrorHandler.WriteError("PTT.js -> talk", error);
        }
    }

    render() {
        try {
            return (
                <View style={[generalStyle.styles.container, { backgroundColor: generalStyle._darkColor }]}>
                    <View style={generalStyle.styles.appbar}>
                        <Text style={generalStyle.styles.titleHeader}>
                            Walkie-Talkie With {this.props.userName}
                        </Text>
                    </View>

                    <View style={styles.callerImageContainer}>
                        {renderIf(this.state.statusPtt == 'red')(
                            <Image style={{ resizeMode: 'contain', width: null, flex: 1, margin: 30 }} source={require('../../../img/glossy-red-button-hi.png')} />
                        )}
                        {renderIf(this.state.statusPtt == 'yellow')(
                            <Image style={{ resizeMode: 'contain', width: null, flex: 1, margin: 30 }} source={require('../../../img/glossy-yellow-button-hi.png')} />
                        )}
                        {renderIf(this.state.statusPtt == 'green')(
                            <Image style={{ resizeMode: 'contain', width: null, flex: 1, margin: 30 }} source={require('../../../img/glossy-green-button-hi.png')} />
                        )}
                    </View>
                    <View style={styles.statusPanel}>
                        <Text style={styles.welcome}>
                            {this.state.info}
                        </Text>
                        <RTCView streamURL={this.state.selfViewSrc} style={styles.selfView} />
                        {
                            liveSrv.mapHash(this.state.remoteList, function (remote, index) {
                                return <RTCView key={index} streamURL={remote} style={styles.remoteView} />
                            })
                        }
                    </View>
                    <View style={styles.clockPanel}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                            <Text>{moment(this.state.currentTime).format('hh:mm:ss')}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPressIn={this.talk} onPressOut={this.endTalk} style={styles.pttPanel}>
                        <View style={{ width: null, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.mngPanel}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                            <TouchableOpacity onPressIn={this.startCall} onPressOut={this.pptUp}>

                                <Image style={{ height: 50, width: 50, marginRight: 30, marginLeft: 30, marginTop: 10 }} source={this.state.leftBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.hungUp} >
                                <Image style={{ height: 50, width: 50, marginRight: 30, marginLeft: 30, marginTop: 10 }} source={require('../../../img/call-reject.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('PTT.js => render', e);
        }
    }
}


var styles = StyleSheet.create({
    selfView: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 100,
        height: 75

    },
    remoteView: {
        flex: 1
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    listViewContainer: {
        height: 30,
    },
    callerImageContainer: {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'column',
        marginBottom: 110
    },
    callerImage: {
        flex: 0.5,
    },
    clockPanel: {
        position: 'absolute',
        height: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        bottom: 90,
        left: 0,
        right: 0,
        zIndex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusPanel: {
        position: 'absolute',
        height: 70,
        bottom: 10,
        left: 0,
        right: 0,
        zIndex: 3
    },
    pttPanel: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0)',
        top: 0,
        bottom: 110,
        left: 0,
        right: 0,
        zIndex: 3
    },
    mngPanel: {
        position: 'absolute',
        height: 70,
        backgroundColor: 'rgba(0,0,0,0.4)',
        bottom: 10,
        left: 0,
        right: 0,
        zIndex: 3
    },
    mngPanelContainer: {
        position: 'absolute',
        height: 70,
        backgroundColor: 'rgba(0,0,0,0.4)',
        bottom: 10,
        left: 0,
        right: 0,
        zIndex: 3,
    }
});