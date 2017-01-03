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
import IconMat from 'react-native-vector-icons/MaterialIcons';

var dismissKeyboard = require('dismissKeyboard');
var Event = require('../../Services/Events');
var serverSrv = require('../../Services/serverSrv');
var ErrorHandler = require('../../ErrorHandler');
var generalStyle = require('../../styles/generalStyle');

var callType = {
    audio: 1,
    video: 2,
    ppt: 3
}

export default class LiveChat extends Component {
    constructor() {
        super();
        try {
            dismissKeyboard();
            const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows([{id: 1, groupName: 'groupName', callType: 1},{id: 2, groupName: 'groupName', callType: 2}, {id: 3, groupName: 'groupName', callType: 3}]) 
        };
        } catch (e) {
            ErrorHandler.WriteError("LiveChat.js -> constructor", e);
        }
    }

    componentDidMount() {
        try {
           
        } catch (e) {
            ErrorHandler.WriteError("LiveChat.js -> componentDidMount", e);
        }
    }

    getDateFormated(date) { //להוציא לסרוויס?
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
            ErrorHandler.WriteError('LiveChat.js => getDateFormated', e);
        }
    }

    renderIconType(type) {
        if (type == callType.audio) {
            return (<IconMat name="call" size={25} color="#57129c" />);
        } else if (type == callType.video) {
            return (<IconMat name="videocam" size={25} color="#57129c" />);
        } else if (type == callType.ppt) {
          return (<IconMat name="record-voice-over" size={25} color="#57129c" />);
        } else {
        }
    }

    render() {
        try {
            return (
                <View style={{ flex: 1, alignSelf: 'stretch' }}>                    
                    <ListView style={{ paddingTop: 5, flex: 1 }}
                        enableEmptySections={true}
                        dataSource={this.state.dataSource}
                        renderRow={(rowData) =>
                            <TouchableOpacity onPress={() => {
                                Actions.Call();
                            } }>
                                <View style={generalStyle.styles.row}>
                                    <TouchableOpacity onPress={() => {
                                        this.imgSelected = rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? rowData.isGroup : require('../../img/user.jpg'))
                                        this.setImageVisible(true);
                                    } }>
                                        <View style={generalStyle.styles.viewImg}>
                                            <Image style={generalStyle.styles.thumb} source={rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? rowData.isGroup : require('../../img/user.jpg'))} />
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
                                    <View style={generalStyle.styles.iconContainer}>
                                        <Text>
                                            {this.renderIconType(rowData.callType)}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        }
                        />
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('LiveChat.js => render', e);
        }
    }
}

var styles = StyleSheet.create({
   
});