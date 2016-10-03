var React = require('react-native');

//import React from 'react-native';
import './UserAgent';
import io from 'socket.io-client/socket.io';
//import ReactNativeRSAUtil from 'react-native-rsa-util';
//var ReactNativeRSAUtil = require('react-native-rsa-util');
//--------for dev mode only-----------//
var encryptedUid = 'UIP5n4v1jj24a+dHq6L/QqLwDFtPnSoebPzUe5+DWKOQ+rj5boKTAI6goMgySXHDj4BRMOa16wNV743D3/5WfRlXPrizY6nvi3XEmg/oPQvmNLlchDDjqZpQW8nfAS3IH9jZwDqFjxMKVkMau1SOLJxMroz7hTKVH7gOCGLHzik=';
var publicKey = `-----BEGIN PUBLIC KEY-----
        MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAInhtN7l9IVl0BqKC+yav4KrB09XtICc
            B3nfrzvfLZBCmXKkS5GYg/xzIx5BbsfVSKOKXzCcnlIhWUssanrDiW8CAwEAAQ==
            -----END PUBLIC KEY-----`;
//--------for dev mode only-----------//

// var ReactNativeRSAUtil = React.NativeModules.ReactNativeRSAUtil;

// console.log('ReactNativeRSAUtil');
// console.log(React.NativeModules);

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

//  db.transaction((tx) => {
//             tx.executeSql('DROP TABLE Conversation', [], null, errorDB); //------------------
//             tx.executeSql('DROP TABLE participates', [], null, errorDB); //------------------
//  });

//Users
export function GetAllMyFriends(callback, isUpdate) {
    try {
        if (_myFriends && callback && !isUpdate) {
            callback(_myFriends);
            return;
        }
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS Friends (id PRIMARY KEY NOT NULL, phoneNumber, ModifyDate , ModifyPicDate, fullName, mail, picture, gender)', [], null, errorDB); //להוציא לפונקציה נפרדת
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
            tx.executeSql('CREATE TABLE IF NOT EXISTS Conversation (id PRIMARY KEY NOT NULL, isEncrypted, manager , groupName, groupPicture, isGroup)', [], null, errorDB); //להוציא לפונקציה נפרדת
            tx.executeSql('CREATE TABLE IF NOT EXISTS participates (convId NOT NULL, id NOT NULL, phoneNumber, ModifyDate , ModifyPicDate, fullName, mail, picture, gender)', [], null, errorDB); //להוציא לפונקציה נפרדת
            tx.executeSql('SELECT * FROM Conversation', [], (tx, rs) => {
                try {
                    var result = [];
                    var indexes = {};
                    var countOfConvs = 0;
                    for (var i = 0; i < rs.rows.length; i++) {
                        result.push({
                            id: rs.rows.item(i).id,
                            isEncrypted: rs.rows.item(i).isEncrypted,
                            manager: rs.rows.item(i).manager,
                            groupName: rs.rows.item(i).groupName,
                            groupPicture: rs.rows.item(i).groupPicture,
                            isGroup: rs.rows.item(i).isGroup,
                            participates: [] //לעשות בדיקה אם בשרת נוספו משתתפים לשיחה. לשלוח גייסון של קוד שיחה וקוד משתתפים (מערך)
                        });
                        if (!indexes[rs.rows.item(i).id]) {
                            indexes[rs.rows.item(i).id] = i;
                        }
                        tx.executeSql('SELECT * FROM participates WHERE convId = ?', [rs.rows.item(i).id], ((tx, p_rs) => {
                            countOfConvs++;
                            for (var j = 0; j < p_rs.rows.length; j++) {
                                try {
                                    var index = indexes[p_rs.rows.item(j).convId];
                                    result[index].participates.push({
                                        id: p_rs.rows.item(j).id,
                                        phoneNumber: p_rs.rows.item(j).phoneNumber,
                                        ModifyDate: p_rs.rows.item(j).ModifyDate,
                                        ModifyPicDate: p_rs.rows.item(j).ModifyPicDate,
                                        publicInfo: {
                                            fullName: p_rs.rows.item(j).fullName,
                                            mail: p_rs.rows.item(j).mail,
                                            picture: p_rs.rows.item(j).picture,
                                            gender: p_rs.rows.item(j).gender
                                        }
                                    });
                                } catch (error) {
                                    ErrorHandler.WriteError('serverSrv.js => SELECT * FROM participates => catch', error);
                                }
                            }
                            if (countOfConvs == result.length && callback) {
                                callback(result);
                                if (_isFirstTime_Chats == true) {
                                    _isFirstTime_Chats = false;
                                    GetAllUserConv_Server(callback);
                                }
                            }
                            _myChats = result;

                        }), errorDB);
                    }
                    if (_isFirstTime_Chats == true && rs.rows.length == 0) {
                        _isFirstTime_Chats = false;
                        GetAllUserConv_Server(callback);
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
        console.log('GetAllUserConvChanges');
        var chats = [];
        if (_myChats) {
            chats = _myChats;
        }
        let convIdArray = chats.map((chat) => { return chat.id; });
        console.log('12345345');
        socket.emit('GetAllUserConvChanges', convIdArray, ((data) => {
            db.transaction((tx) => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].deletedConv == true && data[i].id) {
                        tx.executeSql('DELETE FROM Conversation WHERE id=?', [data[i].id]);
                        tx.executeSql('DELETE FROM participates WHERE convId=?', [data[i].id]);
                    } else {
                        tx.executeSql('INSERT INTO Conversation VALUES (?, ?, ?, ?, ?, ?)',
                            [data[i].id,
                                data[i].isEncrypted,
                                data[i].manager,
                                data[i].groupName,
                                data[i].groupPicture,
                                data[i].isGroup]);

                        for (var j = 0; j < data[i].participates.length; j++) {
                            tx.executeSql('INSERT INTO participates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [data[i].id,
                                    data[i].participates[j].id,
                                    data[i].participates[j].phoneNumber,
                                    data[i].participates[j].ModifyDate,
                                    data[i].participates[j].ModifyPicDate,
                                    data[i].participates[j].publicInfo.fullName,
                                    data[i].participates[j].publicInfo.mail,
                                    data[i].participates[j].publicInfo.picture,
                                    data[i].participates[j].publicInfo.gender]);
                        }
                    }
                }
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
export function login(callback) {
    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM UserInfo', [], (tx, rs) => {
            if (rs.rows.length > 0 || true) {
                var item = rs.rows.item(rs.rows.length - 1);
                _uid = item.uid;

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
                        ErrorHandler.WriteError('EnterPage constructor => AuthenticationOk', error);
                    }
                });
            }
            else {
                // _zone.run(() => {nav.push(SignUp);});
            }
        }, (error) => {
            // _zone.run(() => {nav.push(SignUp);});
            ErrorHandler.WriteError('SELECT SQL statement Error' + error.message, error);
        });
    }, (error) => {
        ErrorHandler.WriteError('serverSrv.js => login => transaction', error);
    });
}

var e = 'e2317111-a84a-4c70-b0e9-b54b910833fa';

setTimeout(() => {
    //var key = new ReactNativeRSAUtil();
    // ReactNativeRSAUtil.decryptStringWithPublicKey(encryptedUid, publicKey).then((error, data) => {
    //     if ( !error ) {
    //         console.log(data);
    //     }
    // });
}, 1000);