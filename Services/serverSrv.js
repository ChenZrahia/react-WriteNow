import React from 'react-native';
import './UserAgent';
import io from 'socket.io-client/socket.io';

//--------for dev mode only-----------//
var encryptedUid = 'UIP5n4v1jj24a+dHq6L/QqLwDFtPnSoebPzUe5+DWKOQ+rj5boKTAI6goMgySXHDj4BRMOa16wNV743D3/5WfRlXPrizY6nvi3XEmg/oPQvmNLlchDDjqZpQW8nfAS3IH9jZwDqFjxMKVkMau1SOLJxMroz7hTKVH7gOCGLHzik=';
var publicKey = `-----BEGIN PUBLIC KEY-----
        MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAInhtN7l9IVl0BqKC+yav4KrB09XtICc
            B3nfrzvfLZBCmXKkS5GYg/xzIx5BbsfVSKOKXzCcnlIhWUssanrDiW8CAwEAAQ==
            -----END PUBLIC KEY-----`;
//--------for dev mode only-----------//

export var socket = io('https://server-sagi-uziel.c9users.io:8080', {query: {encryptedUid: encryptedUid, publicKey: publicKey}});

var ErrorHandler = require('../ErrorHandler');
var SQLite = require('react-native-sqlite-storage')

function errorDB(error) {
    ErrorHandler.WriteError('SQL Error: ', error);
}

var db = SQLite.openDatabase({name: 'WriteNow.db', location: 'default'}, null , errorDB);
var isFirstTime_Friends = true;
var isFirstTime_Chats = true;
export var myFriends = null;
export var myChats = null;

//Users
export function GetAllMyFriends(callback, isUpdate) {    
    try {
        if(myFriends && callback && !isUpdate){
            callback(myFriends);
            return;
        }
        db.transaction((tx) => {    
            tx.executeSql('CREATE TABLE IF NOT EXISTS Friends (id PRIMARY KEY NOT NULL, phoneNumber, ModifyDate , ModifyPicDate, fullName, mail, picture, gender)', [] , null, errorDB); //להוציא לפונקציה נפרדת
            tx.executeSql('SELECT * FROM Friends',[], (tx, rs) => {
                try{
                    var result = [];
                    for(var i = 0; i < rs.rows.length; i++)
                    {
                        result.push({id: rs.rows.item(i).id,
                                    phoneNumber: rs.rows.item(i).phoneNumber,
                                    ModifyDate: rs.rows.item(i).ModifyDate,
                                    ModifyPicDate: rs.rows.item(i).ModifyPicDate,
                                    publicInfo: {fullName: rs.rows.item(i).fullName,
                                        mail: rs.rows.item(i).mail,
                                        picture: rs.rows.item(i).picture,
                                        gender: rs.rows.item(i).gender
                                    }
                        });
                    }
                    myFriends = result;
                    if (callback) {
                        callback(result);
                        if(isFirstTime_Friends == true){
                            isFirstTime_Friends = false;
                            GetAllMyFriends_Server(callback);
                        }
                    }
                }catch(error){
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
        if (myFriends) {
            friends = myFriends;
        }
        let friendUidArray = friends.map((friend) => {return friend.id;});
        socket.emit('GetMyFriendsChanges', friendUidArray, ((data) => {
            db.transaction((tx) => { 
                for(var i = 0; i < data.length; i++)
                {
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
                            data[i].publicInfo.gender ]);
                    }
                }
                GetAllMyFriends(callback, true);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server', error);
    }
} 

//Conversation
export function GetAllUserConv(callback, isUpdate) {    
    try {
        if(myChats && callback && !isUpdate){
            callback(myChats);
            return;
        }
        db.transaction((tx) => {    
            tx.executeSql('CREATE TABLE IF NOT EXISTS Conversation (id PRIMARY KEY NOT NULL, isEncrypted, manager , groupName, groupPicture, isGroup)', [] , null, errorDB); //להוציא לפונקציה נפרדת
            tx.executeSql('SELECT * FROM Conversation',[], (tx, rs) => {
                try{
                    var result = [];
                    for(var i = 0; i < rs.rows.length; i++)
                    {
                        result.push({id: rs.rows.item(i).id,
                                    isEncrypted: rs.rows.item(i).isEncrypted,
                                    manager: rs.rows.item(i).manager,
                                    groupName: rs.rows.item(i).groupName,
                                    groupPicture: rs.rows.item(i).groupPicture,
                                    isGroup: rs.rows.item(i).isGroup
                        });
                    }
                    myChats = result;
                    if (callback) {
                        callback(result);
                        if(isFirstTime_Chats == true){
                            isFirstTime_Chats = false;
                            GetAllMyFriends_Server(callback);
                        }
                    }
                }catch(error){
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
        if (myChats) {
            chats = myChats;
        }
        let convIdArray = chats.map((chat) => {return chat.id;});
        socket.emit('GetAllUserConvChanges', convIdArray, ((data) => {
            db.transaction((tx) => { 
                for(var i = 0; i < data.length; i++)
                {
                    if (data[i].deletedConv == true && data[i].id) {
                        tx.executeSql('DELETE FROM Conversation WHERE id=?', [data[i].id]);
                    } else {
                        tx.executeSql('INSERT INTO Conversation VALUES (?, ?, ?, ?, ?, ?)', 
                            [data[i].id,
                             data[i].isEncrypted,
                             data[i].manager,
                             data[i].groupName,
                             data[i].groupPicture,
                             data[i].isGroup ]);
                    }
                }
                GetAllUserConv(callback, true);
            })
        }));
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllUserConv_Server', error);
    }
}  