import React, { Component } from 'react';
import { Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    StyleSheet,
    Text,
    View, } from 'react-native';
import {Actions} from 'react-native-router-flux';
var serverSrv = require('../../Services/serverSrv');
var ErrorHandler = require('../../ErrorHandler');

export default class Chats extends Component {
    constructor() {
        super();
        this.myChats = [];
        this.todayDate = new Date();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        //this.myChats = this.sortDates(this.myChats);
        this.state = {
            dataSource: ds.cloneWithRows(this.myChats)
        };
        serverSrv.GetAllUserConv((result) => {
            try {
                this.myChats = this.sortDates(result);
                this.myChats = result;
                setTimeout(() => {
                    try {
                        this.setState({
                            dataSource: ds.cloneWithRows(result)
                        })
                        
                    } catch (error) {
                        console.log('error');
                        console.log(error);
                    }
                }, 100);

                this.state = {
                    dataSource: ds.cloneWithRows(this.myChats)
                };
            } catch (error) {
                console.log(error);
            }

        });
    }

    getDateFormated(date) {
        try {
            if (!date) {
                return '';
            } else {
                var todayDate = this.todayDate;
                var timeSend = new Date(date);
                if ((todayDate.getTime() - timeSend.getTime()) <= (86400000)) { //checking if the message sent in current day
                    return this.pad(timeSend.getHours(), 2) + ":" + this.pad(timeSend.getMinutes(), 2);
                } else if ((todayDate.getTime() - timeSend.getTime()) >= (86400000) && (todayDate.getTime() - timeSend.getTime()) <= (172800000)) { //check if it was yesterday
                    return "yesterday";
                } else {
                    var newdate = (timeSend.getUTCDate()) + "/" + (timeSend.getUTCMonth() + 1) + "/" + (timeSend.getUTCFullYear() - 2000);
                    return newdate;
                }
            }
        } catch (e) {
            ErrorHandler.WriteError('chats.js => getDateFormated', e);
        }
    }

    sortDates(dataSource) {
        try {
            return dataSource.sort((a, b) => {
                try {
                    if (a.lastMessageTime && b.lastMessageTime) {
                        if (a.lastMessageTime > b.lastMessageTime) {
                            return -1;
                        }
                        else if (a.lastMessageTime < b.lastMessageTime) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    }
                    else if (a.lastMessageTime && !b.lastMessageTime) {
                        return -1;
                    }
                    else if (!a.lastMessageTime && b.lastMessageTime) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                } catch (error) {
                    ErrorHandler.WriteError('chats.js => sortDates => sort', e);
                }
            });
        } catch (error) {
            ErrorHandler.WriteError('chats.js => sortDates', e);
        }
    }

    openChat(rowData) {
        
        Actions.ChatRoom(rowData);
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <ListView style={{ paddingTop: 5, flex: 1 }}
                    enableEmptySections={true}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) =>
                        <TouchableHighlight underlayColor='#ededed' onPress={() => {
                            this.openChat(rowData);
                        } }>
                            <View style={styles.row}>
                                <View style={styles.viewImg}>
                                    <Image style={styles.thumb} source={ rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? require('../../img/user.jpg') : require('../../img/user.jpg')) }/>
                                </View>
                                <View style={{ flexDirection: 'column', flex: 1, marginRight: 7 }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.textName}>
                                            { rowData.groupName }
                                        </Text>
                                        <Text style={styles.textDate}>
                                            {this.getDateFormated(rowData.lastMessageTime) }
                                        </Text>
                                    </View>
                                    <Text style={styles.textStatus}>
                                        {rowData.lastMessage}
                                    </Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    }
                    />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
        borderBottomWidth: 0.5,
        borderColor: '#e7e7e7',
        backgroundColor: 'white'
    },
    viewImg: {
        borderColor: 'black',
        elevation: 3,
        borderRadius: 4,
    },
    thumb: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 40,
        height: 40,
        alignSelf: 'flex-end',
    },
    textName: {
        paddingLeft: 10,
        color: 'black',
        alignSelf: 'flex-start'
    },
    textStatus: {
        paddingLeft: 10,
        color: 'gray',
        alignSelf: 'flex-start'
    },
    textDate: {
        color: 'gray',
        alignSelf: 'flex-end',
        fontSize: 12
    }
});