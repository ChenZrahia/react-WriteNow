import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import GiftedAvatar from './GiftedAvatar';

var ErrorHandler = require('../../ErrorHandler');

export default class Avatar extends React.Component {
  renderAvatar() {
    try {
      if (this.props.renderAvatar) {
        const {renderAvatar, ...avatarProps} = this.props;
        return this.props.renderAvatar(avatarProps);
      }
      return (
        <GiftedAvatar
          avatarStyle={StyleSheet.flatten([styles[this.props.position].image, this.props.imageStyle[this.props.position]])}
          user={this.props.currentMessage.user}
          />
      );
    } catch (e) {
      ErrorHandler.WriteError('Avatar.js => renderAvatar', e);
    }
  }

  render() {
    try {
      if (this.props.isSameUser(this.props.currentMessage, this.props.nextMessage) && this.props.isSameDay(this.props.currentMessage, this.props.nextMessage)) {
        return (
          <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
            <GiftedAvatar
              avatarStyle={StyleSheet.flatten([styles[this.props.position].image, this.props.imageStyle[this.props.position]])}
              />
          </View>
        );
      }
      return (
        <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
          {this.renderAvatar()}
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('Avatar.js => render', e);
    }
  }
}

const styles = {
  left: StyleSheet.create({
    container: {
      marginRight: 8,
    },
    image: {
      height: 36,
      width: 36,
      borderRadius: 4,
      marginBottom: 5,
    },
  }),
  right: StyleSheet.create({
    container: {
      marginLeft: 8,
    },
    image: {
      height: 36,
      width: 36,
      borderRadius: 4,
      marginBottom: 5,
    },
  }),
};

Avatar.defaultProps = {
  isSameDay: () => { },
  isSameUser: () => { },
  position: 'left',
  currentMessage: {
    user: null,
  },
  nextMessage: {},
  containerStyle: {},
  imageStyle: {},
};

Avatar.propTypes = {
  isSameDay: React.PropTypes.func,
  isSameUser: React.PropTypes.func,
  position: React.PropTypes.oneOf(['left', 'right']),
  currentMessage: React.PropTypes.object,
  nextMessage: React.PropTypes.object,
  containerStyle: View.propTypes.style,
  imageStyle: React.PropTypes.oneOfType([View.propTypes.style, Image.propTypes.style]),
};
