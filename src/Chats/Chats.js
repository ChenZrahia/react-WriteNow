import React, { Component } from 'react';
import {
    Image,
    ReactNative,
    ListView,
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
    Modal
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import Kohana from '../../styles/Kohana';

var dismissKeyboard = require('dismissKeyboard');
var Event = require('../../Services/Events');
var serverSrv = require('../../Services/serverSrv');
var ErrorHandler = require('../../ErrorHandler');
var generalStyle = require('../../styles/generalStyle');

export default class Chats extends Component {
    constructor() {
        super();
        dismissKeyboard();
        this.myChats = [];
        this.todayDate = new Date();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.ds = ds;
        this.mounted = false;
        //this.myChats = this.sortDates(this.myChats);
        this.state = {
            dataSource: ds.cloneWithRows(this.myChats),
            imageVisible: false,
            filter: ''
        };
            this.UpdateChatsList = this.UpdateChatsList.bind(this);
            Event.on('UpdateChatsList', this.UpdateChatsList);
    }

    componentDidMount() {
        this.mounted = true;
    }

    UpdateChatsList() {
        var ds = this.ds;
        serverSrv.GetAllUserConv((result) => {
            try {
                this.myChats = this.sortDates(result);
                this.myChats = result;
                try {
                    this.setState({
                        dataSource: ds.cloneWithRows(result)
                    })

                } catch (error) {
                    console.log(error);
                }
                this.state = {
                    dataSource: ds.cloneWithRows(this.myChats)
                };
            } catch (error) {
                console.log(error);
            }
        });
    }

    componentDidMount() {
        setTimeout(this.UpdateChatsList, 0);
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
                    if (a.sendTime && b.sendTime) {
                        if (a.sendTime > b.sendTime) {
                            return -1;
                        }
                        else if (a.sendTime < b.sendTime) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    }
                    else if (a.sendTime && !b.sendTime) {
                        return -1;
                    }
                    else if (!a.sendTime && b.sendTime) {
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
        Event.trigger('LoadNewChat',rowData.id);
        Actions.ChatRoom(rowData);
    }

    setImageVisible(visible) {
        this.setState({ imageVisible: visible });
    }

    openImageModal(image) {
        return (
            <Modal
                transparent={true}
                visible={this.state.imageVisible == true}
                onRequestClose={() => { console.log('image closed') } }
                >
                <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                    this.setImageVisible(!this.state.imageVisible)
                } }>
                    <View style={generalStyle.styles.imageModal}>
                        <Image style={generalStyle.styles.imageInsideModal} source={image} />
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }

    onFilterChange(event) {
        this.setState({
            filter: event.nativeEvent.text
        });
    }

    getDataSource() {
        //if filter is empty - return original data source
        if (!this.state.filter) {
            return this.state.dataSource.cloneWithRows(this.myChats);
        }
        //create filtered datasource
        let filteredContacts = this.myChats;
        filteredContacts = this.myChats.filter((chat) => {
            return ((chat.groupName.toLowerCase().includes(this.state.filter.toLowerCase())));
        });
        return this.state.dataSource.cloneWithRows(filteredContacts);
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
                <Kohana
                    style={styles.searchBar}
                    label={'Search'}
                    iconClass={MaterialsIcon}
                    iconName={'search'}
                    iconColor={'#f50057'}
                    labelStyle={{ color: '#f50057', justifyContent: 'center', alignSelf: 'stretch' }}
                    inputStyle={{ color: '#f50057', alignSelf: 'stretch' }}
                    value={this.state.filter}
                    onChange={this.onFilterChange.bind(this)}
                    />
                <ListView style={{ paddingTop: 5, flex: 1 }}
                    enableEmptySections={true}
                    dataSource={this.getDataSource()}
                    renderRow={(rowData) =>
                        <TouchableOpacity onPress={() => {
                            this.openChat(rowData);
                        } }>
                            <View style={generalStyle.styles.row}>
                                <TouchableOpacity onPress={() => {
                                    this.imgSelected = rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? require('../../img/user.jpg') : require('../../img/user.jpg'))
                                    this.setImageVisible(true);
                                } }>
                                    <View style={generalStyle.styles.viewImg}>
                                        <Image style={generalStyle.styles.thumb} source={rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? require('../../img/user.jpg') : require('../../img/user.jpg'))} />
                                    </View>
                                </TouchableOpacity>
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
                        </TouchableOpacity>
                    }
                    />
                {this.openImageModal(this.imgSelected)}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    searchBar: {
        borderWidth: 0.5,
        borderRadius: 4,
        borderColor: '#f50057',
        height: 35,
        margin: 5
    },
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