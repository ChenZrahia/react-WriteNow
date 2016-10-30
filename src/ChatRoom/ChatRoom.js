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
    StatusBar,
    ScrollView,
    View,
} from 'react-native';

var serverSrv = require('../../Services/serverSrv');
var generalStyles = require('../../styles/generalStyle');
var ErrorHandler = require('../../ErrorHandler');

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
        serverSrv.onServerTyping(this.onFriendType);
        //serverSrv.onServerTyping(this.onFriendType);
    }

    componentWillMount() {
        setTimeout(() => {
            serverSrv.GetConv((data) => {
                if (!data) {
                    data = [];
                }
                this.messages = data;
                this.setState({
                    messages: GiftedChat.append(this.messages, this.onlineMessages),
                });
            }, this.props.id);
        }, 1000);

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
            console.log(msg);
            console.log('msg.id--**');
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

        //this.onSend(this.onlineMessages);

        // try {
        //     if (!msg.content || msg.content.length == 0) {
        //         if (this.message[msg.from]) {
        //             this.message[msg.from].content = msg.content;
        //         }
        //         //this.messageId = this.guid();
        //         var index = this.messages.indexOf(this.message[msg.from]);//------
        //         if (index >= 0) {
        //             this.messages.splice(index, 1);
        //         }
        //         delete this.message[msg.from];
        //     }
        //     else if (!this.message[msg.from] || this.messages.indexOf(this.message[msg.from]) < 0) {
        //         this.message[msg.from] = msg;
        //         this.messages.push(this.message[msg.from]);
        //     }
        //     else if (msg.lastTypingTime > this.message[msg.from].lastTypingTime || true) {
        //         this.message[msg.from].content = msg.content;
        //         this.message[msg.from].text = msg.content;
        //     }
        //     if (msg.sendTime) {
        //         this.timeMsgClass(msg);
        //         if (this.message[msg.from] && this.messages.indexOf(this.message[msg.from]) >= 0) {
        //             this.messages[this.messages.indexOf(this.message[msg.from])].sendTime = msg.sendTime;
        //         }
        //         this.messageId = this.guid();
        //         delete this.message[msg.from];
        //     }
        // } catch (e) {
        //     console.log(e);
        //     //this._errorHandlerService.writeError('constructor => typing', e);
        // }
    }

    onSend(messages = []) {
        try {
            if (!messages.forEach) {
                messages = [messages];
            }
            for (let msg of messages) {
                if (msg.createdAt) {
                    msg.sendTime = msg.createdAt;
                } else {
                    msg.createdAt = msg.sendTime;
                }
                if (msg._id.indexOf('temp-id') >= 0) {
                    msg._id = this._messageId;
                    msg.id = this._messageId;
                    msg.from = serverSrv._uid;
                    msg.createdAt = msg.sendTime;
                    msg.content = msg.text;
                    msg.convId = this.props.data;
                    serverSrv.saveNewMessage(msg);
                } 
                console.log(msg);
                console.log('msg');
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
            convId: this.props.data,
            isEncrypted: false,
            lastTypingTime: Date.now(),
            from: serverSrv._uid,
            content: text
        };
        serverSrv.Typing(msg);
        msg.user = { id: '123', name: 'Me', avatar: '' };
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


// export default class ChatRoom extends Component {
//     constructor(props) {
//         super(props);
//         this.state = { messages: [], text: '' };
//     }

//     render() {
//         return (
//             <View style={styles.chatRoomMain}>
//                 <StatusBar barStyle="light-content" />
// <View style={generalStyles.styles.appbar}>
//     <View style={generalStyles.styles.viewImgChatRoom}>
//         <Image style={generalStyles.styles.ImgChatRoom} source={ require('../../img/user.jpg') }/>
//     </View>
//     <Text style={generalStyles.styles.titleHeader}>
//         WriteNow
//     </Text>
//     <View style={styles.button} />
// </View>

//                 <ScrollView
//                     ref={(scrollView) => { _scrollView = scrollView; } }
//                     automaticallyAdjustContentInsets={false}
//                     onScroll={() => { console.log('onScroll!'); } }
//                     scrollEventThrottle={200}
//                     style={generalStyles.styles.scrollView}>
//                 </ScrollView>

//                 <View style={styles.row}>
//                     <Icon name='md-happy' style={styles.icon}/>
//                     <TextInput underlineColorAndroid="transparent"
//                         multiline = {true}
//                         style={styles.textArea}
//                         placeholder="Type message..."
//                         numberOfLines = {4}
//                         onChangeText={(text) => this.setState({ text }) }>
//                     </TextInput>
//                     <Icon name='md-send' style={styles.icon}/>
//                 </View>


//             </View>

//         );
//     }



//     _onPressIcons() {
//         console.log('icons show');
//     }

//     _onPressSend() {
//         console.log('send message..');
//     }

// }


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
        //     shadowOffset: {
        //     height: 100,
        //     width: 100
        // }
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
        // alignSelf: 'flex-end',
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
//   componentWillMount() {
//     this.setState({
//       messages: [
//         {
//           _id: 1,
//           text: 'Hello developer',
//           createdAt: new Date(),
//           user: {
//             _id: 2,
//             name: 'React Native',
//             avatar: 'https://facebook.github.io/react/img/logo_og.png',
//           },
//         },
//       ],
//     });
//   }
//   onSend(messages = []) {
//     this.setState((previousState) => {
//       return {
//         messages: GiftedChat.append(previousState.messages, messages),
//       };
//     });
//   }
//   render() {
//     return (
//       <GiftedChat
//         messages={this.state.messages}
//         onSend={this.onSend}
//         user={{
//           _id: 1,
//         }}
//       />
//     );
//   }
// }



// setTimeout(() => {
//     throw "rugbin";
// }, 20000);
