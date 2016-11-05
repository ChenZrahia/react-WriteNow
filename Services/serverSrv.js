var React = require('react-native');
import { Actions } from 'react-native-router-flux';
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

export var socket = io('https://server-sagi-uziel.c9users.io:8080', { query: { encryptedUid: encryptedUid, publicKey: publicKey, uid: 'e2317111-a84a-4c70-b0e9-b54b910833fa' } });
var ErrorHandler = require('../ErrorHandler');
var SQLite = require('react-native-sqlite-storage')

function errorDB(error) {
    ErrorHandler.WriteError('SQL Error: ', error);
}

var db = SQLite.openDatabase({ name: 'WriteNow.db', location: 'default' }, null, errorDB);
var _isFirstTime_Friends = true;
var _isFirstTime_Chats = true;
var _isFirstTime_Conv = true;
var myChatsJson = {};
export var _myFriends = null;
export var _myFriendsJson = {};
export var _myChats = null;
export var _data = [];
export var _uid = null;
export var _myConvs = {};


function printTable(tblName) {
    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM ' + tblName, [], (tx, rs) => {
            console.log('---------------------------------------');
            for (var i = 0; i < rs.rows.length; i++) {
                console.log(rs.rows.item(i));
            }
            console.log('---------------------------------------');
        }, errorDB);
    });
}

setTimeout(function () {
    printTable('Messages');
}, 200);

export function DeleteDb() {
    db.transaction((tx) => {
        // tx.executeSql('DELETE FROM UserInfo', [], null, errorDB); //------------------
        // tx.executeSql('DELETE FROM Conversation', [], null, errorDB); //------------------
        // tx.executeSql('DELETE FROM Friends', [], null, errorDB); //------------------

        //tx.executeSql('DROP TABLE UserInfo', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Conversation', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Friends', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Messages', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Participates', [], null, errorDB); //------------------
    });
}

setTimeout(() => {
    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS UserInfo (uid, publicKey, privateKey, encryptedUid)', [], null, errorDB);
        tx.executeSql('CREATE TABLE IF NOT EXISTS Conversation (id PRIMARY KEY NOT NULL, isEncrypted, manager , groupName, groupPicture, isGroup, lastMessage, lastMessageTime)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Friends (id UNIQUE NOT NULL, phoneNumber UNIQUE, ModifyDate , ModifyPicDate, fullName, mail, picture, gender)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Messages (id PRIMARY KEY NOT NULL, convId, isEncrypted , msgFrom, content, sendTime , lastTypingTime, isSeenByAll)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Participates (convId NOT NULL, uid NOT NULL, isGroup, PRIMARY KEY (convId, uid))', [], null, errorDB);
    });
}, 100);

export function InitTabsDs(contactsCallback, chatsCallback) {
    try {

    } catch (error) {

    }
}

//Users
export function GetAllMyFriends(callback, isUpdate) {
    try {
        // if (_myFriends && callback && !isUpdate) {
        //     callback(_myFriends);
        //     return;
        // }
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Friends ORDER BY fullName', [], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        if (rs.rows.item(i).phoneNumber && rs.rows.item(i).phoneNumber.indexOf('544381795') >= 0) {
                        }
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
                        // if (_isFirstTime_Friends == true) {
                        //     _isFirstTime_Friends = false;
                        //     GetAllMyFriends_Server(callback);
                        // }
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

export function InsertMyContacts(contacts) {
    try {
        db.transaction((tx) => {
            tx.executeSql('SELECT phoneNumber FROM Friends', [], (tx, result) => {
                var f_phoneNumbers = [];
                for (let i = 0; i < result.rows.length; i++) {
                    f_phoneNumbers.push(result.rows.item(i).phoneNumber);
                }
                for (var i = 0; i < contacts.length; i++) {
                    if (contacts[i].phoneNumber && f_phoneNumbers.indexOf(contacts[i].phoneNumber) < 0) {
                        try {
                            f_phoneNumbers.push(contacts[i].phoneNumber);
                            tx.executeSql('INSERT INTO Friends VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                                [contacts[i].phoneNumber,
                                contacts[i].phoneNumber,
                                    '',
                                    '',
                                contacts[i].publicInfo.fullName,
                                    '',
                                contacts[i].publicInfo.picture,
                                    ''], null, (error) => { alert(error.message); console.log(error); });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                //---
                if (f_phoneNumbers.indexOf(contacts[i].phoneNumber) < 0) {
                }
            }, errorDB);

        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => InsertMyContacts => INSERT OR REPLACE INTO Friends', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => InsertMyContacts', error);
    }
}

export function GetAllMyFriends_Server(callback) {
    try {
        var friends = [];
        if (_myFriends) {
            friends = _myFriends;
        }
        let phonesArray = [];
        let friendUidArray = friends.map((friend) => {
            phonesArray.push(friend.phoneNumber);
            return friend.id;
        });
        var usersToServer = {
            phonesArray: phonesArray,
            friendUidArray: friendUidArray
        };
        socket.emit('GetMyFriendsChanges', usersToServer, ((data) => {
            db.transaction((tx) => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].deletedUser == true && data[i].id) {
                        //tx.executeSql('DELETE FROM Friends WHERE id=?', [data[i].id]);
                    } else {
                        tx.executeSql('DELETE FROM Friends WHERE id = ?', [data[i].phoneNumber]);
                        tx.executeSql('INSERT OR REPLACE INTO Friends VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [data[i].id,
                            data[i].phoneNumber,
                            data[i].ModifyDate,
                            data[i].ModifyPicDate,
                            data[i].publicInfo.fullName,
                            data[i].publicInfo.mail,
                            data[i].publicInfo.picture,
                            data[i].publicInfo.gender], null, (err) => { console.log(err); });
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
            tx.executeSql('SELECT * FROM Conversation ORDER BY lastMessageTime', [], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        var notificationRes;
                        if (_data) {
                            notificationRes = _data.filter(function (conv) {
                                return conv.id == rs.rows.item(i).id;
                            })
                            var _notifications = 0;
                            if (notificationRes.length > 0) {
                                _notifications = notificationRes[0].notifications;
                            }
                        }
                        var chat = {
                            id: rs.rows.item(i).id,
                            isEncrypted: rs.rows.item(i).isEncrypted,
                            manager: rs.rows.item(i).manager,
                            groupName: rs.rows.item(i).groupName,
                            groupPicture: rs.rows.item(i).groupPicture,
                            isGroup: rs.rows.item(i).isGroup,
                            lastMessage: rs.rows.item(i).lastMessage,
                            lastMessageTime: rs.rows.item(i).lastMessageTime,
                            notifications: _notifications
                        };
                        myChatsJson[rs.rows.item(i).id] = chat;
                        result.push(chat);
                    }

                    _myChats = result;
                    if (callback) {
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
                _data = data;
                GetAllUserConv(callback, data, true);
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
        // if (_myConvs && _myConvs[convId] && callback && !isUpdate) {
        //     callback(_myConvs[convId].messages);
        //     return;
        // }

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
                        _myConvs[convId].lastMessageTime = rs.rows.length > 0 ? rs.rows.item(0).sendTime : null;
                    } else {
                        _myConvs[convId] = {
                            convId: convId,
                            participates: [],
                            messages: result,
                            lastMessageTime: rs.rows.length > 0 ? rs.rows.item(0).sendTime : null
                        };
                    }
                    if (callback) {
                        callback(result, convId);
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
    try {
        var lastMessageTime = null;
        if (_myConvs && _myConvs[convId]) {
            lastMessageTime = _myConvs[convId].lastMessageTime; //last message time
        }
        socket.emit('enterChat', convId);
        socket.emit('GetConvChangesById', convId, lastMessageTime, ((data) => {
            if (!_myConvs[convId] || !_myConvs[convId].participates) {
                _myConvs[convId] = { participates: [] };
            }
            db.transaction((tx) => {
                for (var i = 0; i < data.participates.length; i++) {
                    try {
                        console.log(data.participates[i]);
                        console.log(_myFriendsJson[data.participates[i].id]);
                        data.participates[i].name = _myFriendsJson[data.participates[i].id].publicInfo.fullName;
                        data.participates[i].avatar = _myFriendsJson[data.participates[i].id].publicInfo.picture;
                        data.participates[i]._id = data.participates[i].id;
                        _myConvs[convId].participates[data.participates[i].id] = data.participates[i];
                        tx.executeSql('INSERT OR REPLACE INTO Participates VALUES (?, ?, ?)',
                            [data.participates[i].id,
                                convId,
                            data.participates.length > 2
                            ]);
                    } catch (error) {
                        console.log(error);
                    }
                }
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

export function GetConvByContact(callback, uid, phoneNumber, fullName, isUpdate) {
    try {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Participates WHERE uid = ? AND isGroup = ?', [uid, false], (tx, rs) => {
                try {
                    if (rs.rows.length > 0) {
                        GetConv(callback, rs.rows.item(0).convId, true);
                    } else {
                        socket.removeAllListeners("returnConv");
                        socket.on('returnConv', (result) => {
                            try {
                                var Fid = result.participates.filter((usr) => {
                                    return usr.id != result.manager;
                                })[0].id;
                                if (!_myFriendsJson[Fid] && _myFriendsJson[phoneNumber]) {
                                    _myFriendsJson[Fid] = _myFriendsJson[phoneNumber];
                                }
                                _myFriendsJson[Fid].id = Fid;
                                _myFriendsJson[Fid]._id = Fid;
                                db.transaction((tx2) => {
                                    tx2.executeSql('INSERT OR REPLACE into Conversation values(?,?,?,?,?,?,?,?)', [result.id.toString(), false, result.manager, _myFriendsJson[Fid].publicInfo.fullName, _myFriendsJson[Fid].publicInfo.picture, false]);
                                    tx2.executeSql('INSERT OR REPLACE into Participates values(?,?,?)', [result.id.toString(), Fid.toString(), false]);
                                    tx2.executeSql('UPDATE Friends set id = ? WHERE phoneNumber = ?', [Fid.toString(), phoneNumber.toString()]);
                                });
                                GetConv(callback, result.id, true);
                            } catch (error) {
                                ErrorHandler.WriteError('serverSrv.js => GetConvByContact => returnConv', error);
                            }
                        });
                        socket.emit('GetConvByContact', phoneNumber, fullName);
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => GetConvByContact => SELECT * FROM Participates => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => GetConvByContact => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetConvByContact', error);
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
        _isFirstTime_Conv = true;
        socket.removeAllListeners("typing");
        socket.on('typing', (msg) => {
            callback(msg);
            if (msg.sendTime && msg.from != _uid) {
                this.saveNewMessage(msg);
            }
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => onServerTyping' + error.message, error);
    }
}

export function saveNewMessage(msg) {
    try {
        db.transaction((tx) => {
            tx.executeSql('INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [msg.id,
                msg.convId,
                msg.isEncrypted,
                msg.from,
                msg.content,
                msg.sendTime.toString(),
                msg.lastTypingTime,
                msg.isSeenByAll
                ]);
        });
        socket.emit('saveMessage', msg);
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => saveNewMessage' + error.message, error);
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
                    //_uid = 'e2317111-a84a-4c70-b0e9-b54b910833fa';  //-------------------For Test Only
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

                    socket.disconnect();
                    socket = io.connect('https://server-sagi-uziel.c9users.io:8080', { query: { encryptedUid: encryptedUid, publicKey: item.publicKey, uid: _uid } });

                    socket.removeAllListeners("AuthenticationOk");

                    // socket.on('AuthenticationOk', (ok) => {
                    //     try {
                    //         Actions.Tabs();
                    //     } catch (e) {
                    //         Actions.SignUp({ type: 'replace' });
                    //         ErrorHandler.WriteError('EnterPage constructor => AuthenticationOk', error);
                    //     }
                    // });
                }
                else {
                    try {
                        socket = io.connect('https://server-sagi-uziel.c9users.io:8080');
                        Actions.SignUp({ type: 'replace' });
                    } catch (error) {
                        console.log(error);
                    }
                }
            }, (error) => {
                Actions.SignUp({ type: 'replace' });
                ErrorHandler.WriteError('SELECT SQL statement Error' + error.message, error);
            });
            //655aef47-21ee-4d69-8311-6cc09460da13

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
                console.log(user.id,'---', newUser.phoneNumber);
                tx.executeSql('INSERT INTO Friends VALUES (?,?,?,?,?,?,?,?)', [user.id, newUser.phoneNumber, newUser.ModifyDate, newUser.ModifyPicDate, newUser.publicInfo.fullName, newUser.publicInfo.mail, newUser.publicInfo.picture, newUser.publicInfo.gender]);
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
