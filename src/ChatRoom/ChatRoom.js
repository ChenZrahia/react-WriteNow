import React, { Component } from 'react';
import GiftedChat from './GiftedChat';
import { Container, Content, Icon } from 'native-base';
import {
    Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    AppRegistry,
    TouchableOpacity,
    StyleSheet,
    Text,
    TextInput,
    Dimensions,
    ScrollView,
    View,
} from 'react-native';

var serverSrv = require('../../Services/serverSrv');
var generalStyles = require('../../styles/generalStyle');
var ErrorHandler = require('../../ErrorHandler');
var moment = require('moment');

export default class ChatRoom extends Component {
    constructor(props) {
        super(props);
        this._messageId = null;
        this.state = { messages: [] };
        this.onSend = this.onSend.bind(this);
        this.onType = this.onType.bind(this);
        this.onFriendType = this.onFriendType.bind(this);
        this.messages = [];
        this.indexOnlineMessages = [];
        this.onlineMessages = [];
        this.convId = null;
    }

    componentDidMount() {
        var callback = (data, convId) => {
            if (!data) {
                data = [];
            }
            if (convId) {
                this.convId = convId;
            } else {
                this.convId = this.props.id;
            }
            this.messages = data;
            this.setState({
                messages: GiftedChat.append(this.messages, this.onlineMessages),
            });
        }
        serverSrv.onServerTyping(this.onFriendType);
        if (this.props.isContact == true) {
            serverSrv.GetConvByContact(callback, this.props.id, this.props.phoneNumber, this.props.publicInfo.fullName);
        } else {
            serverSrv.GetConv(callback, this.props.id);
        }
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    onFriendType(msg) {
        if (msg.from == serverSrv._uid) {
            return;
        }
        if (!this.messages) {
            this.messages = [];
        }
        if (msg.mid) {
            msg._id = msg.mid;
            msg.id = msg.mid;
        }
        if (!msg.id) {
            msg.id = this.guid();
        }
        if (!msg._id) {
            msg._id = msg.id;
        }

        if (!msg.user) {
            msg.user = serverSrv._myFriendsJson[msg.from];
        }
        msg.text = msg.content;
        if (!this.indexOnlineMessages[msg._id]) { //new message
            this.indexOnlineMessages[msg._id] = msg;
            this.onlineMessages.push(this.indexOnlineMessages[msg._id]);
        } else {
            this.indexOnlineMessages[msg._id].text = msg.content;
            this.indexOnlineMessages[msg._id].content = msg.content;
            if (!msg.content || msg.content.length == 0) {
                this._messageId = null;
                this.onlineMessages.splice(this.onlineMessages.indexOf(this.indexOnlineMessages[msg._id]), 1);
                delete this.indexOnlineMessages[msg._id];
            }
        }
        if (msg.sendTime) {
            this.onSend(msg);
        } else {
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(this.messages, this.onlineMessages),
                };
            });
        }
    }

    onSend(messages = []) {
        try {
            if (!messages.forEach) {
                messages = [messages];
            }
            for (let msg of messages) {
                if (msg.createdAt) {
                    msg.sendTime = moment(msg.createdAt).format();
                } else {
                    msg.createdAt = moment(msg.sendTime).format();
                }
                if (msg._id.indexOf('temp-id') >= 0) {
                    msg._id = this._messageId;
                    msg.id = this._messageId;
                    msg.from = serverSrv._uid;
                    msg.createdAt = msg.sendTime;
                    msg.content = msg.text;
                    msg.convId = this.convId;
                    serverSrv.saveNewMessage(msg);
                }
                
                msg.user = serverSrv._myFriendsJson[msg.user._id];
                this.messages.splice(0, 0, msg); //push
                this.onlineMessages = this.onlineMessages.filter((o_msg) => {
                    return o_msg.id != msg.id;
                });
                //this.onlineMessages.splice(this.onlineMessages.indexOf(msg), 1);
            }
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(this.messages, this.onlineMessages),
                };
            });
        } catch (error) {
            console.log(error);
        }
        this._messageId = null;
    }

    // convertChatObjToDbObj(msg) {
    //     try {
    //         msg.mid = msg._id;
    //     } catch (error) {
    //     }
    // }

    onType(text) {
        if (this._messageId == null) {
            this._messageId = this.guid();
        }
        var msg = {
            mid: this._messageId,
            id: this._messageId,
            _id: this._messageId,
            convId: this.convId,
            isEncrypted: false,
            lastTypingTime: Date.now(),
            from: serverSrv._uid,
            content: text
        };
        serverSrv.Typing(msg);
        msg.user = serverSrv._myFriendsJson[msg.from];
        if (!this.indexOnlineMessages[msg._id]) { //new message
            this.indexOnlineMessages[msg._id] = msg;
            this.onlineMessages.push(this.indexOnlineMessages[msg.id]);
        } else {
            this.indexOnlineMessages[msg._id].text = msg.content;
            this.indexOnlineMessages[msg._id].content = msg.content;
            if (!msg.content || msg.content.length == 0) {
                this._messageId = null;
                this.onlineMessages.splice(this.onlineMessages.indexOf(this.indexOnlineMessages[msg._id]), 1);
                delete this.indexOnlineMessages[msg._id];
            }
        }
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(this.messages, this.onlineMessages),
            };
        });
    }

    render() {
        return (
            <GiftedChat
                userName={this.props.groupName}
                userPicture={this.props.groupPicture}
                messages={this.state.messages}
                onSend={this.onSend}
                onType={this.onType}
                user={{
                    _id: serverSrv._uid,
                }}
                />
        );
    }
}

const styles = StyleSheet.create({
    chatRoomMain: {
        flex: 1,
        flexDirection: 'column'

    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 52
    },
    HeaderText: {
        fontSize: 20,
        marginLeft: 13
    },
    Header: {
        flex: 1,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: '#9933FF',
        shadowColor: "#000000",
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    viewImg: {
        borderColor: 'black',
        elevation: 3,
        borderRadius: 4,
    },
    thumb: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 65,
        height: 65,
        marginLeft: 15
    },
    textName: {
        paddingLeft: 10,
        color: 'black',
        alignSelf: 'flex-start'
    },
    icon: {
        fontSize: 30,
        padding: 6,
        paddingBottom: 10,
    },
    textArea: {
        height: 40,
        marginTop: 6,
        padding: 4,
        fontSize: 15,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#323333',
        flex: 1,
        marginBottom: 6,
    }
});