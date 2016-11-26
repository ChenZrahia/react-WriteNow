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
  Modal,
} from 'react-native';

import ActionSheet from '@exponent/react-native-action-sheet';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import moment from 'moment/min/moment-with-locales.min';
import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';

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
var ErrorHandler = require('../../ErrorHandler');

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
    try {
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

      this.state = {
        isInitialized: false, // initialization will calculate maxHeight before rendering the chat
        imageVisible: false,

      };

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
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => constructor', e);
    }
  }

  static append(currentMessages = [], messages) {
    try {
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
      var allMessages = messages.concat(currentMessages);
      return allMessages;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => append', e);
    }
  }

  static prepend(currentMessages = [], messages) {
    try {
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
      return currentMessages.concat(messages);
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => prepend', e);
    }
  }

  getChildContext() {
    try {
      return {
        actionSheet: () => this._actionSheetRef,
        getLocale: this.getLocale,
      };
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getChildContext', e);
    }
  }

  componentWillMount() {
    try {
      this.setIsMounted(true);
      this.initLocale();
      this.initMessages(this.props.messages);
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => componentWillMount', e);
    }
  }

  componentWillUnmount() {
    try {
      this.setIsMounted(false);
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => componentWillUnmount', e);
    }
  }

  componentWillReceiveProps(nextProps = {}) {
    try {
      this.initMessages(nextProps.messages);
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => componentWillReceiveProps', e);
    }
  }

  initLocale() {
    try {
      if (this.props.locale === null || moment.locales().indexOf(this.props.locale) === -1) {
        this.setLocale('en');
      } else {
        this.setLocale(this.props.locale);
      }
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => initLocale', e);
    }
  }

  initMessages(messages = []) {
    try {
      this.setMessages(messages);
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => initMessages', e);
    }
  }

  setLocale(locale) {
    try {
      this._locale = locale;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setLocale', e);
    }
  }

  getLocale() {
    try {
      return this._locale;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getLocale', e);
    }
  }

  setMessages(messages) {
    try {
      this._messages = messages;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setMessages', e);
    }
  }

  getMessages() {
    try {
      return this._messages;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getMessages', e);
    }
  }

  setMaxHeight(height) {
    try {
      this._maxHeight = height;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setMaxHeight', e);
    }
  }

  getMaxHeight() {
    try {
      return this._maxHeight;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getMaxHeight', e);
    }
  }

  setKeyboardHeight(height) {
    try {
      this._keyboardHeight = height;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setKeyboardHeight', e);
    }
  }

  getKeyboardHeight() {
    try {
      return this._keyboardHeight;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getKeyboardHeight', e);
    }
  }

  setBottomOffset(value) {
    try {
      this._bottomOffset = value;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setBottomOffset', e);
    }
  }

  getBottomOffset() {
    try {
      return this._bottomOffset;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getBottomOffset', e);
    }
  }

  setIsFirstLayout(value) {
    try {
      this._isFirstLayout = value;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setIsFirstLayout', e);
    }
  }

  getIsFirstLayout() {
    try {
      return this._isFirstLayout;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getIsFirstLayout', e);
    }
  }

  setIsTypingDisabled(value) {
    try {
      this._isTypingDisabled = value;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setIsTypingDisabled', e);
    }
  }

  getIsTypingDisabled() {
    try {
      return this._isTypingDisabled;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getIsTypingDisabled', e);
    }
  }

  setIsMounted(value) {
    try {
      this._isMounted = value;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => setIsMounted', e);
    }
  }

  getIsMounted() {
    try {
      return this._isMounted;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getIsMounted', e);
    }
  }

  // TODO
  // setMinInputToolbarHeight
  getMinInputToolbarHeight() {
    try {
      if (this.props.renderAccessory) {
        return MIN_INPUT_TOOLBAR_HEIGHT * 2;
      }
      return MIN_INPUT_TOOLBAR_HEIGHT;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => getMinInputToolbarHeight', e);
    }
  }

  prepareMessagesContainerHeight(value) {
    try {
      if (this.props.isAnimated === true) {
        return new Animated.Value(value);
      }
      return value;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => prepareMessagesContainerHeight', e);
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
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardWillShow', e);
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
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardWillHide', e);
    }
  }

  onKeyboardDidShow(e) {
    try {
      if (Platform.OS === 'android') {
        this.onKeyboardWillShow(e);
      }
      this.setIsTypingDisabled(false);
    } catch (err) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardDidShow', err);
    }
  }

  onKeyboardDidHide(e) {
    try {
      if (Platform.OS === 'android') {
        this.onKeyboardWillHide(e);
      }
      this.setIsTypingDisabled(false);
    } catch (err) {
      ErrorHandler.WriteError('GiftedChat.js => onKeyboardDidHide', err);
    }
  }

  scrollToBottom(animated = true) {
    try {
      this._messageContainerRef.scrollTo({
        y: 0,
        animated,
      });
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => scrollToBottom', e);
    }
  }

  onTouchStart() {
    try {
      this._touchStarted = true;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => onTouchStart', e);
    }
  }

  onTouchMove() {
    try {
      this._touchStarted = false;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => onTouchMove', e);
    }
  }

  // handle Tap event to dismiss keyboard
  onTouchEnd() {
    try {
      if (this._touchStarted === true) {
        dismissKeyboard();
      }
      this._touchStarted = false;
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => onTouchEnd', e);
    }
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
    } catch (e) {
      ErrorHandler.WriteError('GiftedChat.js => renderMessages', e);
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

  if(shouldResetInputToolbar === true) {
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
    } catch (e) {
  ErrorHandler.WriteError('GiftedChat.js => onSend', e);
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
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => renderInputToolbar', e);
  }
}

calculateInputToolbarHeight(newComposerHeight) {
  try {
    return newComposerHeight + (this.getMinInputToolbarHeight() - MIN_COMPOSER_HEIGHT);
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => calculateInputToolbarHeight', e);
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
    this.props.onType(newText);
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => onType', e);
  }
}

changeText = (data) => {
  try {
    this.setState({ text: this.state.text + data });
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => changeText', e);
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
} catch (e) {
  ErrorHandler.WriteError('GiftedChat.js => renderInputToolbar', e);
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
} catch (e) {
  ErrorHandler.WriteError('GiftedChat.js => renderChatFooter', e);
}
  }

renderLoading() {
  try {
    if (this.props.renderLoading) {
      return this.props.renderLoading();
    }
    return null;
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => renderLoading', e);
  }
}

setImageVisible(visible) {
  try {
    this.setState({ imageVisible: visible });
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => setImageVisible', e);
  }
}

openImageModal(image) {
  try {
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
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => openImageModal', e);
  }
}

render() {
  try {
    if (this.state.isInitialized === true) {
      return (
        <View style={styles.chatRoomMain}>
          <View style={generalStyles.styles.appbar}>
            <TouchableOpacity onPress={() => {
              Actions.pop()
            } }>
              <Icon name="ios-arrow-back" color="white" size={25} style={{ paddingLeft: 3, paddingRight: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              //this.imgSelected = { uri: this.props.userPicture }
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
  } catch (e) {
    ErrorHandler.WriteError('GiftedChat.js => render', e);
  }
}
}


const styles = StyleSheet.create({
  chatRoomMain: {
    flex: 1,
    flexDirection: 'column'

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
