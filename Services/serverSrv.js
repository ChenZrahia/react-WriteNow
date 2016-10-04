var React = require('react-native');
import {Actions} from 'react-native-router-flux';
//import React from 'react-native';
import './UserAgent';
import io from 'socket.io-client/socket.io';
var RSAKey = require('react-native-rsa');
var SignUp = require('../src/SignUp/SignUp');

//--------for dev mode only-----------//
var encryptedUid = 'UIP5n4v1jj24a+dHq6L/QqLwDFtPnSoebPzUe5+DWKOQ+rj5boKTAI6goMgySXHDj4BRMOa16wNV743D3/5WfRlXPrizY6nvi3XEmg/oPQvmNLlchDDjqZpQW8nfAS3IH9jZwDqFjxMKVkMau1SOLJxMroz7hTKVH7gOCGLHzik=';
var publicKey = `-----BEGIN PUBLIC KEY-----
        MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAInhtN7l9IVl0BqKC+yav4KrB09XtICc
            B3nfrzvfLZBCmXKkS5GYg/xzIx5BbsfVSKOKXzCcnlIhWUssanrDiW8CAwEAAQ==
            -----END PUBLIC KEY-----`;
//--------for dev mode only-----------//

// var ReactNativeRSAUtil = React.NativeModules.ReactNativeRSAUtil;

export var socket = io('https://server-sagi-uziel.c9users.io:8080', { query: { encryptedUid: encryptedUid, publicKey: publicKey } });
var ErrorHandler = require('../ErrorHandler');
var SQLite = require('react-native-sqlite-storage')

function errorDB(error) {
    ErrorHandler.WriteError('SQL Error: ', error);
}

var db = SQLite.openDatabase({ name: 'WriteNow.db', location: 'default' }, null, errorDB);
var _isFirstTime_Friends = true;
var _isFirstTime_Chats = true;
var _isAppOpen = true;
export var _myFriends = null;
export var _myChats = null;
export var _uid = null;


export function DeleteDb() {
    db.transaction((tx) => {
        tx.executeSql('DELETE FROM UserInfo', [], null, errorDB); //------------------
        tx.executeSql('DELETE FROM Conversation', [], null, errorDB); //------------------
        tx.executeSql('DELETE FROM Friends', [], null, errorDB); //------------------

        tx.executeSql('DROP FROM UserInfo', [], null, errorDB); //------------------
        tx.executeSql('DROP FROM Conversation', [], null, errorDB); //------------------
        tx.executeSql('DROP FROM Friends', [], null, errorDB); //------------------
    });
}

//Users
export function GetAllMyFriends(callback, isUpdate) {
    try {
        if (_myFriends && callback && !isUpdate) {
            callback(_myFriends);
            return;
        }
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Friends', [], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        result.push({
                            id: rs.rows.item(i).id,
                            phoneNumber: rs.rows.item(i).phoneNumber,
                            ModifyDate: rs.rows.item(i).ModifyDate,
                            ModifyPicDate: rs.rows.item(i).ModifyPicDate,
                            publicInfo: {
                                fullName: rs.rows.item(i).fullName,
                                mail: rs.rows.item(i).mail,
                                picture: rs.rows.item(i).picture,
                                gender: rs.rows.item(i).gender
                            }
                        });
                    }
                    _myFriends = result;
                    if (callback) {
                        callback(result);
                        if (_isFirstTime_Friends == true) {
                            _isFirstTime_Friends = false;
                            GetAllMyFriends_Server(callback);
                        }
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => SELECT * FROM Friends => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends', error);
    }
}

function GetAllMyFriends_Server(callback) {
    try {
        var friends = [];
        if (_myFriends) {
            friends = _myFriends;
        }
        let friendUidArray = friends.map((friend) => { return friend.id; });
        socket.emit('GetMyFriendsChanges', friendUidArray, ((data) => {
            db.transaction((tx) => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].deletedUser == true && data[i].id) {
                        tx.executeSql('DELETE FROM Friends WHERE id=?', [data[i].id]);
                    } else {
                        tx.executeSql('INSERT INTO Friends VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [data[i].id,
                                data[i].phoneNumber,
                                data[i].ModifyDate,
                                data[i].ModifyPicDate,
                                data[i].publicInfo.fullName,
                                data[i].publicInfo.mail,
                                data[i].publicInfo.picture,
                                data[i].publicInfo.gender]);
                    }
                }
                GetAllMyFriends(callback, true);
            }, (error) => {
                ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server => GetMyFriendsChanges', error);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server', error);
    }
}

//Conversation
export function GetAllUserConv(callback, isUpdate) {
    try {
        if (_myChats && callback && !isUpdate) {
            callback(_myChats);
            return;
        }
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Conversation', [], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        result.push({
                            id: rs.rows.item(i).id,
                            isEncrypted: rs.rows.item(i).isEncrypted,
                            manager: rs.rows.item(i).manager,
                            groupName: rs.rows.item(i).groupName,
                            groupPicture: rs.rows.item(i).groupPicture,
                            isGroup: rs.rows.item(i).isGroup //לעשות בדיקה אם בשרת נוספו משתתפים לשיחה. לשלוח גייסון של קוד שיחה וקוד משתתפים (מערך)
                        });
                    }
                    _myChats = result;
                    if (callback) {
                        callback(result);
                        if (_isFirstTime_Chats == true) {
                            _isFirstTime_Chats = false;
                            console.log('callback');
                            GetAllUserConv_Server(callback);
                        }
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => SELECT * FROM Conversation => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => GetAllUserConv => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllUserConv', error);
    }
}

function GetAllUserConv_Server(callback) {
    try {
        var chats = [];
        if (_myChats) {
            chats = _myChats;
        }
        let convIdArray = chats.map((chat) => { return chat.id; });
        socket.emit('GetAllUserConvChanges', convIdArray, ((data) => {
            db.transaction((tx) => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].deletedConv == true && data[i].id) {
                        tx.executeSql('DELETE FROM Conversation WHERE id=?', [data[i].id]);
                    } else {
                        tx.executeSql('INSERT INTO Conversation VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [data[i].id,
                                data[i].isEncrypted,
                                data[i].manager,
                                data[i].groupName,
                                data[i].groupPicture,
                                data[i].isGroup,
                                data[i].lastMessage,
                                data[i].lastMessageTime
                            ]);
                    }
                }
                console.log('callback GetAllUserConv1');
                GetAllUserConv(callback, true);
            }, (error) => {
                ErrorHandler.WriteError('serverSrv.js => GetAllUserConv_Server => GetAllUserConvChanges', error);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllUserConv_Server', error);
    }
}

//connect  login
export function login() {
    db.transaction((tx) => {
        try {
            tx.executeSql('SELECT * FROM UserInfo', [], (tx, rs) => {
                if (rs.rows.length > 0) {
                    var item = rs.rows.item(rs.rows.length - 1);
                    _uid = item.uid;
                    //  Actions.Tabs();
                    Actions.SignUp({ type: 'replace' }); //-test only

                    // ReactNativeRSAUtil.encryptStringWithPrivateKey(item.uid, item.privateKey)
                    //     .then((error, data) => {
                    //         try {
                    //              if ( !error ) {
                    //                 console.log(data);
                    //                 socket.disconnect();
                    //                 socket = io.connect('https://server-sagi-uziel.c9users.io:8080', {query: {encryptedUid: data, publicKey: item.publicKey}});
                    //             } else {
                    //                 //ErrorHandler.WriteError(' constructor => AuthenticationOk', error);
                    //             }
                    //         } catch (error) {

                    //         }
                    //     });


                    // try {
                    //     socket.disconnect();
                    //     socket = io.connect('https://server-sagi-uziel.c9users.io:8080', {query: {encryptedUid: encryptedUid, publicKey: item.publicKey}});
                    // } catch (error) {
                    //     ErrorHandler.WriteError('constructor => _loggingService.reConnect', error);
                    // }
                    socket.removeAllListeners("AuthenticationOk");
                    _isAppOpen = false;
                    socket.on('AuthenticationOk', (ok) => {
                        try {
                            if (_isAppOpen == false) {
                                // _zone.run(() => {
                                //     nav.popToRoot();
                                //     nav.push(TabsPage);
                                // });
                                _isAppOpen = true;
                            }
                        } catch (e) {
                            Actions.SignUp({ type: 'replace' });
                            ErrorHandler.WriteError('EnterPage constructor => AuthenticationOk', error);
                        }
                    });
                }
                else {
                    try {
                        Actions.SignUp({ type: 'replace' });
                    } catch (error) {
                        console.log(error);
                    }
                }
            }, (error) => {
                Actions.SignUp({ type: 'replace' });
                ErrorHandler.WriteError('SELECT SQL statement Error' + error.message, error);
            });
        } catch (error) {
            Actions.SignUp({ type: 'replace' });
            ErrorHandler.WriteError('serverSrv.js => login => transaction inner', error);
        }
    }, (error) => {
        Actions.SignUp({ type: 'replace' });
        ErrorHandler.WriteError('serverSrv.js => login => transaction', error);
    });
}

export function signUpFunc(newUser, callback) {
    try {
        // const bits = 256; //לשקול להגדיל בפרודקשן!
        // const exponent = '10001';
        // var rsa = new RSAKey();
        // rsa.generate(bits, exponent);
        // var publicKey = rsa.getPublicString(); // return json encoded string
        // var privateKey = rsa.getPrivateString(); // return json encoded string
        socket.emit('addNewUser', newUser, (user) => {
            // var rsa2 = new RSAKey();
            // rsa2.setPrivateString(privateKey);
            // var encryptedUid = rsa2.encrypt(user.id);

            db.transaction(function (tx) {
                tx.executeSql('INSERT INTO UserInfo VALUES (?,?,?,?)', [user.id, '', '', '']);
            }, (error) => {
                ErrorHandler.WriteError('signUp => addNewUser => transaction', error);
            }, function () {
            });
            if (callback) {
                callback(user.id);
            }
            // clsObj._loggingService.reConnectWithUid(encryptedUid, user.pkey);
            //clsObj.nav.push(TabsPage); //navigation
        });
    } catch (e) {
        ErrorHandler.WriteError('signUp', e);
    }
}
