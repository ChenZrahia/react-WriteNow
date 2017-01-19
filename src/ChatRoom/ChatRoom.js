import React, { Component } from 'react';
import GiftedChat from './GiftedChat';
import { Container, Content } from 'native-base';
import {
    Image,
    ReactNative,
    ListView,
    AppRegistry,
    TouchableOpacity,
    StyleSheet,
    Text,
    TextInput,
    Dimensions,
    ScrollView,
    View,
    NativeModules,
    Modal,
    BackAndroid
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import ImageResizer from 'react-native-image-resizer';
import InputToolbar from './InputToolbar';
import Icon from 'react-native-vector-icons/Ionicons';

var ImagePicker = require('react-native-image-picker');
var serverSrv = require('../../Services/serverSrv');
var generalStyles = require('../../styles/generalStyle');
var ErrorHandler = require('../../ErrorHandler');
var dismissKeyboard = require('dismissKeyboard');
var moment = require('moment');
var Event = require('../../Services/Events');
var Platform = require('react-native').Platform;

export default class ChatRoom extends Component {
    constructor(props) {
        super(props);
        dismissKeyboard();
        try {
            this._messageId = null;
            this.state = {
                messages: [],
                imageVisible: false,
                text: ''
            };
            this.onSend = this.onSend.bind(this);
            this.onType = this.onType.bind(this);
            this.guid = this.guid.bind(this);
            this.onFriendType = this.onFriendType.bind(this);
            this.showImagePicker = this.showImagePicker.bind(this);
            this.sendImageMessage = this.sendImageMessage.bind(this);
            this.LoadNewChat = this.LoadNewChat.bind(this);
            this.messages = [];
            this.indexOnlineMessages = [];
            this.onlineMessages = [];
            this.convId = null;
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => constructor', e);
        }
    }

    componentDidMount() {
        try {
            Event.removeAllListeners('showImagePicker');
            Event.removeAllListeners('showSignature');
            Event.removeAllListeners('sendSegnature');
            Event.removeAllListeners('imojiType');
            Event.removeAllListeners('encryptedMessage');
            Event.on('showImagePicker', this.showImagePicker);
            Event.on('showSignature', this.showSignature);
            Event.on('sendSegnature', this.sendImageMessage);
            Event.on('imojiType', this.onType);
            Event.on('encryptedMessage', this.onSend);
            BackAndroid.addEventListener('hardwareBackPress', () => {
                if (this.convId) {
                    Event.trigger('lastMessage', this.messages[0].text, this.messages[0].sendTime, this.convId, false);
                }
            });
            this.LoadNewChat(this.props.id, this.props.isContact, this.props.id, this.props.phoneNumber, this.props.fullName);
            Event.on('LoadNewChat', this.LoadNewChat);

        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => componentDidMount', e);
        }
    }

    LoadNewChat(convId, isContact, uid, phoneNumber, fullName) {
        try {
            this.messages = [];
            this.indexOnlineMessages = [];
            this.onlineMessages = [];
            this.convId = null;
            this._messageId = this.guid();
            this.setState({
                messages: [],
                imageVisible: false,
                text: ''
            });
            setTimeout(() => {
                if (this.props.publicInfo) {
                    this.setState({ groupName: this.props.publicInfo.fullName });
                } else {
                    this.setState({ groupName: this.props.groupName });
                }
                if (this.props.publicInfo) {
                    this.setState({ groupPicture: this.props.publicInfo.picture });
                } else {
                    this.setState({ groupPicture: this.props.groupPicture });
                }
            }, 100);

            if (convId && !isContact) {
                this.convId = convId;
            }

            var callback = (data, convId) => {
                console.log(data);
                if (!data) {
                    data = [];
                }
                this.messages = data;
                this.convId = convId;
                this.setState({
                    messages: GiftedChat.append(this.messages, this.onlineMessages),
                });
            }
            serverSrv.onServerTyping(this.onFriendType);
            if (convId && convId != null) {
                this.convId = convId;
            } else {
                this.convId = this.props.id;
            }
            if (isContact == true) {
                setTimeout(() => {
                    serverSrv.GetConvByContact(callback, uid, phoneNumber, this.props.publicInfo.fullName);
                }, 100);
            } else {
                serverSrv.GetConv(callback, this.convId);
            }
        } catch (error) {
            ErrorHandler.WriteError('ChatRoom.js => LoadNewChat', error);
        }
    }

    guid() {
        try {
            function s4() {
                try {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                } catch (e) {
                    ErrorHandler.WriteError('ChatRoom.js => s4', e);
                }
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => guid', e);
        }
    }

    showSignature() {
        try {
            Actions.Signature();
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => showSignature', e);
        }
    }

    showImagePicker() {
        try {
            var options = {
                title: 'Select Image',
                storageOptions: {
                    skipBackup: true,
                    path: 'images'
                }
            };
            ImagePicker.showImagePicker(options, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                }
                else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                }
                else if (response.customButton) {
                    console.log('User tapped custom button: ', response.customButton);
                }
                else {
                    // You can display the image using either data...
                    const source = { uri: 'data:image/jpeg;base64,' + response.data, isStatic: true };
                    // or a reference to the platform specific asset location
                    if (Platform.OS === 'ios') {
                        const source = { uri: response.uri.replace('file://', ''), isStatic: true };
                    } else {
                        const source = { uri: response.uri, isStatic: true };
                    }
                    var img = response.data;
                    var img2 = source;
                    console.log(response.uri);
                    ImageResizer.createResizedImage(response.uri, 400, 400, 'JPEG', 100, 0, null).then((resizedImageUri) => {
                        NativeModules.RNImageToBase64.getBase64String(resizedImageUri, (err, base64) => {
                            //this.sendImageMessage('data:image/jpeg;base64,' + base64);
                            this.setState({ imgToMsg: ('data:image/jpeg;base64,' + base64), pathOfImage: resizedImageUri });
                            this.setImageVisible(true);
                            //error check
                        })
                    }).catch((err) => {
                        ErrorHandler.WriteError('ChatRoom.js => showImagePicker => createResizedImage', err);
                    });
                    // this.sendImageMessage('data:image/jpeg;base64,' + response.data);
                }
            });
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => showImagePicker', e);
        }
    };

    setImageVisible(visible) {
        try {
            this.setState({ imageVisible: visible });
        } catch (e) {
            ErrorHandler.WriteError('GiftedChat.js => setImageVisible', e);
        }
    }

    openImageModal(image, pathOfImage) {
        try {
            return (
                <Modal
                    transparent={true}
                    visible={this.state.imageVisible}
                    onRequestClose={() => { console.log('image closed') } }
                    >
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity 
                        style={{top: 15, marginLeft: 295, zIndex:5}}
                        onPress={() => {
                            this.setImageVisible(!this.state.imageVisible);
                        } }>
                            <View style={{ width: 30, height: 30, backgroundColor: 'gray', borderRadius: 15 }}>
                                <Icon name="md-close" size={15} color="white" style={{ alignSelf: 'center', paddingTop: 7 }} />
                            </View>
                        </TouchableOpacity>
                        <Image style={{ width: 300, height: 300, borderRadius: 0, borderWidth: 1, borderColor: 'gray' , zIndex:0}} source={{ uri: image }} />
                        <View style={{ width: 300, flexDirection: 'row', backgroundColor: 'white', borderColor: 'gray', borderWidth: 1 }}>
                            <TextInput
                                style={{ flex: 1, height: 40, backgroundColor: 'white' }}
                                placeholder="Type a message..."
                                onChangeText={(text) => this.setState({ text })}
                                value={this.state.text}
                                />
                            <TouchableOpacity onPress={() => {
                                this.sendImageMessage(image, this.state.text);
                                this.setImageVisible(!this.state.imageVisible);
                            } }>
                                <Icon name="md-send" size={30} style={{ height: 40, padding: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            );
        } catch (e) {
            ErrorHandler.WriteError('GiftedChat.js => openImageModal', e);
        }
    }

    sendImageMessage(img, _text, _imgPath) {
        try {
            this._messageId = this.guid();
            var msg = {
                mid: this._messageId,
                id: this._messageId,
                _id: this._messageId,
                convId: this.convId,
                isEncrypted: false,
                lastTypingTime: Date.now(),
                sendTime: Date.now(),
                from: serverSrv._uid,
                user: serverSrv._myFriendsJson[serverSrv._uid],
                createdAt: Date.now(),
                text: _text,
                image: img,
                imgPath: _imgPath
            };
            this.onFriendType(msg, true);
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => sendImageMessage', e);
        }
    }

    onFriendType(msg, isImage) {
        try {
            if (msg.from == serverSrv._uid && !isImage) {
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
                msg.user = {
                    _id: serverSrv._myFriendsJson[msg.from].id,
                    name: serverSrv._myFriendsJson[msg.from].publicInfo.fullName
                }
                // msg.user = serverSrv._myFriendsJson[msg.from];
            }

            if (!isImage) {
                msg.text = msg.content;
            }

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
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => onFriendType', e);
        }
    }

    onSend(messages = [],saveLocal) {
        try {
            if (this._messageId == null && !messages.mid) { //for encrypted message
                this._messageId = this.guid();
            }
            if(messages.isEncrypted ==true){
                this._messageId= messages.mid;
                messages._id = this._messageId;
                messages.id = this._messageId;
                messages.convId = this.convId;
                messages.text = messages.content;
                if(messages.from == serverSrv._uid){
                    messages.createdAt = Date.now();
                }
                else{
                    messages.createdAt = messages.sendTime;
                }
            }
            if (!messages.forEach) {
                messages = [messages];
            }
            if (this._messageId == null) {
                this._messageId = this.guid();
            }
            for (let msg of messages) {
                if (msg.createdAt) {
                    msg.sendTime = moment(msg.createdAt).format();
                } else {
                    msg.createdAt = moment(msg.sendTime).format();
                }
                if (msg._id.indexOf('temp-id') >= 0 || (msg.image && msg.from == serverSrv._uid) || msg.isEncrypted == true) {
                    msg._id = this._messageId;
                    msg.id = this._messageId;
                    msg.from = serverSrv._uid;
                    msg.createdAt = msg.sendTime;
                    msg.content = msg.text;
                    msg.convId = this.convId;
                    serverSrv.saveNewMessage(msg,saveLocal);
                    this._messageId = null;
                }

                //serverSrv._myFriendsJson[msg.user._id];
                msg.user = {
                    name: serverSrv._myFriendsJson[msg.from].publicInfo.fullName,
                    _id: serverSrv._myFriendsJson[msg.from].id
                }
                if (saveLocal != false) {
                    this.messages.splice(0, 0, msg); //push
                } 
                this.onlineMessages = this.onlineMessages.filter((o_msg) => {
                    return o_msg.id != msg.id;
                });
                Event.trigger('newMessage', msg);
            }
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(this.messages, this.onlineMessages),
                };
            });
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => onSend', e);
        }
    }

    onType(text, _isEncrypted) {
        try {
            if (this._messageId == null) {
                this._messageId = this.guid();
            }
            var msg = {
                mid: this._messageId,
                id: this._messageId,
                _id: this._messageId,
                convId: this.convId,
                isEncrypted: _isEncrypted,
                lastTypingTime: Date.now(),
                from: serverSrv._uid,
                content: text
            };
            serverSrv.Typing(msg);
            msg.user = {
                name: serverSrv._myFriendsJson[msg.from].publicInfo.fullName,
                _id: serverSrv._myFriendsJson[msg.from].id
            }
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
            this.setState({ messages: GiftedChat.append(this.messages, this.onlineMessages) });
        } catch (e) {
            ErrorHandler.WriteError('ChatRoom.js => onType', e);
        }
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }} >
                <GiftedChat
                    userName={this.state.groupName}
                    convId={this.convId}
                    userPicture={this.state.groupPicture}
                    messages={this.state.messages}
                    onSend={this.onSend}
                    onType={this.onType}
                    convId={this.convId}
                    user={{
                        _id: serverSrv._uid,
                    }}
                    />
                {this.openImageModal(this.state.imgToMsg, this.state.pathOfImage)}
            </View>
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