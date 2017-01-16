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
import renderIf from '../../plugins/renderIf'
import SGListView from 'react-native-sglistview';

var dismissKeyboard = require('dismissKeyboard');
var Event = require('../../Services/Events');
var serverSrv = require('../../Services/serverSrv');
var ErrorHandler = require('../../ErrorHandler');
var generalStyle = require('../../styles/generalStyle');

export default class Chats extends Component {
    constructor() {
        super();
        try {
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
            this.newMessage = this.newMessage.bind(this);
            this.NewChat = this.NewChat.bind(this);
            this.UpdatelastMessage = this.UpdatelastMessage.bind(this);
            
         
           
        } catch (e) {
            ErrorHandler.WriteError("Chats.js -> constructor", e);
        }
    }

    UpdateChatsList() {
        try {
            var ds = this.ds;
            serverSrv.GetAllUserConv((result) => {
                try {
                    //this.myChats = this.sortDates(result);
                    this.myChats = result;
                    try {
                        this.setState({
                            dataSource: ds.cloneWithRows(result)
                        })

                    } catch (e) {
                        ErrorHandler.WriteError("Chats.js -> UpdateChatsList -> setState", e);
                    }
                    this.state = {
                        dataSource: ds.cloneWithRows(this.myChats)
                    };
                } catch (e) {
                    ErrorHandler.WriteError("Chats.js -> UpdateChatsList -> GetAllUserConv", e);
                }
            });
        } catch (e) {
            ErrorHandler.WriteError("Chats.js -> UpdateChatsList", e);
        }
    }

    NewChat(chat) {
        try {
            this.myChats.push(chat);
            this.setState({
                dataSource:  this.ds.cloneWithRows(this.myChats)
            });
        } catch (e) {
            ErrorHandler.WriteError("Chats.js -> NewChat", e);
        }
    }

    newMessage(msg) {
        try {
            // var sorted = this.sortDates(this.state.dataSource._dataBlob.s1);
            // this.setState({
            //     dataSource: this.ds.cloneWithRows(sorted)
            // });
        } catch (error) {
            ErrorHandler.WriteError("Chats.js -> newMessage", error);
        }
    }

    componentDidMount() {
        try {
            
            Event.on('UpdateChatsList', this.UpdateChatsList);
            Event.on('newMessage', this.newMessage);
            Event.on('NewChat', this.NewChat);
            Event.removeAllListeners('lastMessage');
            Event.on('lastMessage', this.UpdatelastMessage);
           
            setTimeout(this.UpdateChatsList, 100);
              
            
        } catch (e) {
            ErrorHandler.WriteError("Chats.js -> componentDidMount", e);
        }
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
            ErrorHandler.WriteError('Chats.js => showNotification', e);
        }
    }

    pad(num, size) {
        try {
            var s = "000000000" + num;
            return s.substr(s.length - size);
        } catch (e) {
            ErrorHandler.WriteError("Chats.js -> pad", e);
        }
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
            ErrorHandler.WriteError('Chats.js => getDateFormated', e);
        }
    }

    sortDates(dataSource) {
        try {
            return dataSource.sort((a, b) => {
                try {
                    console.log('a.lastMessageTime: ' , a.lastMessageTime);
                    console.log('b.lastMessageTime: ' , b.lastMessageTime);
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
                } catch (e) {
                    ErrorHandler.WriteError('Chats.js => sortDates => sort', e);
                }
            });
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => sortDates', e);
        }
    }

    openChat(rowData) {
        try {
            Actions.ChatRoom(rowData);
            Event.trigger('LoadNewChat', rowData.id, false);
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => openChat', e);
        }
    }

    setImageVisible(visible) {
        try {
            this.setState({ imageVisible: visible });
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => setImageVisible', e);
        }
    }

    openImageModal(image) {
        try {
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
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => openImageModal', e);
        }
    }

    onFilterChange(event) {
        try {
            this.setState({
                filter: event.nativeEvent.text
            });
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => onFilterChange', e);
        }
    }

    getDataSource() {
        //if filter is empty - return original data source
        try {
            if (!this.state.filter) {
                return this.state.dataSource.cloneWithRows(this.myChats);
            }
            //create filtered datasource
            let filteredContacts = this.myChats;
            try {
                filteredContacts = this.myChats.filter((chat) => {
                    return ((chat.groupName.toLowerCase().includes(this.state.filter.toLowerCase())));
                });
            } catch (e) {
                ErrorHandler.WriteError('Chats.js => getDataSource => filter', e);
            }
            return this.state.dataSource.cloneWithRows(filteredContacts);
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => getDataSource', e);
        }
    }

    _renderCancel(notifications) {
        try {
            if (notifications && notifications > 0) {
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
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => _renderCancel', e);
        }
    }
UpdatelastMessage(lastMessage, lastMessageTime , convId, isNewMessage)
{
    this.myChats = this.myChats.map((chat) => {
        console.log(chat);
        if (chat.id == convId) {
            chat.lastMessage = lastMessage;
            chat.lastMessageTime = lastMessageTime;
            if (isNewMessage) {
                if (!chat.notifications) {
                    chat.notifications = 0;
                }
                chat.notifications = chat.notifications + 1;
            } else {
                chat.notifications = null;
            }
         }
        return chat;
    });
    this.myChats = this.sortDates(this.myChats);
    console.log(this.myChats);
    this.setState({dataSource: this.ds.cloneWithRows(this.myChats)});
}

    render() {
        try {
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
                    <SGListView style={{ paddingTop: 5, flex: 1 }}
                        enableEmptySections={true}
                        dataSource={this.getDataSource()}
                        initialListSize={1}
                        stickyHeaderIndices={[]}
                        onEndReachedThreshold={1}
                        scrollRenderAheadDistance={20}
                        pageSize={20}
                        renderRow={(rowData) =>
                            <TouchableOpacity onPress={() => {
                                this.openChat(rowData);
                            } }>
                                <View style={generalStyle.styles.row}>
                                    <TouchableOpacity onPress={() => {
                                        this.imgSelected = rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ?  rowData.isGroup : require('../../img/user.jpg'))
                                        this.setImageVisible(true);
                                    } }>
                                        <View style={generalStyle.styles.viewImg}>
                                            <Image style={generalStyle.styles.thumb} source={rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? rowData.isGroup : require('../../img/user.jpg'))} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'column', flex: 1, marginRight: 7, marginBottom: 3 }}>
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
        } catch (e) {
            ErrorHandler.WriteError('Chats.js => render', e);
        }
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