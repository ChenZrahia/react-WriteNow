import React, { Component } from 'react';
import GiftedChat from './GiftedChat';
import { Container, Content, Icon } from 'native-base';
import { Image,
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
    View, } from 'react-native';

var serverSrv = require('../../Services/serverSrv');
var generalStyles = require('../../styles/generalStyle');



export default class ChatRoom extends Component {
    constructor(props) {
        super(props);
        this.state = { messages: [] };
        this.onSend = this.onSend.bind(this);
    }

    componentWillMount() {
        serverSrv.GetAllMyFriends(); //-----
        setTimeout(() => {
            serverSrv.GetConv((data) => {
                if (!data) {
                    data = [];
                }
                this.setState({
                    messages: data,
                });
            }, '938bece7-d81d-4401-93e1-1517263de035');
        }, 1000);

    }
    onSend(messages = []) {
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });
    }
    render() {
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={this.onSend}
                user={{
                    _id: 'e2317111-a84a-4c70-b0e9-b54b910833fa',
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
