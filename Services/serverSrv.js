var React = require('react-native');
import {Actions} from 'react-native-router-flux';
//import React from 'react-native';
import './UserAgent';
import io from 'socket.io-client/socket.io';
// var RSAKey = require('react-native-rsa');
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
var _isFirstTime_Conv = true;
var _isAppOpen = true;
var myChatsJson = {};
export var _myFriends = null;
export var _myFriendsJson = {};
export var _myChats = null;
export var _uid = null;
export var _myConvs = {};


export function DeleteDb() {
    db.transaction((tx) => {
        //tx.executeSql('DELETE FROM UserInfo', [], null, errorDB); //------------------
        //tx.executeSql('DELETE FROM Conversation', [], null, errorDB); //------------------
        //tx.executeSql('DELETE FROM Friends', [], null, errorDB); //------------------

        //tx.executeSql('DROP TABLE UserInfo', [], null, errorDB); //------------------
        //  tx.executeSql('DROP TABLE Conversation', [], null, errorDB); //------------------
        // tx.executeSql('DROP TABLE Friends', [], null, errorDB); //------------------
    });
}

setTimeout(() => {
    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS UserInfo (uid, publicKey, privateKey, encryptedUid)', [], null, errorDB); //פונקציה חיצונית
        tx.executeSql('CREATE TABLE IF NOT EXISTS Conversation (id PRIMARY KEY NOT NULL, isEncrypted, manager , groupName, groupPicture, isGroup, lastMessage, lastMessageTime)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Friends (id PRIMARY KEY NOT NULL, phoneNumber, ModifyDate , ModifyPicDate, fullName, mail, picture, gender)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Messages (id PRIMARY KEY NOT NULL, convId, isEncrypted , msgFrom, content, sendTime, lastTypingTime, isSeenByAll)', [], null, errorDB); //להוציא לפונקציה נפרדת
        // tx.executeSql('DELETE FROM Conversation', [], null, errorDB); //------------------
    });
}, 500);

//Users
export function GetAllMyFriends(callback, isUpdate) {
    try {
        if (_myFriends && callback && !isUpdate) {
            callback(_myFriends);
            return;
        }
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Friends ORDER BY fullName', [], (tx, rs) => {
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
                        _myFriendsJson[rs.rows.item(i).id] = {
                            id: rs.rows.item(i).id,
                            _id: rs.rows.item(i).id,
                            name: rs.rows.item(i).fullName,
                            avatar: rs.rows.item(i).picture,
                            phoneNumber: rs.rows.item(i).phoneNumber,
                            ModifyDate: rs.rows.item(i).ModifyDate,
                            ModifyPicDate: rs.rows.item(i).ModifyPicDate,
                            publicInfo: {
                                fullName: rs.rows.item(i).fullName,
                                mail: rs.rows.item(i).mail,
                                picture: rs.rows.item(i).picture,
                                gender: rs.rows.item(i).gender
                            }
                        }
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
    console.log(new Date());
    try {
        if (_myChats && callback && !isUpdate) {
            callback(_myChats);
            return;
        }
        console.log(new Date());
        db.transaction((tx) => {
            console.log(new Date());
            db.executeSql('SELECT * FROM Conversation ORDER BY lastMessageTime', [], (tx, rs) => {
                try {
                    var result = [];
                    console.log(new Date());
                    for (var i = 0; i < rs.rows.length; i++) {
                        var chat = {
                            id: rs.rows.item(i).id,
                            isEncrypted: rs.rows.item(i).isEncrypted,
                            manager: rs.rows.item(i).manager,
                            groupName: rs.rows.item(i).groupName,
                            groupPicture: rs.rows.item(i).groupPicture,
                            isGroup: rs.rows.item(i).isGroup,
                            lastMessage: rs.rows.item(i).lastMessage,
                            lastMessageTime: rs.rows.item(i).lastMessageTime
                        };
                        myChatsJson[rs.rows.item(i).id] = chat;
                        result.push(chat);
                    }
                    console.log(new Date());
                    _myChats = result;
                    if (callback) {
                        console.log(new Date());
                        callback(result);
                        if (_isFirstTime_Chats == true) {
                            _isFirstTime_Chats = false;
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
                    } else if (data[i].isExist == true) {
                        tx.executeSql(' UPDATE Conversation ' +
                            ' set isEncrypted = ?, ' +
                            ' manager = ?, ' +
                            ' groupName = ?, ' +
                            ' lastMessage = ?,' +
                            ' lastMessageTime = ? ' +
                            ' WHERE id = ? ', [data[i].isEncrypted, data[i].manager, data[i].groupName, data[i].lastMessage, data[i].lastMessageTime, data[i].id], null, errorDB);
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
                GetAllUserConv(callback, true);
            }, (error) => {
                ErrorHandler.WriteError('serverSrv.js => GetAllUserConv_Server => GetAllUserConvChanges', error);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllUserConv_Server', error);
    }
}

//ChatRoom
export function GetConv(callback, convId, isUpdate) {
    try {
        if (_myConvs && _myConvs[convId] && callback && !isUpdate) {
            callback(_myConvs[convId].messages);
            return;
        }

        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Messages WHERE convId = ? AND content IS NOT NULL ORDER BY sendTime DESC', [convId], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        var chat = {
                            id: rs.rows.item(i).id,
                            _id: rs.rows.item(i).id,
                            isEncrypted: rs.rows.item(i).isEncrypted,
                            from: rs.rows.item(i).msgFrom,
                            text: rs.rows.item(i).content,
                            sendTime: rs.rows.item(i).sendTime,
                            createdAt: rs.rows.item(i).sendTime,
                            lastTypingTime: rs.rows.item(i).lastTypingTime,
                            isSeenByAll: rs.rows.item(i).isSeenByAll,
                            user: _myFriendsJson[rs.rows.item(i).msgFrom] ? _myFriendsJson[rs.rows.item(i).msgFrom] : { name: '' } //myUser
                        };
                        myChatsJson[rs.rows.item(i).id] = chat;
                        result.push(chat);
                    }

                    if (_myConvs[convId]) {
                        _myConvs[convId].messages = result;
                    } else {
                        _myConvs[convId] = {
                            convId: convId,
                            participates: [],
                            messages: result
                        };
                    }
                    if (callback) {
                        callback(result);
                        if (_isFirstTime_Conv == true) {
                            _isFirstTime_Conv = false;
                            GetConv_server(convId, callback);
                        }
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => SELECT * FROM Messages => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => GetConv => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetConv', error);
    }
}

function GetConv_server(convId, callback) {
    // socket.removeAllListeners("returnConv");
    // socket.on('returnConv', (result) => {
    //     try {
    //         convId = result.id;
    //         messages = result.messages;

    //         socket.emit('enterChat', convId);
    //         for (var i = 0; i < result.participates.length; i++) {
    //             participates[result.participates[i].id] = result.participates[i];
    //         }
    //     } catch (e) {
    //         ErrorHandler.WriteError('constructor => returnConv', e);
    //     }
    // });
    try {
        var lastMessageTime = null;
        if (_myConvs && _myConvs[convId] && _myConvs[convId].messages && _myConvs[convId].messages.length > 0) {
            lastMessageTime = _myConvs[convId].messages[_myConvs[convId].messages.length - 1].sendTime; //last message
        }
        socket.emit('enterChat', convId);
        socket.emit('GetConvChangesById', convId, lastMessageTime, ((data) => {
            socket.emit('enterChat', convId);
            if (!_myConvs[convId] || !_myConvs[convId].participates) {
                _myConvs[convId] = { participates: [] };
            }
            for (var i = 0; i < data.participates.length; i++) {  ///-------------------///-------------------///-------------------///-------------------///-------------------
                data.participates[i].name = data.participates[i].publicInfo.fullName;
                data.participates[i].avatar = data.participates[i].publicInfo.picture;
                data.participates[i]._id = data.participates[i].id;
                _myConvs[convId].participates[data.participates[i].id] = data.participates[i];
            }
            db.transaction((tx) => {
                for (var i = 0; i < data.messages.length; i++) {
                    if (data.messages[i].deletedConv == true && data.messages[i].id) {
                        tx.executeSql('DELETE FROM Messages WHERE id=?', [data.messages[i].id]);
                    } else {
                        tx.executeSql('INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [data.messages[i].id,
                                data.messages[i].convId,
                                data.messages[i].isEncrypted,
                                data.messages[i].from,
                                data.messages[i].content,
                                data.messages[i].sendTime,
                                data.messages[i].lastTypingTime,
                                data.messages[i].isSeenByAll
                            ]);
                    }
                }
                GetConv(callback, convId, true);
            }, (error) => {
                ErrorHandler.WriteError('serverSrv.js => GetConv_server => GetConvChangesById', error);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetConv_server', error);
    }
}

export function Typing(msg) {
    try {
        msg.from = _uid;
        socket.emit('typing', msg);
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => Typing' + error.message, error);
    }
}

export function onServerTyping(callback) {
    try {
        socket.removeAllListeners("typing");
        socket.on('typing', (msg) => {
            callback(msg);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => onServerTyping' + error.message, error);
    }
}

//connect  login
export function login() {
    db.transaction((tx) => {
        try {
            tx.executeSql('SELECT * FROM UserInfo', [], (tx, rs) => {
                if (rs.rows.length > 0) {
                    var item = rs.rows.item(rs.rows.length - 1 && false);
                    _uid = item.uid;
                    //Actions.Tabs();

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
