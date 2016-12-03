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
// var PushNotification = require('react-native-push-notification');
var PhoneContacts = require('react-native-contacts');
var ErrorHandler = require('./ErrorHandler');

import FCM from 'react-native-fcm';


//import ReactNativeRSAUtil from 'react-native-rsa-util';

// var openpgp = require('react-native-openpgp');





// try {

//     var options = {
//         userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }], // multiple user IDs 
//         numBits: 512,                                            // RSA key size 
//         passphrase: 'my-secret-password'         // protects the private key 
//     };

//     openpgp.generateKey(options).then((key) => {
//         var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... ' 
//         var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... ' 

//         var pub = openpgp.readArmoredKey(pubkey);
//         var priv = openpgp.readArmoredKey(privkey);

//         // decrypt the private key with password
//         var success = priv.keys[0].decrypt('my-secret-password');

//         var options = {
//             data: 'Hello, World!',
//             publicKeys: pub.keys,
//             privateKeys: priv.keys // for signing (optional)
//         };

//         openpgp.encrypt(options).then((ciphertext) => {
//             console.log(ciphertext.data);
//             console.log(ciphertext);
//           // encrypted = ciphertext.message.packets.write(); // get raw encrypted packets as Uint8Array 

//             options2 = {
//                 message: openpgp.readBinaryMessage(ciphertext),             // parse encrypted bytes 
//                 publicKeys: pub.keys,     // for verification (optional) 
//                 privateKey: priv.keys, // for decryption 
//                 format: 'binary'                                      // output as Uint8Array 
//             };

//             openpgp.decrypt(options2).then((plaintext) => {
//                 console.log('OK');
//                 return plaintext.data // Uint8Array([0x01, 0x01, 0x01]) 
//             }, (error) => {
//                 console.log(error);
//                 console.log('3');
//             });

//         }, (error) => {
//             console.log(error);
//             console.log('1');
//         });
//     }, (error) => {
//         console.log('2');
//     });


// } catch (error) {
//     console.log(error);
//     console.log('error catch');
// }


export default class WriteNow extends Component {
    constructor() {
        super();
    }

    componentWillMount() {
        FCM.getFCMToken().then(token => {
            serverSrv.login(token);
            console.log(token);
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
        this.loadContacts();
        try {
            serverSrv.GetAllMyFriends((result) => {
                try {
                    Event.trigger('UpdateMyFriends', result);
                } catch (error) {
                    ErrorHandler.WriteError(error);
                }
            });
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