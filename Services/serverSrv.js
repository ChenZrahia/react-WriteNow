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


export var myFriends = null;


export function getMyFriends(callback){
    try{
        if(myFriends == null){
            GetAllMyFriends((result) => {
                myFriends = result;     
                if(callback){
                    callback(myFriends);
                }
            })
        }
        if(callback){
            callback(myFriends);
        }
    } catch(error){
        ErrorHandler.WriteError('getMyFriends', error);
    }
}

export function GetAllMyFriends(callback) {    
    try {
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
                    if (callback) {
                        callback(result);
                    }
                }catch(error){
                    ErrorHandler.WriteError('serverSrv.js => SELECT * FROM Friends => catch', error);
                }                
              }, errorDB);
        }, (error) => {
            ErrorHandler.WriteError('serverSrv.js => transaction', error);
        });
    } catch (error) {
        ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends', error);
    }
} 

function GetAllMyFriends_Server(callback) {    
    try { 
        getMyFriends((friends) => {
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
                })
            }));
        });
    } catch (error) {
ErrorHandler.WriteError('serverSrv.js => GetAllMyFriends_Server', error);
    }
} 