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
    TouchableHighlight
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import IconMat from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import ImageResizer from 'react-native-image-resizer';
import { RTCView } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import FitImage from '../../../plugins/FitImage';
import renderIf from '../../../plugins/renderIf';

var dismissKeyboard = require('dismissKeyboard');
var Event = require('../../../Services/Events');
var serverSrv = require('../../../Services/serverSrv');
var ErrorHandler = require('../../../ErrorHandler');
var generalStyle = require('../../../styles/generalStyle');
var Sound = require('react-native-sound');
var liveSrv = require('../../../Services/liveSrv');

var mirs1 = new Sound('mirs1.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
    } else { // loaded successfully 
        console.log('duration in seconds: ' + mirs1.getDuration() +
            'number of channels: ' + mirs1.getNumberOfChannels());
    }
});

var mirs2 = new Sound('mirs2.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
    } else { // loaded successfully 
        console.log('duration in seconds: ' + mirs2.getDuration() +
            'number of channels: ' + mirs2.getNumberOfChannels());
    }
});

var callRingtone = new Sound('voicecall.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
    } else { // loaded successfully 
        console.log('duration in seconds: ' + mirs2.getDuration() +
            'number of channels: ' + mirs2.getNumberOfChannels());
    }
});

let container = null;

export default class Call extends Component {
    constructor() {
        super();
        this.container_setState = this.container_setState.bind(this);
        this.receiveTextData = this.receiveTextData.bind(this);
        this.delete_remoteList = this.delete_remoteList.bind(this);
        this.add_remoteList = this.add_remoteList.bind(this);
        this.hungUp = this.hungUp.bind(this);
        this.getCall = this.getCall.bind(this);
        Event.on('container_setState', this.container_setState);
        Event.on('receiveTextData', this.receiveTextData);
        Event.on('delete_remoteList', this.delete_remoteList);
        Event.on('add_remoteList', this.add_remoteList);
        Event.on('hungUp', this.hungUp);
        Event.on('getCall', this.getCall);
        try {
            dismissKeyboard();
            this.callInterval = null;
            this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => true });
            this.state = {
                startTime: moment(),
                currentTime: 0,
                info: 'Initializing',
                status: 'init',
                roomID: '123',
                isFront: true,
                selfViewSrc: null,
                remoteList: {},
                textRoomConnected: false,
                textRoomData: [],
                textRoomValue: '',
                leftBtn: require('../../../img/call-accept.png')
            };
            this.startCall = this.startCall.bind(this);
            this.pptUp = this.pptUp.bind(this);
        } catch (e) {
            ErrorHandler.WriteError("Call.js -> constructor", e);
        }
    }
    getCall(IsIncomingCall) {
        try {
            if (IsIncomingCall == true) {
                callRingtone.play((success) => { });
                callRingtone.setNumberOfLoops(-1);
            }

            if (this.props.convId) {
                serverSrv.GetConvData_ByConvId(this.props.convId, (convData) => {
                    ImageResizer.createResizedImage(convData.groupPicture, 400, 400, 'JPEG', 100, 0, "temp").then((resizedImageUri) => {
                        this.setState({ userPicture: resizedImageUri });
                    }).catch((err) => {
                        console.log(err);
                        ErrorHandler.WriteError('Call.js => render => ImageResizer', err);
                    });
                });
            } else if (this.props.userPicture) {
                ImageResizer.createResizedImage(this.props.userPicture, 400, 400, 'JPEG', 100, 0, "temp").then((resizedImageUri) => {
                    this.setState({ userPicture: resizedImageUri });
                }).catch((err) => {
                    console.log(err);
                    ErrorHandler.WriteError('Call.js => render => ImageResizer', err);
                });
            }
        } catch (error) {
            ErrorHandler.WriteError("Call.js -> getCall", e);
        }
    }

    componentDidMount() {
        try {
            InCallManager.turnScreenOn();
            container = this;
        } catch (e) {
            ErrorHandler.WriteError("Call.js -> componentDidMount", e);
        }
    }

    container_setState(data) {
        try {
            container.setState(data);
            if (data && data.status == 'ready') {
                this._press();
            }
        } catch (error) {
            ErrorHandler.WriteError("Call.js -> container_setState", error);
        }
    }

    delete_remoteList(socketId) {
        try {
            const remoteList = container.state.remoteList;
            delete remoteList[socketId];
            container.setState({ remoteList: remoteList });
        } catch (error) {
            ErrorHandler.WriteError("Call.js -> delete_remoteList", error);
        }
    }

    add_remoteList(socketId, event) {
        try {
            const remoteList = container.state.remoteList;
            remoteList[socketId] = event.stream.toURL();
            container.setState({ remoteList: remoteList });
            InCallManager.stopRingback();
        } catch (error) {
            ErrorHandler.WriteError("Call.js -> add_remoteList", error);
        }
    }

    _press(event) {
        InCallManager.start({ media: 'audio', ringback: '_DTMF_' });
        this.refs.roomID.blur();
        this.setState({ status: 'connect', info: 'Connecting' });
        liveSrv.join(this.state.roomID);
    }

    _switchVideoType() {
        const isFront = !this.state.isFront;
        this.setState({ isFront });
        liveSrv.getLocalStream(isFront, function (stream) {
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
        });
    }

    receiveTextData(data) {
        const textRoomData = this.state.textRoomData.slice();
        textRoomData.push(data);
        this.setState({ textRoomData, textRoomValue: '' });
    }

    _textRoomPress() {
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
    }

    startCall() {
        try {
            callRingtone.stop();
            liveSrv.Connect(this.hungUp);
            if (this.callInterval) {
                clearInterval(this.callInterval);
            }
            this.setState({ startTime: moment() });
            this.callInterval = setInterval(() => {
                this.setState({ currentTime: (moment() - this.state.startTime) });
                console.log('object');
            }, 1000);
            mirs1.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        } catch (e) {
            ErrorHandler.WriteError("Call.js -> startCall", e);
        }
    }

    hungUp() {
        try {
            callRingtone.stop();
            liveSrv.hungUp();
            InCallManager.stopRingback();
            InCallManager.stop();
            if (this.callInterval) {
                clearInterval(this.callInterval);
            }
            Actions.pop();
        } catch (e) {
            ErrorHandler.WriteError("Call.js -> hungUp", e);
        }
    }

    pptUp() {
        try {
            mirs2.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
            if (this.state.leftBtn == require('../../../img/speaker_on1.png')) {
                this.setState({ leftBtn: require('../../../img/speaker_off.png') });
                InCallManager.setSpeakerphoneOn(true);
            } else {
                this.setState({ leftBtn: require('../../../img/speaker_on1.png') });
                InCallManager.setSpeakerphoneOn(false);
            }

        } catch (e) {
            ErrorHandler.WriteError("Call.js -> pptUp", e);
        }
    }
    // <Image style={{ resizeMode: 'cover', width: null }} source={this.state.userPicture ? {uri: this.state.userPicture}: require('../../../img/user.jpg')} />

    render() {
        try {
            return (
                <View style={[generalStyle.styles.container, { backgroundColor: generalStyle._darkColor }]}>
                    <View style={generalStyle.styles.appbar}>
                        <Text style={generalStyle.styles.titleHeader}>
                            Voice Call With {this.props.userName}
                        </Text>
                    </View>
                    <View style={styles.callerImageContainer}>

                        {renderIf(this.state.userPicture)(
                            <FitImage
                                indicator
                                originalWidth={400}
                                originalHeight={400}
                                source={{ uri: this.state.userPicture }}
                                />
                        )}
                        {renderIf(!this.state.userPicture)(
                            <Image style={{ resizeMode: 'cover', width: null }} source={require('../../../img/user.jpg')} />
                        )}
                    </View>
                    <Image style={{ resizeMode: 'stretch', width: null, flex: 1, top: 0, right: 0, bottom: 0, left: 0, zIndex: 2 }} source={require('../../../img/callBackground.png')} />
                    <View style={styles.statusPanel}>
                        <Text style={styles.welcome}>
                            {this.state.info}
                        </Text>
                        {this.state.status == 'ready' ?
                            (<View>
                                <TextInput
                                    ref='roomID'
                                    autoCorrect={false}
                                    style={{ width: 200, height: 40, borderColor: 'gray', borderWidth: 1 }}
                                    onChangeText={(text) => this.setState({ roomID: text })}
                                    value={this.state.roomID}
                                    />
                                <TouchableHighlight
                                    onPress={this._press}>
                                    <Text>Enter room</Text>
                                </TouchableHighlight>
                            </View>) : null
                        }
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
            ErrorHandler.WriteError('Call.js => render', e);
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