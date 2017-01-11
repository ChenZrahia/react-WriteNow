import React from 'react';
import {
  Animated,
  InteractionManager,
  Platform,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  ListView
} from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import SGListView from 'react-native-sglistview';
import ActionSheet from '@exponent/react-native-action-sheet';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import moment from 'moment/min/moment-with-locales.min';
import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';

import renderIf from '../../plugins/renderIf';
//import Actions from './Actions';
import Avatar from './Avatar';
import Bubble from './Bubble';
import MessageImage from './MessageImage';
import MessageText from './MessageText';
import Composer from './Composer';
import Day from './Day';
import InputToolbar from './InputToolbar';
import LoadEarlier from './LoadEarlier';
import Message from './Message';
import MessageContainer from './MessageContainer';
import Send from './Send';
import Time from './Time';
import IconMat from 'react-native-vector-icons/MaterialIcons';

var Event = require('../../Services/Events');
var generalStyles = require('../../styles/generalStyle');
var liveSrv = require('../../Services/liveSrv');

// Min and max heights of ToolbarInput and Composer
// Needed for Composer auto grow and ScrollView animation
// TODO move these values to Constants.js (also with used colors #b2b2b2)
const MIN_COMPOSER_HEIGHT = Platform.select({
  ios: 33,
  android: 41,
});
const MAX_COMPOSER_HEIGHT = 100;
const MIN_INPUT_TOOLBAR_HEIGHT = 44;

export default class GiftedChat extends React.Component {
  constructor(props) {
    super(props);
    Event.on('LoadNewChat', () => {
      console.log('LoadNewChat - clear input chat!');
      this.setState({ text: '' });

    });





    // default values
    this._isMounted = false;
    this._keyboardHeight = 0;
    this._bottomOffset = 0;
    this._maxHeight = null;
    this._touchStarted = false;
    this._isFirstLayout = true;
    this._isTypingDisabled = false;
    this._locale = 'en';
    this._messages = [];
    this._onlineMessages = [];
    this._onlineMessagesIds = {};
    this.state = {
      isInitialized: false, // initialization will calculate maxHeight before rendering the chat
      imageVisible: false,
      showMenu: false,
      encryptedVisible: false,
      multiline: true,
      encryptedMessageText: '',
      height: 0,
      onlineMessages: this._onlineMessages,
      onlineMessagesIds: this._onlineMessagesIds
    };



    this.serverTyping = this.serverTyping.bind(this);
    Event.on('serverTyping', this.serverTyping);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onKeyboardWillShow = this.onKeyboardWillShow.bind(this);
    this.onKeyboardWillHide = this.onKeyboardWillHide.bind(this);
    this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
    this.onKeyboardDidHide = this.onKeyboardDidHide.bind(this);
    this.onType = this.onType.bind(this);
    this.onSend = this.onSend.bind(this);
    this.getLocale = this.getLocale.bind(this);
    this.cancel_chatRoom = this.cancel_chatRoom.bind(this);

    this.viewProfile = this.viewProfile.bind(this);
    this.invertibleScrollViewProps = {
      inverted: true,
      keyboardShouldPersistTaps: true,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onKeyboardWillShow: this.onKeyboardWillShow,
      onKeyboardWillHide: this.onKeyboardWillHide,
      onKeyboardDidShow: this.onKeyboardDidShow,
      onKeyboardDidHide: this.onKeyboardDidHide,
    };
  }




  static append(currentMessages = [], messages) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    var allMessages = messages.concat(currentMessages);
    return allMessages;
  }

  static prepend(currentMessages = [], messages) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    return currentMessages.concat(messages);
  }

  getChildContext() {
    return {
      actionSheet: () => this._actionSheetRef,
      getLocale: this.getLocale,
    };
  }

  componentWillMount() {
    this.setIsMounted(true);
    this.initLocale();
    this.initMessages(this.props.messages);
  }

  componentWillUnmount() {
    this.setIsMounted(false);
  }

  componentWillReceiveProps(nextProps = {}) {
    this.initMessages(nextProps.messages);
  }

  initLocale() {
    if (this.props.locale === null || moment.locales().indexOf(this.props.locale) === -1) {
      this.setLocale('en');
    } else {
      this.setLocale(this.props.locale);
    }
  }

  initMessages(messages = []) {
    this.setMessages(messages);
  }

  setLocale(locale) {
    this._locale = locale;
  }

  getLocale() {
    return this._locale;
  }

  setMessages(messages) {
    this._messages = messages;
  }

  getMessages() {
    return this._messages;
  }

  setMaxHeight(height) {
    this._maxHeight = height;
  }

  getMaxHeight() {
    return this._maxHeight;
  }

  setKeyboardHeight(height) {
    this._keyboardHeight = height;
  }

  getKeyboardHeight() {
    return this._keyboardHeight;
  }

  setBottomOffset(value) {
    this._bottomOffset = value;
  }

  getBottomOffset() {
    return this._bottomOffset;
  }

  setIsFirstLayout(value) {
    this._isFirstLayout = value;
  }

  getIsFirstLayout() {
    return this._isFirstLayout;
  }

  setIsTypingDisabled(value) {
    this._isTypingDisabled = value;
  }

  getIsTypingDisabled() {
    return this._isTypingDisabled;
  }

  setIsMounted(value) {
    this._isMounted = value;
  }

  getIsMounted() {
    return this._isMounted;
  }

  // TODO
  // setMinInputToolbarHeight
  getMinInputToolbarHeight() {
    if (this.props.renderAccessory) {
      return MIN_INPUT_TOOLBAR_HEIGHT * 2;
    }
    return MIN_INPUT_TOOLBAR_HEIGHT;
  }

  prepareMessagesContainerHeight(value) {
    if (this.props.isAnimated === true) {
      return new Animated.Value(value);
    }
    return value;
  }

  onKeyboardWillShow(e) {
    this.setIsTypingDisabled(true);
    this.setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : e.end.height);
    this.setBottomOffset(this.props.bottomOffset);
    const newMessagesContainerHeight = (this.getMaxHeight() - (this.state.composerHeight + (this.getMinInputToolbarHeight() - MIN_COMPOSER_HEIGHT))) - this.getKeyboardHeight() + this.getBottomOffset();
    if (this.props.isAnimated === true) {
      Animated.timing(this.state.messagesContainerHeight, {
        toValue: newMessagesContainerHeight,
        duration: 210,
      }).start();
    } else {
      this.setState((previousState) => {
        return {
          messagesContainerHeight: newMessagesContainerHeight,
        };
      });
    }
  }

  onKeyboardWillHide() {
    this.setIsTypingDisabled(true);
    this.setKeyboardHeight(0);
    this.setBottomOffset(0);
    const newMessagesContainerHeight = this.getMaxHeight() - (this.state.composerHeight + (this.getMinInputToolbarHeight() - MIN_COMPOSER_HEIGHT));
    if (this.props.isAnimated === true) {
      Animated.timing(this.state.messagesContainerHeight, {
        toValue: newMessagesContainerHeight,
        duration: 210,
      }).start();
    } else {
      this.setState((previousState) => {
        return {
          messagesContainerHeight: newMessagesContainerHeight,
        };
      });
    }
  }

  onKeyboardDidShow(e) {
    if (Platform.OS === 'android') {
      this.onKeyboardWillShow(e);
    }
    this.setIsTypingDisabled(false);
  }

  onKeyboardDidHide(e) {
    if (Platform.OS === 'android') {
      this.onKeyboardWillHide(e);
    }
    this.setIsTypingDisabled(false);
  }

  scrollToBottom(animated = true) {
    this._messageContainerRef.scrollTo({
      y: 0,
      animated,
    });
  }

  onTouchStart() {
    this._touchStarted = true;
  }

  onTouchMove() {
    this._touchStarted = false;
  }

  // handle Tap event to dismiss keyboard
  onTouchEnd() {
    if (this._touchStarted === true) {
      dismissKeyboard();
    }
    this._touchStarted = false;
  }

  serverTyping(msg) {
    if (!this._onlineMessagesIds[msg.id] && msg.content.length > 0) {
      this._onlineMessages.push(msg);
      this._onlineMessagesIds[msg.id] = msg.id;
      this.setState({
        onlineMessages: this._onlineMessages
      });
    } else if (msg.content.length == 0) {
      delete this._onlineMessagesIds[msg.id];
      this._onlineMessages = this._onlineMessages.filter((_msg) => {
        return _msg.id != msg.id;
      });
      this.setState({
        onlineMessages: this._onlineMessages
      });
    } else {
      this._onlineMessages = this._onlineMessages.filter((_msg) => {
        if (_msg.id == msg.id) {
          _msg.content = msg.content;
          _msg.text = msg.text;
        }
        return true;
      });
      this.setState({
        onlineMessages: this._onlineMessages
      });
    }
  }

  renderTypingWindow() {
    // if (this.state.onlineMessages.length > 0) {
    //   var msg = this.state.onlineMessages[0];
    //     return (
    //         <View style={{backgroundColor:'rgba(0,0,0,0.5)', minHeight: 10, position: 'absolute', top: 0, right: 0, left: 0, zIndex: 9}}>
    //             <Text style={{color: 'white'}}>{msg.content}</Text>
    //         </View>
    //     );
    // }
  }

  renderMessages() {
    const AnimatedView = this.props.isAnimated === true ? Animated.View : View;
    return (
      <AnimatedView style={{
        height: this.state.messagesContainerHeight,
      }}>
        <MessageContainer
          {...this.props}

          invertibleScrollViewProps={this.invertibleScrollViewProps}

          messages={this.getMessages()}

          ref={component => this._messageContainerRef = component}
          />
        {this.renderChatFooter()}
      </AnimatedView>
    );
  }

  onSend(messages = [], shouldResetInputToolbar = false) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    messages = messages.map((message) => {
      return {
        ...message,
      user: this.props.user,
      createdAt: new Date(),
      _id: 'temp-id-' + Math.round(Math.random() * 1000000),
      };
});

if (shouldResetInputToolbar === true) {
  this.setIsTypingDisabled(true);
  this.resetInputToolbar();
}

this.props.onSend(messages);
this.scrollToBottom();

if (shouldResetInputToolbar === true) {
  setTimeout(() => {
    if (this.getIsMounted() === true) {
      this.setIsTypingDisabled(false);
    }
  }, 200);
}
  }

resetInputToolbar() {
  this.setState((previousState) => {
    return {
      text: '',
      composerHeight: MIN_COMPOSER_HEIGHT,
      messagesContainerHeight: this.prepareMessagesContainerHeight(this.getMaxHeight() - this.getMinInputToolbarHeight() - this.getKeyboardHeight() + this.getBottomOffset()),
    };
  });
}

calculateInputToolbarHeight(newComposerHeight) {
  return newComposerHeight + (this.getMinInputToolbarHeight() - MIN_COMPOSER_HEIGHT);
}


  onType(e) {
    if (this.getIsTypingDisabled() === true) {
      return;
    }
    let newComposerHeight = null;
    if (e.nativeEvent && e.nativeEvent.contentSize) {
      newComposerHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.min(MAX_COMPOSER_HEIGHT, e.nativeEvent.contentSize.height));
    } else {
      newComposerHeight = MIN_COMPOSER_HEIGHT;
    }

const newMessagesContainerHeight = this.getMaxHeight() - this.calculateInputToolbarHeight(newComposerHeight) - this.getKeyboardHeight() + this.getBottomOffset();
const newText = e.nativeEvent.text;
this.setState((previousState) => {
  return {
    text: newText,
    composerHeight: newComposerHeight,
    messagesContainerHeight: this.prepareMessagesContainerHeight(newMessagesContainerHeight),
  };
});
this.props.onType(newText, false);
  }

changeText = (data) => {
  Event.trigger('imojiType', this.state.text + data, false);
  this.setState({ text: this.state.text + data });
}



  renderInputToolbar() {
    const inputToolbarProps = {
      ...this.props,
    text: this.state.text,
      composerHeight: Math.max(MIN_COMPOSER_HEIGHT, this.state.composerHeight),
        onChange: this.onType,
          onSend: this.onSend,
    };

if (this.props.renderInputToolbar) {
  return this.props.renderInputToolbar(inputToolbarProps);
}
return (
  <InputToolbar
    changeText={this.changeText}
    textInput={this.state.text}
    {...inputToolbarProps}
    />
);
  }

renderChatFooter() {
  if (this.props.renderChatFooter) {
    const footerProps = {
        ...this.props,
      };
  return this.props.renderChatFooter(footerProps);
}
return null;
  }

renderLoading() {
  if (this.props.renderLoading) {
    return this.props.renderLoading();
  }
  return null;
}

setImageVisible(visible) {
  this.setState({ imageVisible: visible });
}
setEncryptedVisible(visible){
  this.setState({ encryptedVisible: visible });
}
menuOption()
{
  this.setState({ showMenu: !this.state.showMenu });
}


openImageModal(image) {
  return (
    <Modal
      transparent={true}
      visible={this.state.imageVisible}
      onRequestClose={() => { console.log('image closed') } }
      >
      <TouchableOpacity style={{ flex: 1, alignSelf: 'stretch' }} onPress={() => {
        this.setImageVisible(!this.state.imageVisible)
      } }>
        <View style={generalStyles.styles.imageModal}>
          <Image style={generalStyles.styles.imageInsideModal} source={image} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}


newList(){
  console.log('new list is working well');
  this.setState({ showMenu: !this.state.showMenu });
}
encryptedMessage(){
  //this.setState({ encryptedMessageText: this.state.encryptedMessageText + message });
  //console.log(this.state.encryptedMessageText);
  //this.props.changeEncryptedMessageText(this.state.encryptedMessageText);
  //Event.trigger('encryptedMessage', this.state.encryptedMessageText);

  Event.trigger('encryptedMessage', this.state.encryptedMessageText, true);
  this.setState({ encryptedMessageText: '' });
  this.setEncryptedVisible(!this.state.encryptedVisible);
}
// <TouchableOpacity style={{ flex: 1, alignSelf: 'stretch' }} onPress={() => {
//   this.setEncryptedVisible(!this.state.encryptedVisible)
// } }>
// </TouchableOpacity>

encrypteModal(){
  return (
    <Modal
      transparent={true}
      visible={this.state.encryptedVisible}
      onRequestClose={() => { console.log('encrypted message modal closed') } }
      >
      <View style={generalStyles.styles.imageModal}>
        <View style={{ flex: 1 }}>
        </View>
        <View style={generalStyles.styles.encryptedMessageModal}>
          <View style={generalStyles.styles.encryptedMessageHeader}>
            <Text style={{ color: 'white', textAlign: 'left' }}>Encrypt Your Message</Text>
          </View>
          <View style={{ flexDirection: "row", flex: 1, backgroundColor: 'white' }}>
            <TextInput
              autoCorrect={true}
              placeholder='Type a message...'
              placeholderTextColor='#b2b2b2'
              multiline={this.state.multiline}
              onChangeText={(encryptedMessageText) => {
                this.setState({ encryptedMessageText });
              }
              }
              style={[styles.textInput, { textAlign: 'left', textAlignVertical: 'top' }, { height: Math.max(35, this.state.height) }]}
              value={this.state.encryptedMessageText}
              enablesReturnKeyAutomatically={true}
              underlineColorAndroid="transparent"
              />
          </View>
          <View style={{ flexDirection: "row", flex: 0.5 }}>
            <TouchableOpacity style={styles.buttonStyle}
              onPress={() => { this.encryptedMessage() } } >
              <Text style={{ color: 'white' }}>Send</Text>
            </TouchableOpacity>
            <View style={{ flex: 0.6, justifyContent: "center", alignItems: "center" }}>
              <Image
                style={{ width: 40, height: 40, padding: 2 }}
                source={{ uri: 'https://cdn4.iconfinder.com/data/icons/social-productivity-line-art-4/128/security-shield-lock-512.png' }}
                />
            </View>
            <TouchableOpacity style={styles.buttonStyle}
              onPress={() => { this.setEncryptedVisible(!this.state.encryptedVisible) } } >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
        </View>
      </View>
    </Modal>
  );

}
encryptMessage(){
  console.log('encrypt Message is working well');
  this.setState({ showMenu: !this.state.showMenu });
  this.setState({ encryptedVisible: !this.state.encryptedVisible });
}
viewProfile(){
  console.log('Voice Call is working well');
  //this.props.userPicture = '';
  liveSrv.Connect(this.props.convId);
  Actions.Call({ userName: this.props.userName, userPicture: this.props.userPicture });
  setTimeout(() => {
    Event.trigger('getCall');
  }, 100);
  this.setState({ showMenu: !this.state.showMenu });
}
settings(){
  console.log('settings is working well');
  this.setState({ showMenu: !this.state.showMenu });
}
walkieTalkie(){
  console.log('walkieTalkie is working well');
  this.setState({ showMenu: !this.state.showMenu });
}

cancel_chatRoom(lastMessage)
{
  Event.trigger('lastMessage', lastMessage, this.props.convId, false);
}


  // renderRowOnlineMsg(){
  //   try {
  //     return ((msg) => <View>
  //       <Text style={{color: 'white'}}>{msg.content}</Text>
  //    </View>);
  //   } catch (error) {

  //   }
  // }

  //   getDataSourceOnlineMsg() {
  //       const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
  //       return ds.cloneWithRows(this.state.onlineMessages);
  //   }

render() {
  if (this.state.isInitialized === true) {
    return (
      <View style={styles.chatRoomMain}>
        <View style={generalStyles.styles.appbar}>
          <TouchableOpacity onPress={() => {
            if (this.props.messages && this.props.messages.length > 0) {
              this.cancel_chatRoom(this.props.messages[0].text);
            }
            Actions.pop();
          } }>
            <Icon name="ios-arrow-back" color="white" size={25} style={{ paddingLeft: 3, paddingRight: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.imgSelected = this.props.userPicture ? { uri: this.props.userPicture } : null
            if (this.imgSelected) {
              this.setImageVisible(true);
            }
          } }>
            <View style={generalStyles.styles.viewImg}>
              <Image style={generalStyles.styles.thumb} source={this.props.userPicture ? { uri: this.props.userPicture } : require('../../img/user.jpg')} />
            </View>
          </TouchableOpacity>
          <Text style={generalStyles.styles.titleHeader}>
            {this.props.userName}
          </Text>
          <TouchableOpacity style={{ margin: 7 }} onPress={() => {
            Event.trigger('showImagePicker');
          } }>
            <IconMat name="photo-camera" size={25} color="rgb(177,100,255)" />
          </TouchableOpacity>

          <TouchableOpacity style={{ margin: 7 }} onPress={() => {
            Event.trigger('showSignature');
          } }>
            <IconMat name="brush" size={25} color="rgb(177,100,255)" />
          </TouchableOpacity>
          <TouchableOpacity style={{ margin: 7 }} onPress={() => {
            this.menuOption();
          } }>
            <IconMat name="more-vert" size={25} color="rgb(177,100,255)" />
          </TouchableOpacity>

          {renderIf(this.state.showMenu)(
            <Modal
              onRequestClose={() => { } }
              style={{ flex: 1 }}
              transparent={true}
              >

              <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                this.setState({ showMenu: !this.state.showMenu })
              } }>
                <View style={{
                  width: 160,
                  height: 170,
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 35,
                  right: 25,
                }}
                  >
                  <TouchableOpacity onPress={() => {
                    this.viewProfile();
                  } }>
                    <Text style={{ margin: 7, marginTop: 7, left: 6 }}>
                      Voice Call
         </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    this.encryptMessage();
                  } }>
                    <Text style={{ margin: 7, left: 6 }}>
                      Encrypt Message
         </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    this.newList();
                  } }>
                    <Text style={{ margin: 7, left: 6 }}>
                      New List
         </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    this.walkieTalkie();
                  } }>
                    <Text style={{ margin: 7, left: 6 }}>
                      Walkie-Talkie
         </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    this.settings();
                  } }>
                    <Text style={{ margin: 7, left: 6 }}>
                      Settings
         </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          )}
          <View style={styles.button} />
        </View>
        <ActionSheet ref={component => this._actionSheetRef = component}>
          <View
            style={styles.container}
            onLayout={(e) => {
              if (Platform.OS === 'android') {
                // fix an issue when keyboard is dismissing during the initialization
                const layout = e.nativeEvent.layout;
                if (this.getMaxHeight() !== layout.height && this.getIsFirstLayout() === true) {
                  this.setMaxHeight(layout.height);
                  this.setState({
                    messagesContainerHeight: this.prepareMessagesContainerHeight(this.getMaxHeight() - this.getMinInputToolbarHeight()),
                  });
                  }
                }
                if (this.getIsFirstLayout() === true) {
                  this.setIsFirstLayout(false);
                }
              } }
              >
              {this.renderMessages()}
              {this.renderInputToolbar()}

            </View>
          </ActionSheet>
          {this.openImageModal(this.imgSelected)}
           {this.encrypteModal()}
        </View>
      );
    }
    return (
      <View
        style={styles.container}
        onLayout={(e) => {
          const layout = e.nativeEvent.layout;
          this.setMaxHeight(layout.height);
          InteractionManager.runAfterInteractions(() => {
            this.setState({
              isInitialized: true,
              text: '',
              composerHeight: MIN_COMPOSER_HEIGHT,
              messagesContainerHeight: this.prepareMessagesContainerHeight(this.getMaxHeight() - this.getMinInputToolbarHeight()),
            });
          });
        } }
        >
        {this.renderLoading()}
      </View>
    );
  }
}


                // <View style={{backgroundColor:'rgba(0,0,0,0.5)', minHeight: 0, maxHeight: 200, position: 'absolute', top: 0, right: 0, left: 0, zIndex: 9}}>
                //     <SGListView style={{ paddingTop: 5, flex: 1 }}
                //             enableEmptySections={true}
                //             dataSource={this.getDataSourceOnlineMsg()}
                //             initialListSize={1}
                //             stickyHeaderIndices={[]}
                //             onEndReachedThreshold={1}
                //             scrollRenderAheadDistance={20}
                //             pageSize={20}
                //             renderRow={this.renderRowOnlineMsg()}
                //             />
                // </View>

const styles = StyleSheet.create({
  chatRoomMain: {
    flex: 1,
    flexDirection: 'column'

  },
  buttonStyle: {
    flex: 0.6, justifyContent: "center", alignItems: "center", height: 35,
    alignSelf: 'flex-end',
    backgroundColor: "#9933FF",
    borderColor: "#9933FF",
    width: 50,
    borderRadius: 6,
    borderWidth: 0.5,
    marginBottom: 5,
    marginLeft: 12,
    marginRight: 12,
    marginTop: 0,
  },
  textInput: {
    flex: 1,
    marginTop: 5,
    padding: 4,
    // marginLeft: 10,
    fontSize: 16,
    lineHeight: 16,
    marginBottom: Platform.select({
      ios: 5,
      android: 3,
    }),
  },
  container: {
    flex: 1,
  },
});

GiftedChat.childContextTypes = {
  actionSheet: React.PropTypes.func,
  getLocale: React.PropTypes.func,
};

GiftedChat.defaultProps = {
  messages: [],
  onSend: () => {
  },
  loadEarlier: false,
  onLoadEarlier: () => {
  },
  locale: null,
  isAnimated: Platform.select({
    ios: true,
    android: false,
  }),
  renderAccessory: null,
  renderActions: null,
  renderAvatar: null,
  renderBubble: null,
  renderFooter: null,
  renderChatFooter: null,
  renderMessageText: null,
  renderMessageImage: null,
  renderComposer: null,
  renderCustomView: null,
  renderDay: null,
  renderInputToolbar: null,
  renderLoadEarlier: null,
  renderLoading: null,
  renderMessage: null,
  renderSend: null,
  renderTime: null,
  user: {},
  bottomOffset: 0,
  isLoadingEarlier: false,
};
//  Modal.propTypes = {

//     onPressBackdrop:this.walkieTalkie() ,

//   },

GiftedChat.propTypes = {
  messages: React.PropTypes.array,
  onSend: React.PropTypes.func,
  loadEarlier: React.PropTypes.bool,
  onLoadEarlier: React.PropTypes.func,
  locale: React.PropTypes.string,
  isAnimated: React.PropTypes.bool,
  renderAccessory: React.PropTypes.func,
  renderActions: React.PropTypes.func,
  renderAvatar: React.PropTypes.func,
  renderBubble: React.PropTypes.func,
  renderFooter: React.PropTypes.func,
  renderChatFooter: React.PropTypes.func,
  renderMessageText: React.PropTypes.func,
  renderMessageImage: React.PropTypes.func,
  renderComposer: React.PropTypes.func,
  renderCustomView: React.PropTypes.func,
  renderDay: React.PropTypes.func,
  renderInputToolbar: React.PropTypes.func,
  renderLoadEarlier: React.PropTypes.func,
  renderLoading: React.PropTypes.func,
  renderMessage: React.PropTypes.func,
  renderSend: React.PropTypes.func,
  renderTime: React.PropTypes.func,
  user: React.PropTypes.object,
  bottomOffset: React.PropTypes.number,
  isLoadingEarlier: React.PropTypes.bool,
};

export {
  GiftedChat,
  Actions,
  Avatar,
  Bubble,
  MessageImage,
  MessageText,
  Composer,
  Day,
  InputToolbar,
  LoadEarlier,
  Message,
  Send,
  Time,
};