import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ParsedText from 'react-native-parsed-text';
import renderIf from '../../plugins/renderIf';
import Communications from 'react-native-communications';

var ErrorHandler = require('../../ErrorHandler');

export default class MessageText extends React.Component {
  constructor(props) {
    try {
      super(props);
      this.onUrlPress = this.onUrlPress.bind(this);
      this.onPhonePress = this.onPhonePress.bind(this);
      this.onEmailPress = this.onEmailPress.bind(this);
    } catch (e) {
      ErrorHandler.WriteError('MessageText.js => constructor', e);
    }
  }

  onUrlPress(url) {
    try {
      Linking.openURL(url);
    } catch (e) {
      ErrorHandler.WriteError('MessageText.js => onUrlPress', e);
    }
  }

  onPhonePress(phone) {
    try {
      const options = [
        'Call',
        'Text',
        'Cancel',
      ];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions({
        options,
        cancelButtonIndex,
      },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Communications.phonecall(phone, true);
              break;
            case 1:
              Communications.text(phone);
              break;
          }
        });
    } catch (e) {
      ErrorHandler.WriteError('MessageText.js => onPhonePress', e);
    }
  }

  onEmailPress(email) {
    try {
      Communications.email(email, null, null, null, null);
    } catch (e) {
      ErrorHandler.WriteError('MessageText.js => onEmailPress', e);
    }
  }

  render() {
    try {
      return (
        <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
          <ParsedText
            style={[styles[this.props.position].text, this.props.textStyle[this.props.position]]}
            parse={[
              { type: 'url', style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]), onPress: this.onUrlPress },
              { type: 'phone', style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]), onPress: this.onPhonePress },
              { type: 'email', style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]), onPress: this.onEmailPress },
            ]}
          >
            {this.props.currentMessage.text}
          </ParsedText>
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('MessageText.js => render', e);
    }
  }
}

const textStyle = {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 10,
  marginRight: 10
};

const styles = {
  left: StyleSheet.create({
    container: {
    },
    text: {
      color: 'black',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {
    },
    text: {
      color: 'black', //white
      ...textStyle,
    },
    link: {
      color: 'black', //white
      textDecorationLine: 'underline',
    },
  }),
};

MessageText.contextTypes = {
  actionSheet: React.PropTypes.func,
};

MessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
};

MessageText.propTypes = {
  position: React.PropTypes.oneOf(['left', 'right']),
  currentMessage: React.PropTypes.object,
  containerStyle: React.PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  textStyle: React.PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  linkStyle: React.PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
};
