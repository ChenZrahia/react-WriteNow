import React from 'react';
import {
  Animated,
  InteractionManager,
  Platform,
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  ListView
} from 'react-native';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
var ErrorHandler = require('../../ErrorHandler');
import Toast from 'react-native-root-toast';
import SGListView from 'react-native-sglistview';
import ActionSheet from '@exponent/react-native-action-sheet';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import moment from 'moment/min/moment-with-locales.min';
import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';
import renderIf from '../../plugins/renderIf';
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
var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var serverSrv = require('../../Services/serverSrv');
var RSAKey = require('react-native-rsa');
var generalStyles = require('../../styles/generalStyle');
var liveSrv = require('../../Services/liveSrv');

const MIN_COMPOSER_HEIGHT = Platform.select({
  ios: 33,
  android: 41,
});
const MAX_COMPOSER_HEIGHT = 100;
const MIN_INPUT_TOOLBAR_HEIGHT = 44;

export default class GiftedChat extends React.Component {
  constructor(props) {
    try {
      super(props);
      Event.on('LoadNewChat', () => {
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
      this._numOfInvalidPassword = 0;
      this._blockStartTime = null;
      this.state = {
        isInitialized: false, // initialization will calculate maxHeight before rendering the chat
        imageVisible: false,
        showMenu: false,
        encryptedVisible: false,
        multiline: true,
        encryptedMessageText: '',
        height: 0,
        onlineMessages: this._onlineMessages,
        onlineMessagesIds: this._onlineMessagesIds,
        decryptedMessageVisible: false,
        DecryptedMessageText: '',
        placeHolderEncrypted: '',
        placeHolderDecrypted: 'Enter Your Password',
        validate: true,
        headerTextEncrypted: 'Password Validation',
        headerTextDecrypted: 'Password Validation',
        secureTextEntry: true,
        mid: "",
        encryptedPassword: '',
        decryptedsecureTextEntry: true,
        placeholderTextColor: '#b2b2b2',
        onlineStatus: '-',
        isEmojiOpen: false
      };

      this.decryptedMessage = this.decryptedMessage.bind(this);
      this.serverTyping = this.serverTyping.bind(this);
      this.openEmojiModal = this.openEmojiModal.bind(this);
      Event.removeAllListeners('serverTyping');
      Event.on('serverTyping', this.serverTyping);
      Event.removeAllListeners('openEmojiModal');
      Event.on('openEmojiModal', this.openEmojiModal);
      Event.removeAllListeners('decryptedMessage');
      Event.on('decryptedMessage', this.decryptedMessage);
      setTimeout(() => {
        try {
          serverSrv.socket.on("onlineStatusChanged", (data) => {
            if (data.isOnline == true && !this.props.isGroup) {
              this.setState({ onlineStatus: 'Online' });
            } else if (!this.props.isGroup) {
              this.setState({ onlineStatus: 'Offline' });
            } else {
              this.setState({ onlineStatus: '-' });
            }
          });
        } catch (error) {
            ErrorHandler.WriteError('GiftedChat.js => constructor => setTimeout', error);
        }
      }, 100);

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
      this.CallFriend = this.CallFriend.bind(this);
      this.VedioCallFriend = this.VedioCallFriend.bind(this);
      this.invertibleScrollViewProps = {
        inverted: true,
        keyboardShouldPersistTaps: "always",
        onTouchStart: this.onTouchStart,
        onTouchMove: this.onTouchMove,
        onTouchEnd: this.onTouchEnd,
        onKeyboardWillShow: this.onKeyboardWillShow,
        onKeyboardWillHide: this.onKeyboardWillHide,
        onKeyboardDidShow: this.onKeyboardDidShow,
        onKeyboardDidHide: this.onKeyboardDidHide,
      };
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => constructor', error);
    }
  }

  static append(currentMessages = [], messages) {
    try {
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
      var allMessages = messages.concat(currentMessages);
      return allMessages;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => append', error);
    }
  }

  static prepend(currentMessages = [], messages) {
    try {
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
      return currentMessages.concat(messages);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => prepend', error);
    }
  }

  getChildContext() {
    try {
      return {
        actionSheet: () => this._actionSheetRef,
        getLocale: this.getLocale,
      };
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getChildContext', error);
    }
  }

  componentWillMount() {
    try {
      this.setIsMounted(true);
      this.initLocale();
      this.initMessages(this.props.messages);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => componentWillMount', error);
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    try {
      this.setIsMounted(false);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => componentWillUnmount', error);
    }
  }

  componentWillReceiveProps(nextProps = {}) {
    try {
      this.initMessages(nextProps.messages);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => componentWillReceiveProps', error);
    }
  }

  initLocale() {
    try {
      if (this.props.locale === null || moment.locales().indexOf(this.props.locale) === -1) {
        this.setLocale('en');
      } else {
        this.setLocale(this.props.locale);
      }
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => initLocale', error);
    }
  }

  initMessages(messages = []) {
    try {
      this.setMessages(messages);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => initMessages', error);
    }
  }

  setLocale(locale) {
    try {
      this._locale = locale;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setLocale', error);
    }
  }

  getLocale() {
    try {
      return this._locale;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getLocale', error);
    }
  }

  setMessages(messages) {
    try {
      this._messages = messages;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setMessages', error);
    }
  }

  getMessages() {
    try {
      return this._messages;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getMessages', error);
    }
  }

  setMaxHeight(height) {
    try {
      this._maxHeight = height;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setMaxHeight', error);
    }
  }

  getMaxHeight() {
    try {
      return this._maxHeight;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getMaxHeight', error);
    }
  }

  setKeyboardHeight(height) {
    try {
      this._keyboardHeight = height;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setKeyboardHeight', error);
    }
  }

  getKeyboardHeight() {
    try {
      return this._keyboardHeight;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getKeyboardHeight', error);
    }
  }

  setBottomOffset(value) {
    try {
      this._bottomOffset = value;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setBottomOffset', error);
    }
  }

  getBottomOffset() {
    try {
      return this._bottomOffset;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getBottomOffset', error);
    }
  }

  setIsFirstLayout(value) {
    try {
      this._isFirstLayout = value;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setIsFirstLayout', error);
    }
  }

  getIsFirstLayout() {
    try {
      return this._isFirstLayout;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getIsFirstLayout', error);
    }
  }

  setIsTypingDisabled(value) {
    try {
      this._isTypingDisabled = value;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setIsTypingDisabled', error);
    }
  }

  getIsTypingDisabled() {
    try {
      return this._isTypingDisabled;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getIsTypingDisabled', error);
    }
  }

  setIsMounted(value) {
    try {
      this._isMounted = value;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setIsMounted', error);
    }
  }

  getIsMounted() {
    try {
      return this._isMounted;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getIsMounted', error);
    }
  }

  getMinInputToolbarHeight() {
    try {
      if (this.props.renderAccessory) {
        return MIN_INPUT_TOOLBAR_HEIGHT * 2;
      }
      return MIN_INPUT_TOOLBAR_HEIGHT;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => getMinInputToolbarHeight', error);
    }
  }

  prepareMessagesContainerHeight(value) {
    try {
      if (this.props.isAnimated === true) {
        return new Animated.Value(value);
      }
      return value;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => prepareMessagesContainerHeight', error);
    }
  }

  onKeyboardWillShow(e) {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardWillShow', error);
    }
  }

  onKeyboardWillHide() {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardWillHide', error);
    }
  }

  onKeyboardDidShow(e) {
    try {
      console.log("onKeyboardDidShow");
      if (Platform.OS === 'android') {
        this.onKeyboardWillShow(e);
      }
      this.setIsTypingDisabled(false);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardDidShow', error);
    }
  }

  onKeyboardDidHide(e) {
    try {
      if (Platform.OS === 'android') {
        this.onKeyboardWillHide(e);
      }
      this.setIsTypingDisabled(false);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardDidHide', error);
    }
  }

  scrollToBottom(animated = true) {
    try {
      this._messageContainerRef.scrollTo({
        y: 0,
        animated,
      });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => scrollToBottom', error);
    }
  }

  onTouchStart() {
    try {
      this._touchStarted = true;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onTouchStart', error);
    }
  }

  onTouchMove() {
    try {
      this._touchStarted = false;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onTouchMove', error);
    }
  }

  // handle Tap event to dismiss keyboard
  onTouchEnd() {
    try {
      if (this._touchStarted === true) {
        dismissKeyboard();
      }
      this._touchStarted = false;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onTouchEnd', error);
    }
  }

  serverTyping(msg) {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => serverTyping', error);
    }
  }

  renderTypingWindow() {
  }

  renderMessages() {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => renderMessages', error);
    }
  }

  onSend(messages = [], shouldResetInputToolbar = false) {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onSend', error);
    }
  }

  resetInputToolbar() {
    try {
      this.setState((previousState) => {
        return {
          text: '',
          composerHeight: MIN_COMPOSER_HEIGHT,
          messagesContainerHeight: this.prepareMessagesContainerHeight(this.getMaxHeight() - this.getMinInputToolbarHeight() - this.getKeyboardHeight() + this.getBottomOffset()),
        };
      });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => resetInputToolbar', error);
    }
  }

  calculateInputToolbarHeight(newComposerHeight) {
    try {
      return newComposerHeight + (this.getMinInputToolbarHeight() - MIN_COMPOSER_HEIGHT);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => calculateInputToolbarHeight', error);
    }
  }

  onType(e) {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => onType', error);
    }
  }

  changeText = (data) => {
    try {
      Event.trigger('imojiType', this.state.text + data, false);
      this.setState({ text: this.state.text + data });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => changeText', error);
    }
  }

  renderInputToolbar() {
    try {
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
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => renderInputToolbar', error);
    }
  }

  renderChatFooter() {
    try {
      if (this.props.renderChatFooter) {
        const footerProps = {
          ...this.props,
        };
        return this.props.renderChatFooter(footerProps);
      }
      return null;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => renderChatFooter', error);
    }
  }

  renderLoading() {
    try {
      if (this.props.renderLoading) {
        return this.props.renderLoading();
      }
      return null;
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => renderLoading', error);
    }
  }

  setEncryptedVisible(visible) {
    try {
      this.setState({
        encryptedMessageText: '',
        placeHolderEncrypted: 'Enter Your Password',
        headerTextEncrypted: "Password Validation",
        secureTextEntry: true,
        validate: true,
        encryptedVisible: visible
      });
    }
    catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => setEncryptedVisible', error);
    }
  }

  menuOption() {
    try {
      this.setState({ showMenu: !this.state.showMenu });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => menuOption', error);
    }
  }

  newList() {
    try {
      this.setState({ showMenu: !this.state.showMenu });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => newList', error);
    }
  }

  guid() {
    try {
      function s4() {
        try {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        } catch (error) {
          ErrorHandler.WriteError('GiftedChat.js => s4', error);
        }
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => guid', error);
    }
  }

  encryptedMessageFunc(message) {
    try {
      var password = this.state.encryptedPassword;
      this.setState({
        encryptedMessageText: '',
        placeHolderEncrypted: 'Enter Your Password',
        headerTextEncrypted: "Password Validation",
        secureTextEntry: true,
        validate: true,
      });
      // Encrypt with aes
      var messageId = this.guid();
      // Encrypt
      var ciphertext = CryptoJS.AES.encrypt(this.state.encryptedMessageText, password);

      var msgSaveInPhone = {
        mid: messageId,
        isEncrypted: true,
        lastTypingTime: Date.now(),
        from: serverSrv._uid,
        content: ciphertext.toString()
      };
      Event.trigger('encryptedMessage', msgSaveInPhone, true);

      var rsa = new RSAKey();
      var friendPublicKey = serverSrv._myFriendPublicKey;
      rsa.setPublicString(friendPublicKey);
      var encrypedMessage = rsa.encryptWithPublic(this.state.encryptedMessageText); // decrypted == originText
      var msg = {
        mid: messageId,
        isEncrypted: true,
        lastTypingTime: Date.now(),
        from: serverSrv._uid,
        content: encrypedMessage
      };
      Event.trigger('encryptedMessage', msg, false);
      this.setState({ encryptedMessageText: '' });
      this.setEncryptedVisible(!this.state.encryptedVisible);
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => encryptedMessageFunc', error);
    }
  }

  tryToDecrypt(password) {
    try {
      var min = 0;
      if (this._blockStartTime != null) {
        min = (Date.now() - this._blockStartTime);
      }
      if (min > 0 && min < 5) {
        var toast = Toast.show("You blocked for " + min + " minute", {
          duration: Toast.durations.LONG,
          position: 150,//Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0
        });
        return;
      } else {
        this._blockStartTime = null;
      }

      var hash = CryptoJS.SHA256(password);
      var hashFromServer = serverSrv._hashPassword;
      if (hash.toString() == hashFromServer.toString()) {
        serverSrv.GetEncryptedMessage_ById(this.state.mid, (result) => {
          try {
            var ciphertext = result.content;
            if (result.from == serverSrv._uid) {
              var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), password);
              var plaintext = bytes.toString(CryptoJS.enc.Utf8);
              this.setState({
                DecryptedMessageText: plaintext,
              })
            }
            else if (result.from != serverSrv._uid) {
              var rsa = new RSAKey();
              var pKey = serverSrv._privateKey;
              rsa.setPrivateString(pKey);
              var encrypedMessage = rsa.decryptWithPrivate(ciphertext);
              this.setState({
                DecryptedMessageText: encrypedMessage,
              })

            }
            this.setState({
              decryptedsecureTextEntry: false,
              placeHolderDecrypted: '',
              headerTextDecrypted: "Message Decrypted Successfully",
              encryptedPassword: '',

            });
          } catch (error) {
            ErrorHandler.WriteError('GiftedChat.js => GetEncryptedMessage_ById => catch', error);
          }
        });
      }
      else {
        if (this._numOfInvalidPassword < 4) {
          this._numOfInvalidPassword++;
          var toast = Toast.show("Invalid Password! (" + this._numOfInvalidPassword + ")", {
            duration: Toast.durations.LONG,
            position: 150,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0
          });
        } else {
          this._numOfInvalidPassword = 0;
          this._blockStartTime = Date.now();
          var toast = Toast.show("Invalid Password! You blocked for 5 minute  ", {
            duration: Toast.durations.LONG,
            position: 150,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0
          });
        }
        this.setState({
          decryptedsecureTextEntry: true,
          DecryptedMessageText: '',
          placeHolderDecrypted: "Enter Your Password",
          headerTextDecrypted: "Password Validation",
          encryptedPassword: '',
        });
      }
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => tryToDecrypt', error);
    }
  }

  decryptedMessage(encryptedMessage, _mid) {
    try {
      this.setState({ decryptedMessageVisible: !this.state.decryptedMessageVisible, mid: _mid });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => decryptedMessage', error);
    }
  }

  renderdecryptedMessage() {
    try {
      return (
        <Modal
          transparent={true}
          visible={this.state.decryptedMessageVisible}
          onRequestClose={() => { console.log('decryptedMessage modal closed') }}
        >
          <View style={generalStyles.styles.imageModal}>
            <View style={{ flex: 1 }}>
            </View>
            <View style={generalStyles.styles.encryptedMessageModal}>
              <View style={generalStyles.styles.encryptedMessageHeader}>
                <Text style={{ color: 'white', textAlign: 'left' }}>{this.state.headerTextDecrypted}</Text>
              </View>
              <View style={{ flexDirection: "row", flex: 1, backgroundColor: 'white' }}>
                <TextInput
                  secureTextEntry={this.state.decryptedsecureTextEntry}
                  editable={this.state.decryptedsecureTextEntry}
                  autoCorrect={true}
                  placeholder={this.state.placeHolderDecrypted}
                  placeholderTextColor={this.state.placeholderTextColor}
                  multiline={this.state.multiline}
                  onChangeText={(DecryptedMessageText) => {
                    this.setState({ DecryptedMessageText });
                  }}
                  style={[styles.textInput, { textAlign: 'left', textAlignVertical: 'top', color: 'black' }, { height: Math.max(35, this.state.height) }]}
                  value={this.state.DecryptedMessageText}
                  enablesReturnKeyAutomatically={true}
                  underlineColorAndroid="transparent"
                />
              </View>
              <View style={{ flexDirection: "row", flex: 0.5 }}>

                <TouchableOpacity style={styles.buttonStyle}
                  onPress={() => { this.tryToDecrypt(this.state.DecryptedMessageText) }} >
                  {renderIf(this.state.headerTextDecrypted == "Password Validation")(
                    <Text style={{ color: 'white' }}> Validate  </Text>
                  )}
                  {renderIf(this.state.headerTextDecrypted == "Message Decrypted Successfully")(
                    <Text style={{ color: 'white' }}> Decrypt  </Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 0.6, justifyContent: "center", alignItems: "center" }}>
                  <Image
                    style={{ width: 40, height: 40, padding: 2 }}
                    source={{ uri: 'https://cdn4.iconfinder.com/data/icons/social-productivity-line-art-4/128/security-shield-lock-512.png' }}
                  />
                </View>
                <TouchableOpacity style={styles.buttonStyle}
                  onPress={() =>
                    this.setState({
                      decryptedMessageVisible: !this.state.decryptedMessageVisible,
                      DecryptedMessageText: '',
                      placeHolderDecrypted: "Enter Your Password",
                      headerTextDecrypted: "Password Validation",
                      encryptedPassword: '',
                      decryptedsecureTextEntry: true,
                    })}>
                  <Text style={{ color: 'white' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1 }}>
            </View>
          </View>
        </Modal>
      )
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => decryptedMessage', error);
    }
  }

  checkEncryptedPassword(password) {
    try {
      var hash = CryptoJS.SHA256(password);
      var hashFromServer = serverSrv._hashPassword;
      if (hash && hashFromServer && hash.toString() == hashFromServer.toString()) {
        this.setState({
          encryptedMessageText: '',
          placeHolderEncrypted: 'Type a message',
          headerTextEncrypted: "Encrypt Your Message",
          secureTextEntry: false,
          validate: false,
          encryptedPassword: password,
        });
      }
      else {
        var toast = Toast.show("Invalid Password", {
          duration: Toast.durations.LONG,
          position: 150,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0
        });
        this.setState({
          encryptedMessageText: '',
          placeHolderEncrypted: 'Enter Your Password',
          headerTextEncrypted: "Password Validation",
          secureTextEntry: true,
          validate: true
        });
      }
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => checkEncryptedPassword', error);
    }
  }

  openImageModal(image) {
    try {
      return (
        <Modal
          transparent={true}
          visible={this.state.imageVisible}
          onRequestClose={() => { console.log('image closed') }}
        >
          <TouchableOpacity style={{ flex: 1, alignSelf: 'stretch' }} onPress={() => {
            this.setImageVisible(!this.state.imageVisible)
          }}>
            <View style={generalStyles.styles.imageModal}>
              <Image style={generalStyles.styles.imageInsideModal} source={image} />
            </View>
          </TouchableOpacity>
        </Modal>
      );
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => openImageModal', error);
    }
  }

  encrypteModal() {
    try {
      return (
        <Modal
          transparent={true}
          visible={this.state.encryptedVisible}
          onRequestClose={() => { }}
        >
          <View style={generalStyles.styles.imageModal}>
            <View style={{ flex: 1, minHeight: 50 }}>
            </View>
            <View style={generalStyles.styles.encryptedMessageModal}>
              <View style={generalStyles.styles.encryptedMessageHeader}>
                <Text style={{ color: 'white', textAlign: 'left' }}>{this.state.headerTextEncrypted}</Text>
              </View>
              <View style={{ flexDirection: "row", flex: 1, backgroundColor: 'white' }}>
                <TextInput
                  secureTextEntry={this.state.secureTextEntry}
                  autoCorrect={true}
                  placeholder={this.state.placeHolderEncrypted}
                  placeholderTextColor='#b2b2b2'
                  multiline={this.state.multiline}
                  onChangeText={(encryptedMessageText) => {
                    this.setState({ encryptedMessageText });
                  }}
                  style={[styles.textInput, { textAlign: 'left', textAlignVertical: 'top' }, { height: Math.max(35, this.state.height) }]}
                  value={this.state.encryptedMessageText}
                  enablesReturnKeyAutomatically={true}
                  underlineColorAndroid="transparent"
                />
              </View>
              <View style={{ flexDirection: "row", flex: 0.5 }}>
                <TouchableOpacity style={styles.buttonStyle}
                  onPress={() => {
                    if (this.state.validate) {
                      this.checkEncryptedPassword(this.state.encryptedMessageText)
                    }
                    else {
                      this.encryptedMessageFunc(this.state.encryptedPassword);
                    }
                  }} >

                  {renderIf(this.state.headerTextEncrypted == "Password Validation")(
                    <Text style={{ color: 'white' }}> Validate  </Text>
                  )}
                  {renderIf(this.state.headerTextEncrypted == "Encrypt Your Message")(
                    <Text style={{ color: 'white' }}> Send  </Text>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 0.6, justifyContent: "center", alignItems: "center" }}>
                  <Image
                    style={{ width: 40, height: 40, padding: 2 }}
                    source={{ uri: 'https://cdn4.iconfinder.com/data/icons/social-productivity-line-art-4/128/security-shield-lock-512.png' }}
                  />
                </View>
                <TouchableOpacity style={styles.buttonStyle}
                  onPress={() => { this.setEncryptedVisible(!this.state.encryptedVisible) }} >
                  <Text style={{ color: 'white' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1 }}>
            </View>
          </View>
        </Modal>
      );
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => encrypteModal', error);
    }
  }

  encryptMessage() {
    try {
      this.setState({
        placeHolderEncrypted: "Enter Your Password",
        showMenu: !this.state.showMenu,
        encryptedVisible: !this.state.encryptedVisible
      });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => encryptMessage', error);
    }
  }

  VedioCallFriend() {
    try {
      liveSrv.Connect(this.props.convId, null, false, true, false);
      Actions.Video({ userName: this.props.userName, userPicture: this.props.userPicture, convId: this.props.convId });
      setTimeout(() => {
        Event.trigger('getVideoCall', false);
      }, 100);
      this.setState({ showMenu: !this.state.showMenu });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => VedioCallFriend', error);
    }
  }

  CallFriend() {
    try {
      liveSrv.Connect(this.props.convId);
      Actions.Call({ userName: this.props.userName, userPicture: this.props.userPicture, convId: this.props.convId });
      setTimeout(() => {
        Event.trigger('getCall', false);
      }, 100);
      this.setState({ showMenu: !this.state.showMenu });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => CallFriend', error);
    }
  }

  walkieTalkie() {
    try {
      liveSrv.Connect(this.props.convId, null, false, false, true);
      Actions.PTT({ userName: this.props.userName, userPicture: this.props.userPicture, convId: this.props.convId });
      setTimeout(() => {
        Event.trigger('getPttCall', false);
      }, 100);
      this.setState({ showMenu: !this.state.showMenu });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => walkieTalkie', error);
    }
  }

  settings() {
    try {
      this.setState({ showMenu: !this.state.showMenu });
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => settings', error);
    }
  }

  cancel_chatRoom(lastMessage, lastMessageTime, lastMessageIsEncrypted) {
    try {
      Event.trigger('lastMessage', lastMessage, lastMessageTime, this.props.convId, false, lastMessageIsEncrypted);
      Event.trigger('CloseChatRoom');
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => cancel_chatRoom', error);
    }
  }


  openEmojiModal(isOpen) {
    try {
      if (isOpen) {
        this.setState({ isEmojiOpen: true, messagesContainerHeight: (this.state.messagesContainerHeight * 2) });
      } else {
        this.setState({ isEmojiOpen: false, messagesContainerHeight: (this.state.messagesContainerHeight / 2) });
      }
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => openEmojiModal', error);
    }
  }

  renderEmoji() {
    try {
      var data = "😀 😃 😄 😁 😆 😅 😂 😊 😇 😉 😌 😍 😘 😗 😙 😚 😋 😜 😝 😛 😎 😏 😒 😞 😔 😟 😕 😣 😖 😫 😩 😤 😠 😡 😶 😐 😑 😯 😦 😧 😮 😲 😵 😳 😱 😨 😰 😢 😥 😭 😓 😪 😴 😬 😷 😈 👿 👹 👺 💩 👻 💀 👽 👾 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾 👐 🙌 👏 🙏 👍 👎 👊 ✊ ✌️ 👌 👈 👉 👆 👇 ☝️ ✋ 👋 💪 👄 👅 👂 👃 👣 👀 👤 👥 👶 👦 👧 👨 👩 👱‍ 👱 👴 👵 👲 👳 👮 👷 💂 👩‍ 👨‍ 🍳 🎓 🎤 🏫 🏭 💻 💼 🔧 🔬 🎨 🚒 ✈️ 🚀 👸 👰 👼 🙇 💁‍ 🙅 🙆‍ 🙋 🙎 💇 💆‍ 💃 👯‍ 🚶‍ 🏃 👫 👭 👬 💑 ❤️‍ 👪 👨‍👩‍👧 👩‍👩‍👧‍👦  👨‍👨‍👦 👨‍👨‍👧 👨‍👨‍👧‍👧  👩‍👦 👩‍👧‍👧 👨‍👦 👚 👕 👖 👔 👗 👙 👘 👠 👡";
      data = data.split(' ');
      data = data.filter(Boolean);
      data = data.map((x) => {
        return <TouchableOpacity
          style={{ height: 40 }}
          onPress={() => {
            this.changeText(x);
          }}>
          <Text style={styles.emojiText}>{x}</Text></TouchableOpacity>;
      });
      return <ScrollView style={{ flex: 1 }}><View style={styles.emoji}>{data}</View></ScrollView>
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => renderEmoji', error);
    }
  }

  render() {
    try {
      if (this.state.isInitialized === true) {
        return (
          <View style={styles.chatRoomMain}>
            <View style={generalStyles.styles.appbar}>
              <TouchableOpacity onPress={() => {
                if (this.props.messages && this.props.messages.length > 0) {
                  this.cancel_chatRoom(this.props.messages[0].text, this.props.messages[0].sendTime, this.props.messages[0].isEncrypted);
                }
                dismissKeyboard();
                serverSrv.exitChat(serverSrv._convId);
                Actions.pop();
              }}>
                <Icon name="ios-arrow-back" color="white" size={25} style={{ paddingLeft: 3, paddingRight: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                dismissKeyboard();
                Event.trigger('closeChatRoom');
                Actions.pop();
              }}>
                {renderIf(this.props.isGroup)(
                  <View style={generalStyles.styles.viewImg}>
                    <Image style={generalStyles.styles.thumb} source={this.props.userPicture ? { uri: this.props.userPicture } : require('../../img/group-img.jpg')} />
                  </View>
                )}
                {renderIf(!this.props.isGroup)(
                  <View style={generalStyles.styles.viewImg}>
                    <Image style={generalStyles.styles.thumb} source={this.props.userPicture ? { uri: this.props.userPicture } : require('../../img/user.jpg')} />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={generalStyles.styles.titleHeaderContainer} onPress={() => {
                if (this.props.isGroup) {
                  Actions.GroupProfile(this.props);
                }
                else {
                  Actions.ContactProfile(this.props);
                }
              }}>
                <Text style={generalStyles.styles.titleHeader}>
                  {this.props.userName}
                </Text>
                <Text style={generalStyles.styles.titleOnline}>
                  {this.state.onlineStatus}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ margin: 7 }} onPress={() => {
                Event.trigger('showImagePicker');
              }}>
                <IconMat name="photo-camera" size={25} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={{ margin: 7 }} onPress={() => {
                Event.trigger('showSignature');
              }}>
                <IconMat name="brush" size={25} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={{ margin: 7 }} onPress={() => {
                this.menuOption();
              }}>
                <IconMat name="more-vert" size={25} color="white" />
              </TouchableOpacity>

              {renderIf(this.state.showMenu)(
                <Modal
                  onRequestClose={() => { }}
                  style={{ flex: 1 }}
                  transparent={true}
                >
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                    this.setState({ showMenu: !this.state.showMenu })
                  }}>
                    <View style={{
                      width: 160,
                      height: this.props.isGroup ? 140 : 175,
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: 35,
                      right: 25,
                      elevation: 6,
                    }}
                    >
                      <TouchableOpacity onPress={() => {
                        this.CallFriend();
                      }}>
                        <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                          <IconMat name="call" size={20} color="black" />
                          <Text> Voice Call</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        this.VedioCallFriend();
                      }}>
                        <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                          <IconMat name="videocam" size={20} color="black" />
                          <Text> Video Call</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        this.walkieTalkie();
                      }}>
                        <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                          <IconMat name="speaker-phone" size={20} color="black" />
                          <Text> Walkie-Talkie</Text>
                        </View>
                      </TouchableOpacity>
                      {renderIf(!this.props.isGroup)(
                        <TouchableOpacity onPress={() => {
                          this.encryptMessage();
                        }}>
                          <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                            <IconMat name="lock" size={20} color="black" />
                            <Text> Encrypt Message</Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity onPress={() => {
                        this.settings();
                      }}>
                        <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                          <IconMat name="settings" size={20} color="black" />
                          <Text> Settings</Text>
                        </View>
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
                }}
              >
                {this.renderMessages()}
                {this.renderInputToolbar()}
                {this.renderEmoji()}
              </View>
            </ActionSheet>
            {this.openImageModal(this.imgSelected)}
            {this.encrypteModal()}
            {this.renderdecryptedMessage()}
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
          }}
        >
          {this.renderLoading()}
        </View>
      );
    } catch (error) {
      ErrorHandler.WriteError('GiftedChat.js => render', error);
    }
  }
}

const styles = StyleSheet.create({
  chatRoomMain: {
    flex: 1,
    flexDirection: 'column'
  },
  emoji: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: '#d6d6d6'
  },
  emojiText: {
    fontSize: 30,
    height: 40,
    color: 'black'
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
  renderMessageEncrypted: null,
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
  renderMessageEncrypted: React.PropTypes.func,
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