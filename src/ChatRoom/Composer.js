import React from 'react';
import { Container, Content, Icon } from 'native-base';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import {
  Animated,
  InteractionManager,
  Platform,
  StyleSheet,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Text,
  BackAndroid
} from 'react-native';
import ActionSheet from '@exponent/react-native-action-sheet';
// var json = require("json!./file.json");
import dismissKeyboard from 'react-native-dismiss-keyboard';
import renderIf from '../../plugins/renderIf';

var Event = require('../../Services/Events');
var ErrorHandler = require('../../ErrorHandler');

export default class Composer extends React.Component {
  constructor(props) {
    super(props);
    try {

      this.state = {
        showPicker: false,
      };
      Event.on('closeChatRoom', () => {
        this.setState({ isEmojiOpen: false });
      });       

    } catch (e) {
      ErrorHandler.WriteError('Composer.js => constructor', e);
    }
  }

  componentDidMount(){
    try {
      BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.state.isEmojiOpen) {
              Event.trigger('openEmojiModal', this.state.isEmojiOpen);
              this.setState({ isEmojiOpen: !this.state.isEmojiOpen });
              return true;
            }
        });
    } catch (error) {
      ErrorHandler.WriteError('Composer.js => componentDidMount', e);
    }
  }

  onChange(e) { //add by rugbin 24.3.17 -for auto size the height
    try {      
      const contentSize = e.nativeEvent.contentSize;
      if (!this.contentSize) {
        this.contentSize = contentSize;
        this.props.onInputSizeChanged(this.contentSize);
      } else if (this.contentSize.width !== contentSize.width || this.contentSize.height !== contentSize.height) {
        this.contentSize = contentSize;
        this.props.onInputSizeChanged(this.contentSize);
      }
    } catch (e) {
      ErrorHandler.WriteError('Composer.js => onChange', e);
    }
  }

  onChangeText(text) { //add by rugbin 24.3.17 -for auto size the height
    try {
      this.props.onTextChanged(text);
    } catch (e) {
      ErrorHandler.WriteError('Composer.js => onChangeText', e);
    }
  }

  render() {
    try {
      if (this.state.showPicker === true) {
        return null;
      }
      return (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => {
            if (!this.state.isEmojiOpen) {
              dismissKeyboard();
              setTimeout(() => {
                Event.trigger('openEmojiModal', this.state.isEmojiOpen);
                this.setState({ isEmojiOpen: !this.state.isEmojiOpen });
            }, 200);
            } else {
              setTimeout(() => {
                Event.trigger('openEmojiModal', this.state.isEmojiOpen);
                this.setState({ isEmojiOpen: !this.state.isEmojiOpen });
                this._mainInput.focus();
            }, 200);
            }
            
          }
          }>
            <View>
              {renderIf(!this.state.isEmojiOpen)(
                <Icon name='md-happy' style={styles.icon} />
              )}
              {renderIf(this.state.isEmojiOpen)(
                <Icon2 name='keyboard' style={styles.icon} />
              )}
            </View>
          </TouchableOpacity>
          <TextInput
            ref={component => this._mainInput = component}
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.placeholderTextColor}
            multiline={this.props.multiline}
            onFocus={() => this.setState({ isEmojiOpen: false })}
            onChange={(e) => {
                this.props.onChange(e);
              }
            }
            style={[styles.textInput, this.props.textInputStyle, {
              height: this.props.composerHeight,
            }]}
            value={this.props.text}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid="transparent"
            {...this.props.textInputProps}
          />
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('Composer.js => render', e);
    }
  }
}

const styles = StyleSheet.create({
  cont: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    borderRadius: 10,
    alignItems: 'center',
  },
  viewEmoji: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0)'
  },

  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',

  },
  emoji: {
    fontSize: 50,
    textAlign: 'center',
    margin: 50,
    color: 'black'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 4
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 16,
    marginTop: Platform.select({
      ios: 6,
      android: 0,
    }),
    marginBottom: Platform.select({
      ios: 5,
      android: 3,
    }),
  },
  icon: {
    marginLeft: 6,
    fontSize: 30,
    padding: 6,
    paddingBottom: 10,
    width: 40

  },
});

Composer.defaultProps = {
  onChange: () => { },
  composerHeight: Platform.select({
    ios: 33,
    android: 41,
  }), // TODO SHARE with GiftedChat.js and tests
  text: '',
  placeholder: 'Type a message',
  placeholderTextColor: '#b2b2b2',
  textInputProps: null,
  multiline: true,
  textInputStyle: {},
  onTextChanged: () => {//add by rugbin 24.3.17 -for auto size the height
  },
  onInputSizeChanged: () => {//add by rugbin 24.3.17 -for auto size the height
  },
};

Composer.propTypes = {
  onChange: React.PropTypes.func,
  composerHeight: React.PropTypes.number,
  text: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  placeholderTextColor: React.PropTypes.string,
  textInputProps: React.PropTypes.object,
  onTextChanged: React.PropTypes.func,//add by rugbin 24.3.17 -for auto size the height
  onInputSizeChanged: React.PropTypes.func,//add by rugbin 24.3.17 -for auto size the height
  multiline: React.PropTypes.bool,
  textInputStyle: TextInput.propTypes.style,
};
