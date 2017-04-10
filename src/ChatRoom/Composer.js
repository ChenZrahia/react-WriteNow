import React from 'react';
import { Container, Content, Icon } from 'native-base';
import {
  Animated,
  InteractionManager,
  Platform,
  StyleSheet,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Text
} from 'react-native';
import EmojiPicker from 'react-native-simple-emoji-picker';
import emoji from 'emoji-datasource';
import ActionSheet from '@exponent/react-native-action-sheet';
import dismissKeyboard from 'react-native-dismiss-keyboard';

var ErrorHandler = require('../../ErrorHandler');

// const EmojiPicker = require('react-native-emoji-picker');
// const { EmojiOverlay } = require('react-native-emoji-picker');
export default class Composer extends React.Component {
  constructor(props) {
    super(props);
    try {
      this.state = {
        showPicker: false,
      };
    } catch (e) {
      ErrorHandler.WriteError('Composer.js => constructor', e);
    }
  }

    onChange(e) { //add by rugbin 24.3.17 -for auto size the height
    const contentSize = e.nativeEvent.contentSize;
    if (!this.contentSize) {
      this.contentSize = contentSize;
      this.props.onInputSizeChanged(this.contentSize);
    } else if (this.contentSize.width !== contentSize.width || this.contentSize.height !== contentSize.height) {
      this.contentSize = contentSize;
      this.props.onInputSizeChanged(this.contentSize);
    }
  }

  onChangeText(text) { //add by rugbin 24.3.17 -for auto size the height
    this.props.onTextChanged(text);
  }

  _emojiSelected(emoji) {
    try {
      this.setState({ showPicker: false });
      this.props.changeText(emoji);
    } catch (e) {
      ErrorHandler.WriteError('Composer.js => _emojiSelected', e);
    }
  }

  render() {
    try {
      if (this.state.showPicker === true) {
        return (
          <View style={styles.cont} >
            <Modal
              style={{ backgroundColor: 'red' }}
              transparent={false}
              onRequestClose={() => { console.log('modal closed') } }
              >
              <View style={styles.viewEmoji}>
                <View style={styles.container}>
                  <EmojiPicker
                    onPick={emoji => { this._emojiSelected(emoji) } } />
                </View>
              </View>
            </Modal>
          </View>
        );
      }

      return (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => this.setState({
            showPicker: true
          })}>
            <View>
              <Icon name='md-happy' style={styles.icon} />
            </View>
          </TouchableOpacity>
          <TextInput
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.placeholderTextColor}
            multiline={this.props.multiline}
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

// onChangeText = {(title) => {this.setState({text: title})}}

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
  placeholder: 'Type a message...',
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
