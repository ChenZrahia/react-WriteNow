import React, { Component } from 'react';
import {
    Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    StyleSheet,
    Text,
    View,
    Modal
} from 'react-native';
import { Actions } from 'react-native-router-flux';

var serverSrv = require('../../Services/serverSrv');
var ErrorHandler = require('../../ErrorHandler');
var generalStyle = require('../../styles/generalStyle');

export default class Chats extends Component {
    constructor() {
        super();
        this.myChats = [];
        this.todayDate = new Date();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.ds = ds;
        //this.myChats = this.sortDates(this.myChats);
        this.state = {
            dataSource: ds.cloneWithRows(this.myChats),
            imageVisible: false
        };
    }

    componentDidMount() {
        var ds = this.ds;
        setTimeout(() => {
            serverSrv.GetAllUserConv((result) => {
                try {
                    this.myChats = this.sortDates(result);
                    this.myChats = result;
                    try {
                        this.setState({
                            dataSource: ds.cloneWithRows(result)
                        })

                    } catch (error) {
                        console.log('error');
                        console.log(error);
                    }
                    this.state = {
                        dataSource: ds.cloneWithRows(this.myChats)
                    };
                } catch (error) {
                    console.log(error);
                }
            });
        }, 0);
    }

    showNotification(notification) {
        try {
            if (notification) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (e) {
            ErrorHandler.WriteError('chats.js => showNotification', e);
        }
    }

    pad(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length - size);
    }

    getDateFormated(date) {
        try {
            if (!date) {
                return '';
            } else {
                var todayDate = this.todayDate;
                var timeSend = new Date(date);
                if ((todayDate.getTime() - timeSend.getTime()) <= (86400000) && timeSend.getHours) { //checking if the message sent in current day                    
                    return this.pad(timeSend.getHours(), 2) + ":" + this.pad(timeSend.getMinutes(), 2);
                } else if ((todayDate.getTime() - timeSend.getTime()) >= (86400000) && (todayDate.getTime() - timeSend.getTime()) <= (172800000)) { //check if it was yesterday
                    return "yesterday";
                } else if (timeSend.getUTCDate) {
                    var newdate = (timeSend.getUTCDate()) + "/" + (timeSend.getUTCMonth() + 1) + "/" + (timeSend.getUTCFullYear() - 2000);
                    return newdate;
                }
                return '';
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

    setImageVisible(visible) {
        this.setState({ imageVisible: visible });
    }

    openImageModal(image) {
        return (
            <Modal
                animationType={"slide"}
                transparent={true}
                visible={this.state.imageVisible == true}
                onRequestClose={() => { console.log('image closed') } }
                >
                <TouchableHighlight style={{ flex: 1 }} onPress={() => {
                    this.setImageVisible(!this.state.imageVisible)
                } }>
                    <View style={generalStyle.styles.imageModal}>
                        <Image style={generalStyle.styles.imageInsideModal} source={image} />
                    </View>
                </TouchableHighlight>
            </Modal>
        );
    }

    _renderCancel(notifications) {
        if (notifications) {
            return (
                <View style={styles.notification}>
                    <Text style={styles.notificationText}>
                        {notifications}
                    </Text>
                </View>
            );
        }
        else {
            return null;
        }
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
                            <View style={generalStyle.styles.row}>
                                <TouchableHighlight onPress={() => {
                                    this.imgSelected = rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? require('../../img/user.jpg') : require('../../img/user.jpg'))
                                    this.setImageVisible(true);
                                } }>
                                    <View style={generalStyle.styles.viewImg}>
                                        <Image style={generalStyle.styles.thumb} source={rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? require('../../img/user.jpg') : require('../../img/user.jpg'))} />
                                    </View>
                                </TouchableHighlight>
                                <View style={{ flexDirection: 'column', flex: 1, marginRight: 7 }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={generalStyle.styles.textName}>
                                            {rowData.groupName}
                                        </Text>
                                        <Text style={generalStyle.styles.textDate}>
                                            {this.getDateFormated(rowData.lastMessageTime)}
                                        </Text>
                                    </View>
                                    <Text style={generalStyle.styles.textStatus}>
                                        {rowData.lastMessage}
                                    </Text>
                                </View>
                                {this._renderCancel(rowData.notifications)}
                            </View>
                        </TouchableHighlight>
                    }
                    />
                {this.openImageModal(this.imgSelected)}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    notificationText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    notification: {
        backgroundColor: '#32cd32',
        borderRadius: 10,
        borderWidth: 0,
        width: 20,
        height: 20
    }
});

