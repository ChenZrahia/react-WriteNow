var React = require('react-native');
import { Actions } from 'react-native-router-flux';
//import React from 'react-native';
import './UserAgent';
//import io from 'socket.io-client/socket.io';


import io from 'socket.io-client/dist/socket.io';
import ImageResizer from 'react-native-image-resizer';
import {
    Image,
    StyleSheet,
    View,
    TouchableOpacity,
    Modal,
} from 'react-native';
var Event = require('./Events');
var SignUp = require('../src/SignUp/SignUp');
var moment = require('moment');
var RSAKey = require('react-native-rsa');

//--------for dev mode only-----------//
var encryptedUid = 'UIP5n4v1jj24a+dHq6L/QqLwDFtPnSoebPzUe5+DWKOQ+rj5boKTAI6goMgySXHDj4BRMOa16wNV743D3/5WfRlXPrizY6nvi3XEmg/oPQvmNLlchDDjqZpQW8nfAS3IH9jZwDqFjxMKVkMau1SOLJxMroz7hTKVH7gOCGLHzik=';
var publicKey = `-----BEGIN PUBLIC KEY-----
        MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAInhtN7l9IVl0BqKC+yav4KrB09XtICc
            B3nfrzvfLZBCmXKkS5GYg/xzIx5BbsfVSKOKXzCcnlIhWUssanrDiW8CAwEAAQ==
            -----END PUBLIC KEY-----`;
//--------for dev mode only-----------//

// var ReactNativeRSAUtil = React.NativeModules.ReactNativeRSAUtil;

export var socket = io.connect('https://server-sagi-uziel.c9users.io:8080', {});
var ErrorHandler = require('../ErrorHandler');
var SQLite = require('react-native-sqlite-storage')


/*var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");*/


function errorDB(error) {
    ErrorHandler.WriteError('SQL Error: ', error);
}

var db = SQLite.openDatabase({ name: 'WriteNow.db', location: 'default' }, null, errorDB);
var _isFirstTime_Friends = true;
var _isFirstTime_Chats = true;
var _isFirstTime_Conv = true;
var myChatsJson = {};
var userIsConnected = false;
var _ActiveConvId = '';
export var _myFriends = null;
export var _myFriendsJson = {};
export var _myChats = null;
export var _data = [];
export var _uid = null;
export var _myConvs = {};
export var _myFriendPublicKey = null;
export var _hashPassword = null;
export var _token = '';
export var _privateKey = '';
export var _isCallMode = false;

function printTable(tblName) {
    db.transaction((tx) => {
        // tx.executeSql('SELECT * FROM UserInfo', [], (tx, rs) => {
        //     console.log('---------------------------------------');
        //     for (var i = 0; i < rs.rows.length; i++) {
        //         console.log(rs.rows.item(i));
        //     }
        //     console.log('---------------------------------------');
        // }, errorDB);
        tx.executeSql('SELECT * FROM Messages', [], (tx, rs) => {
            console.log('---------------------------------------');
            for (var i = 0; i < rs.rows.length; i++) {
                console.log(rs.rows.item(i));
            }
            console.log('---------------------------------------');
        }, errorDB);

    });
}

setTimeout(function () {
    //printTable('Messages');
}, 500);

export function DeleteDb() {
    db.transaction((tx) => {
        tx.executeSql('DELETE FROM Conversation', [], null, errorDB); //------------------
        tx.executeSql('DELETE FROM Friends', [], null, errorDB); //------------------
        tx.executeSql('DELETE FROM Messages', [], null, errorDB); //------------------
        tx.executeSql('DELETE FROM Participates', [], null, errorDB); //------------------


        tx.executeSql('DROP TABLE UserInfo', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Conversation', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Friends', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Messages', [], null, errorDB); //------------------
        tx.executeSql('DROP TABLE Participates', [], null, errorDB); //------------------

        tx.executeSql('CREATE TABLE IF NOT EXISTS UserInfo (uid, publicKey, privateKey, encryptedUid,password)', [], null, errorDB);
        tx.executeSql('CREATE TABLE IF NOT EXISTS Conversation (id PRIMARY KEY NOT NULL, isEncrypted, manager , groupName, groupPicture, isGroup, lastMessage, lastMessageTime, lastMessageEncrypted)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Friends (id UNIQUE NOT NULL, phoneNumber UNIQUE, ModifyDate , ModifyPicDate, fullName, picture, isMyContact)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Messages (id PRIMARY KEY NOT NULL, convId, isEncrypted , msgFrom, content, sendTime , lastTypingTime, isSeenByAll, image)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Participates (convId NOT NULL, uid NOT NULL, isGroup, PRIMARY KEY (convId, uid))', [], null, errorDB);
    });
}

setTimeout(() => {
    db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS UserInfo (uid, publicKey, privateKey, encryptedUid,password)', [], null, errorDB);
        tx.executeSql('CREATE TABLE IF NOT EXISTS Conversation (id PRIMARY KEY NOT NULL, isEncrypted, manager , groupName, groupPicture, isGroup, lastMessage, lastMessageTime, lastMessageEncrypted)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Friends (id UNIQUE NOT NULL, phoneNumber UNIQUE, ModifyDate , ModifyPicDate, fullName, picture, isMyContact)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Messages (id PRIMARY KEY NOT NULL, convId, isEncrypted , msgFrom, content, sendTime , lastTypingTime, isSeenByAll, image)', [], null, errorDB); //להוציא לפונקציה נפרדת
        tx.executeSql('CREATE TABLE IF NOT EXISTS Participates (convId NOT NULL, uid NOT NULL, isGroup, PRIMARY KEY (convId, uid))', [], null, errorDB);
    });
}, 100);

//Users
//   function setImageVisible(visible) {
//         try {
//             this.setState({ imageVisible: visible });
//         } catch (e) {
//             ErrorHandler.WriteError('MessageImage.js => setImageVisible', e);
//         }
//     }
// export function openImageModal(image) {
//         try {
//             return (
//                 <Modal
//                     transparent={true}
//                     visible={this.state.imageVisible == true}
//                     onRequestClose={() => { console.log('image closed') } }
//                     >
//                     <TouchableOpacity style={{ flex: 1 }} onPress={() => {
//                         this.setImageVisible(!this.state.imageVisible)
//                     } }>
//                         <View style={generalStyles.styles.imageModal}>
//                             <Image style={generalStyles.styles.imageInsideModal} source={{uri: image}} />
//                         </View>
//                     </TouchableOpacity>
//                 </Modal>
//             );
//         } catch (e) {
//             ErrorHandler.WriteError('serverSrv.js => openImageModal', e);
//         }


//     }

export function GetAllMyFriends(callback, isUpdate) {
    try {
        if (_myFriends && _myFriends.length > 0 && callback && !isUpdate) {
            callback(_myFriends);
            return;
        }
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Friends ORDER BY fullName', [], (tx, rs) => {
                try {
                    var finalResult = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        if (rs.rows.item(i).id != this._uid) {
                            finalResult.push({
                                id: rs.rows.item(i).id,
                                phoneNumber: rs.rows.item(i).phoneNumber,
                                ModifyDate: rs.rows.item(i).ModifyDate,
                                ModifyPicDate: rs.rows.item(i).ModifyPicDate,
                                publicInfo: {
                                    fullName: rs.rows.item(i).fullName,
                                    picture: rs.rows.item(i).picture
                                }
                            });
                        }
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
                                picture: rs.rows.item(i).picture
                            }
                        }
                    }
                    _myFriends = finalResult;
                    if (callback) {
                        callback(finalResult);
                        if (_isFirstTime_Friends == true) {
                            _isFirstTime_Friends = false;
                            setTimeout(() => {
                                GetAllMyFriends_Server(callback);
                            }, 100);

                        }
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends => SELECT * FROM Friends => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends', error);
    }
}

export function InsertMyContacts(contacts, isMyContact, convId) {
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
                            var newId = '';
                            if (contacts[i].id) {
                                newId = contacts[i].id;
                            } else {
                                newId = contacts[i].phoneNumber;
                            }
                            if (convId && _myConvs[convId]) {
                                contacts[i].name = contacts[i].publicInfo.fullName;
                                contacts[i].avatar = contacts[i].publicInfo.picture;
                                contacts[i]._id = contacts[i].id;
                                _myConvs[convId].participates[contacts[i].id] = contacts[i];
                                if (!_myFriendsJson[contacts[i].id]) {
                                    _myFriendsJson[contacts[i].id] = contacts[i];
                                    //_myFriends.push(contacts[i]);
                                }
                                tx.executeSql('INSERT OR REPLACE INTO Participates VALUES (?, ?, ?)',
                                    [contacts[i].id,
                                        convId,
                                    _myConvs[convId].participates.length > 2
                                    ]);
                            }
                            tx.executeSql('INSERT INTO Friends VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [newId,
                                    contacts[i].phoneNumber,
                                    '',
                                    '',
                                    contacts[i].publicInfo.fullName,
                                    contacts[i].publicInfo.picture,
                                    isMyContact]);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                Event.trigger('updateFriends', true);
            }, errorDB);

        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => InsertMyContacts => INSERT OR REPLACE INTO Friends', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => InsertMyContacts', error);
    }
}

export function getAllPhoneNumbers(callback) {
    try {
        db.transaction((tx) => {
            tx.executeSql('SELECT phoneNumber FROM Friends', [], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        result.push(rs.rows.item(i).phoneNumber);
                    }
                    callback(result);
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => getAllPhoneNumbers => SELECT * FROM Friends => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => getAllPhoneNumbers => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => getAllPhoneNumbers', error);
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
                try {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].deletedUser == true && data[i].id) {
                            //tx.executeSql('DELETE FROM Friends WHERE id=?', [data[i].id]);
                        } else {
                            tx.executeSql('DELETE FROM Friends WHERE id = ?', [data[i].phoneNumber]);
                            tx.executeSql('INSERT OR REPLACE INTO Friends VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [data[i].id,
                                data[i].phoneNumber,
                                data[i].ModifyDate,
                                data[i].ModifyPicDate,
                                data[i].publicInfo.fullName,
                                data[i].publicInfo.picture,
                                    true]);
                        }
                    }
                    GetAllMyFriends(callback, true);
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server => GetMyFriendsChanges => transaction', error);
                }
            }, (error) => {
                ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server => GetMyFriendsChanges', error);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server', error);
    }
}

//Conversation
var testMode = false;
export function GetAllUserConv(callback, isUpdate) {
    try {
        if (testMode == true) {
            GetAllUserConv_Server(callback); 
            return;
        } 
        if (isUpdate == true) {
            _isFirstTime_Chats = true;
        }
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Conversation ORDER BY lastMessageTime DESC', [], (tx, rs) => {
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
                            lastMessageEncrypted: rs.rows.item(i).lastMessageEncrypted,
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
        if (testMode == true) {
            convIdArray = [];
        }
        socket.emit('GetAllUserConvChanges', convIdArray, ((data) => {
                if (testMode == true) {
                    callback(data);
                    return;
                } else{
                    console.log('data', testMode);
                }
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
                            ' lastMessageTime = ?, ' +
                            ' lastMessageEncrypted = ? ' +
                            ' WHERE id = ? ', [data[i].isEncrypted, data[i].manager, data[i].groupName, data[i].lastMessage, data[i].lastMessageTime, data[i].lastMessageEncrypted, data[i].id], null, errorDB);
                    } else {
                        tx.executeSql('INSERT INTO Conversation VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [data[i].id,
                            data[i].isEncrypted,
                            data[i].manager,
                            data[i].groupName,
                            data[i].groupPicture,
                            data[i].isGroup,
                            data[i].lastMessage,
                            data[i].lastMessageTime,
                            data[i].lastMessageEncrypted,
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

//liveCall
export function enterChatCall(convId) {
    try {
        socket.emit('enterChatCall', convId);
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => enterChatCall', error);
    }
}

export function exitChatCall(convId) {
    try {
        socket.emit('exitChatCall', convId);
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => exitChatCall', error);
    }
}

export function exitChatCall_server(callback) {
    try {
        socket.removeAllListeners("enterChatCall");
        socket.on('exitChatCall_server', callback);
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => exitChatCall_server', error);
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
            tx.executeSql('SELECT * FROM Messages WHERE convId = ? AND (content IS NOT NULL OR image IS NOT NULL) ORDER BY sendTime DESC', [convId], (tx, rs) => {
                try {
                    var result = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        var _user = {};
                        if (_myFriendsJson[rs.rows.item(i).msgFrom]) {
                            _user = {
                                _id: _myFriendsJson[rs.rows.item(i).msgFrom].id,
                                name: _myFriendsJson[rs.rows.item(i).msgFrom].publicInfo.fullName
                            };
                        } else {
                            _user = { name: 'ERROR' };
                        }
                        var chat = {
                            id: rs.rows.item(i).id,
                            _id: rs.rows.item(i).id,
                            isEncrypted: rs.rows.item(i).isEncrypted,
                            from: rs.rows.item(i).msgFrom,
                            text: rs.rows.item(i).content,
                            image: rs.rows.item(i).image,
                            sendTime: rs.rows.item(i).sendTime,
                            createdAt: rs.rows.item(i).sendTime,
                            lastTypingTime: rs.rows.item(i).lastTypingTime,
                            isSeenByAll: rs.rows.item(i).isSeenByAll,
                            user: _user
                            //_myFriendsJson[rs.rows.item(i).msgFrom] ? { _id: _myFriendsJson[rs.rows.item(i).id], name: _myFriendsJson[rs.rows.item(i).publicInfo.fullName } , { name: 'ERROR' }
                            //user: _myFriendsJson[rs.rows.item(i).msgFrom] ? _myFriendsJson[rs.rows.item(i).msgFrom] : { name: 'ERROR' } //myUser
                        };
                        if (chat.user.name == "ERROR") {
                            console.log(rs.rows.item(i).msgFrom);
                            console.log('_myFriendsJson[k].id');
                        }
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

function InsertNewContact(tx, user) {
    try {
        var imgOrPath = user.image;
        if (user.imgPath) {
            imgOrPath = user.imgPath;
        }
        tx.executeSql('INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user.id,
            user.convId,
            user.isEncrypted,
            user.from,
            user.content,
            user.sendTime,
            user.lastTypingTime,
            user.isSeenByAll,
                imgOrPath
            ]);
        tx.executeSql('UPDATE Conversation SET lastMessage = ?, lastMessageTime = ?, lastMessageEncrypted = ? WHERE id = ? AND lastMessageTime < ?',
            [user.content,
            user.sendTime,
            user.convId,
            user.sendTime,
            user.lastMessageEncrypted
            ]);
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => InsertNewContact', error);
    }
}

function GetConv_server(convId, callback) {
    try {
        var lastMessageTime = null;
        var newParticipates = [];
        if (_myConvs && _myConvs[convId]) {
            lastMessageTime = _myConvs[convId].lastMessageTime; //last message time
        }
        socket.emit('enterChat', convId);
        socket.emit('GetConvChangesById', convId, lastMessageTime, ((data) => {
            var result = data.participates.filter((user)=>{ return user.id != _uid;});
          
            if (result.length > 0) {
                 _myFriendPublicKey = result[0].pkey
            }
       
            if (!_myConvs[convId] || !_myConvs[convId].participates) {
                _myConvs[convId] = { participates: [] };
            }
            db.transaction((tx) => {
                for (var i = 0; i < data.participates.length; i++) {
                    try {
                        if (!_myFriendsJson[data.participates]) {
                            newParticipates.push(data.participates[i].id);
                        } else {
                            data.participates[i].name = _myFriendsJson[data.participates[i].id].publicInfo.fullName;
                            //data.participates[i].avatar = _myFriendsJson[data.participates[i].id].publicInfo.picture;
                            data.participates[i]._id = data.participates[i].id;
                            _myConvs[convId].participates[data.participates[i].id] = data.participates[i];
                            tx.executeSql('INSERT OR REPLACE INTO Participates VALUES (?, ?, ?)',
                                [data.participates[i].id,
                                    convId,
                                data.participates.length > 2
                                ]);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                if (newParticipates.length > 0) {
                    socket.emit('getUsers', newParticipates, (result) => {
                        InsertMyContacts(result, false, convId);
                    });
                }
                for (var i = 0; i < data.messages.length; i++) {
                    if (data.messages[i].deletedConv == true && data.messages[i].id) {
                        tx.executeSql('DELETE FROM Messages WHERE id=?', [data.messages[i].id]);
                    } else {
                        if (data.messages[i].image) {
                            ImageResizer.createResizedImage(data.messages[i].image, 400, 400, 'JPEG', 100, 0, null).then((function (obj) {
                                return (resizedImageUri) => {
                                    obj.imgPath = resizedImageUri;
                                    InsertNewContact(tx, obj);
                                }
                            })(data.messages[i])).catch((err) => {
                                ErrorHandler.WriteError('serverSrv.js => onServerTyping => ImageResizer', err);
                            });
                        } else {
                            InsertNewContact(tx, data.messages[i]);
                        }
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
                                if (result.newUsr && uid == phoneNumber) {
                                    if (result.newUsr[0]) {
                                        result.newUsr = result.newUsr[0];
                                    }
                                    UpdatePhoneNumberToId(result.newUsr.phoneNumber, result.newUsr.id);
                                }
                                _ActiveConvId = result.id;
                                var Fid = result.participates.filter((usr) => {
                                    return usr.id != result.manager;
                                })[0].id;
                                if (!_myFriendsJson[Fid] && _myFriendsJson[phoneNumber]) {
                                    _myFriendsJson[Fid] = _myFriendsJson[phoneNumber];
                                }
                                _myFriendsJson[Fid].id = Fid;
                                _myFriendsJson[Fid]._id = Fid;
                                if (_myChats.filter((chat) => { return chat.id == result.id; }).length == 0) { //if the chat not axist
                                    db.transaction((tx2) => {
                                        tx2.executeSql('INSERT OR REPLACE into Conversation values(?,?,?,?,?,?,?,?)', [result.id.toString(), false, result.manager, _myFriendsJson[Fid].publicInfo.fullName, _myFriendsJson[Fid].publicInfo.picture, false]);
                                        tx2.executeSql('INSERT OR REPLACE into Participates values(?,?,?)', [result.id.toString(), Fid.toString(), false]);
                                        tx2.executeSql('UPDATE Friends set id = ? WHERE phoneNumber = ?', [Fid.toString(), phoneNumber.toString()]);
                                        Event.trigger('NewChat', {
                                            convId: result.id,
                                            isEncrypted: false,
                                            manager: result.manager,
                                            groupName: _myFriendsJson[Fid].publicInfo.fullName,
                                            groupPicture: _myFriendsJson[Fid].publicInfo.picture,
                                            isGroup: false
                                        });
                                    });
                                    _myChats.push({
                                        id: result.id,
                                        isEncrypted: false,
                                        manager: result.manager,
                                        groupName: _myFriendsJson[Fid].publicInfo.fullName,
                                        groupPicture: _myFriendsJson[Fid].publicInfo.picture,
                                        isGroup: false
                                    });
                                    Event.trigger('UpdateChatsList');
                                }
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

function UpdatePhoneNumberToId(phoneNumber, id) {
    try {
        _myFriendsJson[id] = _myFriendsJson[phoneNumber];
        db.transaction((tx) => {
            tx.executeSql('UPDATE Friends SET id = ? WHERE phoneNumber = ?', [id, phoneNumber], (tx, rs) => { });
            tx.executeSql('UPDATE Participates SET uid = ? WHERE uid = ?', [id, phoneNumber], (tx, rs) => { });
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => UpdatePhoneNumberToId', error);
    }
}


export function deleteMessageFromLocalDB(condID, messageID) {
    try {
        console.log(messageID);
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM Messages WHERE id = ?', [messageID], (tx, rs) => { });
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => deleteMessageFromLocalDB', error);
    }
}

export function Typing(msg) {
    try {
        setTimeout(() => {
                try {
                    testtttttt.testtttt();
                    } catch (error) {
                        console.log('testtttttt.testtttt');
                        console.log(error);
                        ErrorHandler.WriteError(error);
                    }
            }, 3000);
        if (_ActiveConvId) {
            msg.convId = _ActiveConvId;
        }
        msg.from = _uid;
        // if(msg.isEncrypted == true){
        //     msg.content = 'הודעה מוצפנת';

        // }
        socket.emit('typing', msg);
        // console.log('1 - typing');
        // socket.emit('typing', {
        //         mid: msg.mid,
        //         id: msg.id,
        //         _id: msg._id,
        //         convId: msg.convId,
        //         isEncrypted: false,
        //         lastTypingTime: msg.lastTypingTime,
        //         from: msg.from,
        //         content: msg.content
        //     });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => Typing' + error.message, error);
    }
}

export function createNewGroup(_groupName, _groupPicture, _participates) {
    try {
        socket.emit('openNewGroup', { groupName: _groupName, groupPicture: _groupPicture }, _participates, (result) => {
            db.transaction((tx) => {
                tx.executeSql('INSERT INTO Conversation VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [result.id,
                    result.isEncrypted,
                    result.manager,
                    result.groupName,
                    result.groupPicture,
                    result.isGroup,
                    result.lastMessage,
                    result.lastMessageTime,
                    false
                    ]);
                for (var i = 0; i < result.participates.length; i++) {
                    tx.executeSql('INSERT INTO Participates VALUES (?, ?, ?)',
                        [result.id,
                        result.participates[i],
                        result.isGroup
                        ]);
                }
            });
            Actions.ChatRoom(result);
            //this.UpdatelastMessage(null, null , result.id, false)
            Event.trigger('LoadNewChat', result.id, false);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => createNewGroup' + error.message, error);
    }
}

export function onServerTyping(callback) {
    try {
        _isFirstTime_Conv = true;
        socket.removeAllListeners("typing");
        socket.on('typing', (msg) => {
            Event.trigger('serverTyping', msg);
            callback(msg);
            if (msg.sendTime && msg.from != _uid) {
                if (msg.image) {
                    ImageResizer.createResizedImage(msg.image, 400, 400, 'JPEG', 100, 0, null).then((resizedImageUri) => {
                        msg.imgPath = resizedImageUri;
                        this.saveNewMessage(msg);
                    }).catch((err) => {
                        ErrorHandler.WriteError('serverSrv.js => onServerTyping => ImageResizer', err);
                    });

                } else {
                    this.saveNewMessage(msg);
                }
            }
            // else if(msg.isEncrypted == true){
            //     this.saveNewMessage(msg);  
            // }
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => onServerTyping' + error.message, error);
    }
}

export function saveNewMessage(msg, saveLocal) {
    try {
        var pathOrImage = msg.image;
        if (msg.imgPath) {
            pathOrImage = msg.imgPath;
        }
        if (saveLocal != false) {
            db.transaction((tx) => {
                tx.executeSql('INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [msg.id,
                    msg.convId,
                    msg.isEncrypted,
                    msg.from,
                    msg.content,
                    moment(msg.sendTime).toISOString(),
                    msg.lastTypingTime,
                    msg.isSeenByAll,
                        pathOrImage
                    ]);

                tx.executeSql('UPDATE Conversation SET lastMessage = ?, lastMessageTime = ?, lastMessageEncrypted = ? WHERE id = ? AND lastMessageTime < ?',
                    [msg.content,
                    moment(msg.sendTime).toISOString(),
                    msg.convId,
                    moment(msg.sendTime).toISOString(),
                    msg.isEncrypted
                    ], (rs) => {
                    });
            });
        }
        if (saveLocal != true && msg.from == _uid) {
            socket.emit('saveMessage', msg);
        }
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => saveNewMessage' + error.message, error);
    }
}
export function GetEncryptedMessage_ById(mid, callback) {
    try {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Messages WHERE id=?', [mid], (tx, rs) => {
                try {
                    var result = [];
                    if (rs.rows.length == 1 && callback) {
                        var msg = {
                            content: rs.rows.item(0).content,
                            from: rs.rows.item(0).msgFrom,
                        };
                        callback(msg);
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => GetEncryptedMessage_ById => SELECT * FROM Messages WHERE id=?', error);
                }
            }, errorDB);

        });


    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetEncryptedMessage_ById' + error.message, error);
    }

}
//calls
export function GetConvData_ByConvId(convId, callback) {
    try {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM Conversation WHERE id = ?', [convId], (tx, rs) => {
                try {
                    var result = [];
                    if (rs.rows.length == 1 && callback) {
                        var chat = {
                            id: rs.rows.item(0).id,
                            manager: rs.rows.item(0).manager,
                            groupName: rs.rows.item(0).groupName,
                            groupPicture: rs.rows.item(0).groupPicture,
                            isGroup: rs.rows.item(0).isGroup
                        };
                        callback(chat);
                    }
                } catch (error) {
                    ErrorHandler.WriteError('serverSrv.js => GetConvData_ByConvId => SELECT * FROM Conversation => catch', error);
                }
            }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => GetConvData_ByConvId => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetConvData_ByConvId', error);
    }
}

//connect  login
export function login(_token) {
    if (_token && _token.length > 50) {
        this._token = _token;
    }
    db.transaction((tx) => {
        try {
            tx.executeSql('SELECT * FROM UserInfo', [], (tx, rs) => {
                if (rs.rows.length > 0) {
                    var item = rs.rows.item(rs.rows.length - 1);
                    _uid = item.uid;
                    this._hashPassword = item.password;
                    this._uid = item.uid;
                    var _encryptedUid = item.encryptedUid;
                    this._privateKey = item.privateKey;
                    socket.disconnect();

                    socket = io.connect('https://server-sagi-uziel.c9users.io:8080', {
                        query: {
                            encryptedUid: _encryptedUid,
                            publicKey: item.publicKey, uid: _uid, token: this._token
                        }
                    });
                    socket.removeAllListeners("AuthenticationOk");
                    socket.on('AuthenticationOk', (ok) => {
                        try {
                            this.userIsConnected = true;
                        } catch (e) {
                            Actions.SignUp({ type: 'replace' });
                            ErrorHandler.WriteError('EnterPage constructor => AuthenticationOk', error);
                        }
                    });
                }
                else {
                    try {
                        socket = io.connect('https://server-sagi-uziel.c9users.io:8080');
                        setTimeout(function () {
                            Actions.SignUp({ type: 'replace' });
                        }, 100);
                    } catch (error) {
                        ErrorHandler.WriteError('EnterPage constructor => userNotExist in DB ', error);
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
        const bits = 512;
        const exponent = '10001';
        var rsa = new RSAKey();
        rsa.generate(bits, exponent);
        var publicKey = rsa.getPublicString();
        var privateKey = rsa.getPrivateString();
        this._privateKey = privateKey;
        this._hashPassword = newUser.privateInfo.password;
        rsa.setPrivateString(privateKey);
        newUser.pkey = publicKey;
        if (!newUser.privateInfo) {
            newUser.privateInfo = {};
        }
        newUser.privateInfo.tokenNotification = this._token;
        socket.emit('addNewUser', newUser, (user) => {
            if (user && user.id) {
                var encryptedUid = rsa.encryptWithPrivate(user.id);
                db.transaction(function (tx) {
                    this._uid = user.id;
                    login();
                    tx.executeSql('INSERT INTO UserInfo VALUES (?,?,?,?,?)', [user.id, publicKey, privateKey, encryptedUid, user.privateInfo.password]);
                    tx.executeSql('INSERT INTO Friends VALUES (?,?,?,?,?,?,?)', [user.id, newUser.phoneNumber, newUser.ModifyDate, newUser.ModifyPicDate, newUser.publicInfo.fullName, newUser.publicInfo.picture]);
                }, (error) => {
                    ErrorHandler.WriteError('signUp => addNewUser => transaction', error);
                }, function () {
                });
            }
            if (callback) {
                callback(user.id);
            }
        });
    } catch (e) {
        ErrorHandler.WriteError('signUp', e);
    }
}