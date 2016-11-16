import React, { Component } from 'react';
import {
    AppRegistry,
    AsyncStorage,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    View,
    TextInput
} from 'react-native';
import InitRout from './src/InitRout';
import ChatRoom from './src/ChatRoom/ChatRoom';
import emoji from 'emoji-datasource';
var Event = require('./Services/Events');
var serverSrv = require('./Services/serverSrv');
var PushNotification = require('react-native-push-notification');
var PhoneContacts = require('react-native-contacts');
var ErrorHandler = require('./ErrorHandler');
// var EncryptionUtil = require('writenow-rsa');

// setTimeout(function () {
//   EncryptionUtil.test((result) => {
//     console.log("result");
//     console.log(result);
//   });

//   ReactNativeRSAUtil.encryptStringWithPrivateKey("content", `-----BEGIN RSA PRIVATE KEY-----
// MIIBOAIBAAJAXr3Li0mGG76UPuI2JE1Nf0z0Y8mgMh/NiqtzbhhP4IJouNDFZK5k
// dk4sj1FciPsJ/TDI2a1Dixzc7Z4XxQmU0QIDAQABAkBX3y9XnDT/rK6w+H0BBJXZ
// eZW+q/aiJu8sK8NfHLuRXiDbC2rgBBLi6cQb1VGEWk8JccXGxWtokZorO6x4/N3x
// AiEAq9L8CaMQYFc3aGKstenmhNwqGsJqfACgHEuJpOatYG0CIQCNJ51PP2q7dqyS
// U/b6ITSj1z2CbWHgfHInL3ihZSqvdQIgWpqQqIxB0GttHjAaHnrOQXTPBvlJqUWz
// J/h1Bm1VMykCIFDRVKUyBxcsPGRPhMHzzyLbstEBdZ/FQMqkyGmH9eedAiA/1VRE
// AHFqyHZtM2qS45D3RjiVSRn2wU3i85lIQ3rA8Q==)
// -----END RSA PRIVATE KEY-----`)
//     .then((error, data) => {
//       console.log(data);
//       if (!error) {
//         console.log(data);
//       }
//     });
//}, 1000);



//import ReactNativeRSAUtil from 'react-native-rsa-util';

// var JSEncrypt = require('./jsencrypt').JSEncrypt;

// var t = new JSEncrypt();
// console.log(t);


export default class WriteNow extends Component {
    constructor() {
        super();
    }

    componentWillMount() {
        serverSrv.login();
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
        this.loadContacts();
        PushNotification.configure({

            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
                console.log('TOKEN:', token);
            },

            // (required) Called when a remote or local notification is opened or received
            onNotification: function(notification) {
                try {
                    PushNotification.localNotification(notification);
                } catch (error) {

                }
            },

            popInitialNotification: function(notification) {
                try {
                    PushNotification.localNotification(notification);
                } catch (error) {

                }
            },


            // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications) 
            senderID: "486059628270",

            // Should the initial notification be popped automatically
            // default: true
            //popInitialNotification: true,

            /**
              * (optional) default: true
              * - Specified if permissions (ios) and token (android and ios) will requested or not,
              * - if not, you must call PushNotificationsHandler.requestPermissions() later
              */
            requestPermissions: true,
        });

        serverSrv.GetAllMyFriends((result) => {
            try {
                Event.trigger('UpdateMyFriends', result);
            } catch (error) {
                ErrorHandler.WriteError(error);
            }
        });
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

// <StatusBar barStyle="light-content" />
// <View style={styles.statusbar} />
// <InitRout />

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