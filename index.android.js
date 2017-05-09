import React, { Component } from 'react';
// import './shim.js'
// import crypto from 'crypto'
import {
    AppRegistry,
    AsyncStorage,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
    AppState
} from 'react-native';

import { Actions } from 'react-native-router-flux'
var Sound = require('react-native-sound');
var liveSrv = require('./Services/liveSrv');
import InitRout from './src/InitRout';
var Event = require('./Services/Events');
var serverSrv = require('./Services/serverSrv');
var PhoneContacts = require('react-native-contacts');
var ErrorHandler = require('./ErrorHandler');

import FCM from 'react-native-fcm';

var newMsg_ring = null;
setTimeout(() => {
    newMsg_ring = new Sound('new_msg.mp3', Sound.MAIN_BUNDLE, (error) => { });
}, 500);

export default class WriteNow extends Component {
    constructor(a, b, c, d, e, f) {
        super();
    }

    componentWillMount() {
        FCM.getInitialNotification().then(notif => {
            if (notif && notif.data) {
                var notifData = JSON.parse(notif.data);
                if (notifData.isVoiceCall == 'true') {
                    serverSrv._isCallMode = true;
                    Actions.Call(notifData);
                    setTimeout(() => {
                        Event.trigger('getCall', true);
                    }, 100);
                } else if (notifData.isVideoCall == 'true') {
                    serverSrv._isCallMode = true;
                    Actions.Video(notifData);
                    setTimeout(() => {
                        Event.trigger('getVideoCall', true);
                    }, 100);
                } else if (notifData.isPttCall == 'true') {
                    serverSrv._isCallMode = true;
                    Actions.PTT(notifData);
                    setTimeout(() => {
                        Event.trigger('getPttCall', true);
                    }, 100);
                }                
                else {
                    Event.trigger('lastMessage', notifData.message, notifData.message_time, notifData.convId, true, notifData.isEncrypted == 'true');
                }
            }
        });
        console.log("##su");
        FCM.getFCMToken().then(token => {
        console.log("##su", token);
            
            serverSrv._token = token;
            serverSrv.login(token);
        });
        this.notificationUnsubscribe = FCM.on('notification', (notif) => {   //application alrady open
            if (notif && notif.data) {
                var notifData = JSON.parse(notif.data);
                if (notifData.isVoiceCall == 'true') {
                    serverSrv._isCallMode = false;
                    if (liveSrv._isInCall == true) {
                        liveSrv.socket.emit('unavailableCall'); //TODO: לממש
                    } else {
                        Actions.Call(notifData);
                        setTimeout(() => {
                            Event.trigger('getCall', true);
                            Event.trigger('NewLiveChat');
                        }, 100);
                    }
                } else if (notifData.isVideoCall == 'true') {
                    serverSrv._isCallMode = false;
                    if (liveSrv._isInCall == true) {
                        liveSrv.socket.emit('unavailableCall'); //TODO: לממש
                    } else {
                        Actions.Video(notifData);
                        setTimeout(() => {
                            Event.trigger('getVideoCall', true);
                            Event.trigger('NewLiveChat');
                        }, 100);
                    }
                } else if (notifData.isPttCall == 'true') {
                    serverSrv._isCallMode = false;
                    if (liveSrv._isInCall == true) {
                        liveSrv.socket.emit('unavailableCall'); //TODO: לממש
                    } else {
                        Actions.PTT(notifData);
                        setTimeout(() => {
                            Event.trigger('getPttCall', true);
                            Event.trigger('NewLiveChat');
                        }, 100);
                    }
                } else {
                    if (newMsg_ring && serverSrv._convId != notifData.convId) {
                        newMsg_ring.play((success) => { });
                    } 
                    if (notifData && notifData.message) {
                        Event.trigger('lastMessage', notifData.message, notifData.message_time, notifData.convId, true, notifData.isEncrypted == 'true');
                    } else if (notifData && notifData.lastMessage) {
                        Event.trigger('lastMessage', notifData.lastMessage, notifData.lastMessageTime, notifData.id, true, notifData.isEncrypted == 'true');
                    }
                }
            } else {
                if (notif.isVoiceCall != 'true' && notif.isVideoCall != 'true' && notif.isPttCall != 'true') {
                    if (newMsg_ring && serverSrv._convId != notif.convId) {
                        newMsg_ring.play((success) => { });
                    }
                    Event.trigger('lastMessage', notif.message, notif.message_time, notif.convId, true, notif.isEncrypted == 'true');
                }
            }
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            if (notif.local_notification) {
            }
            if (notif.opened_from_tray) {
            }
        });
    }

    loadContacts() {
        serverSrv.getAllPhoneNumbers((phnesNumbers) => {
            if (!phnesNumbers) {
                phnesNumbers = [];
            }
            var myContacts = [];
            PhoneContacts.getAll((err, contacts) => {
                if (err && err.type === 'permissionDenied') {
                    console.log('permissionDenied');
                    // x.x 
                } else {
                    contacts = contacts.filter((user) => {
                        if (user.phoneNumbers && user.phoneNumbers[0]) {
                            var usr = {
                                isOnline: false,
                                isPhoneContact: true,
                                phoneNumber: user.phoneNumbers[0].number.replace('+972', '0').replace(/[ ]|[-()]/g, ''),
                                publicInfo: {
                                    fullName: user.givenName + (user.middleName ? (' ' + user.middleName) : '') + (user.familyName ? (' ' + user.familyName) : ''),
                                    picture: user.thumbnailPath
                                }
                            };
                            if (phnesNumbers.indexOf(usr.phoneNumber) >= 0) {
                                return false;
                            }
                            else {
                                myContacts.push(usr);
                                phnesNumbers.push(usr.phoneNumber);
                                return true;
                            }
                        } else {
                            return false;
                        }
                    });
                    serverSrv.InsertMyContacts(myContacts, true);
                }
            });
        });
    }

    componentDidMount() {       
        setTimeout(() => {
            this.loadContacts();
        }, 200); 
        try {
            serverSrv.GetAllMyFriends((result) => { //היה בהערה ולא טען את אנשי הקשר
                try {
                    Event.trigger('UpdateMyFriends', result);
                } catch (error) {
                    ErrorHandler.WriteError(error);
                }
            });

        AppState.addEventListener('change', (state) =>
            {
                if (state != 'active') {
                    serverSrv.socket.emit('changeOnlineStatus', false);
                } else {
                    serverSrv.socket.emit('changeOnlineStatus', true);
                }
            })

        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#820cf7"
                    animated={true}
                    />
                <InitRout />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    example: {
        elevation: 4,
    },
    statusbar: {
        backgroundColor: '#820cf7',
        height: Platform.OS === 'ios' ? 20 : 24,
    },
    appbar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: Platform.OS === 'ios' ? 44 : 56,
        backgroundColor: '#9933FF',
        elevation: 4,
    },
    title: {
        flex: 1,
        margin: 16,
        textAlign: Platform.OS === 'ios' ? 'center' : 'left',
        fontSize: Platform.OS === 'ios' ? 20 : 18,
        color: '#fff',
    }
});


AppRegistry.registerComponent('WriteNow', () => WriteNow);