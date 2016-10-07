import React, { Component } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { Container, Content, Icon } from 'native-base';

           
import { Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    AppRegistry,
    TouchableOpacity,
    StyleSheet,
    RecyclerViewBackedScrollView,
    Text,
    TextInput,
    Dimensions,
    View, } from 'react-native';
    
   
    


var serverSrv = require('../../Services/serverSrv');

export default class ChatRoom extends Component {  
  constructor(props) {
    super(props);
    this.state = {messages: [], text: ''};
    
  
  }


  render() {
      return (
        <View style={styles.modal}>
        <View style={styles.Header}>
          <View style={styles.viewImg}>
             <Image style={styles.thumb} source={ require('../../img/user.jpg') }/>
         </View>
          <Text style={styles.HeaderText}>Rugbin React Native</Text>
          </View>
        <View style={styles.container}>                 
          <Icon name='md-happy' style={styles.iconSend}/>           
          <TextInput underlineColorAndroid="transparent"
           multiline = {true}
           style={styles.textArea}
          placeholder="Type message..."   
           numberOfLines = {4}
          onChangeText={(text) => this.setState({text})}>
          </TextInput> 
          <Icon name='md-send' style={styles.iconSend}/>   
        </View>
        </View>
                                        
      );
  }



  _onPressIcons(){
      console.log('icons show');
  }

  _onPressSend(){
      console.log('send message..');
  }

}


const styles = StyleSheet.create({
    modal:{
        flex: 1,
         justifyContent:'center',
           alignItems: 'flex-end',
           flexDirection: 'column',
          


    },
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 10,
        paddingTop: 10
        },
        HeaderText: {
            fontSize: 20,
            marginLeft: 13
        },
        Header:{
            flex:1,
             height: 60,

            flexDirection: 'row',
            justifyContent:'flex-start',
            alignItems:'flex-start',
            backgroundColor: '#9933FF',
            shadowColor: "#000000",
            shadowOpacity: 0.8,
            shadowRadius: 2,
        //     shadowOffset: {
        //     height: 100,
        //     width: 100
        // }
        },
      iconSmile: {
          padding: 4,
          fontSize: 50,    
      }, 
      iconSend: {
         fontSize: 50,
         padding: 4,
      },
    viewImg: {
        borderColor: 'black',
        elevation: 3,
        borderRadius: 4,
    },
    thumb: {
        borderRadius: 4,
        borderWidth: 0.5,
        width:65,
        height: 65,
        marginLeft: 15 
        // alignSelf: 'flex-end',
    },
    textName: {
        paddingLeft: 10,
        color: 'black',
        alignSelf: 'flex-start'
    },
      textArea: {
        height: 50,
        width: 1100,
        marginTop: 10,
        marginLeft: 18,
        marginRight: 18,
        padding: 4,
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#323333'
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
   

 

