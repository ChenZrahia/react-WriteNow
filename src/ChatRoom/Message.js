import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import moment from 'moment';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Day from './Day';

var ErrorHandler = require('../../ErrorHandler');

export default class Message extends React.Component {

  isSameDay(currentMessage = {}, diffMessage = {}) {
    try {
      let diff = 0;
      if (diffMessage.createdAt && currentMessage.createdAt) {
        diff = Math.abs(moment(diffMessage.createdAt).startOf('day').diff(moment(currentMessage.createdAt).startOf('day'), 'days'));
      } else {
        diff = 1;
      }
      if (diff === 0) {
        return true;
      }
      return false;
    } catch (e) {
      ErrorHandler.WriteError('Message.js => isSameDay', e);
    }
  }

  isSameUser(currentMessage = {}, diffMessage = {}) {
    try {
      if (diffMessage.user && currentMessage.user) {
        if (diffMessage.user._id === currentMessage.user._id) {
          return true;
        }
      }
      return false;
    } catch (e) {
      ErrorHandler.WriteError('Message.js => isSameUser', e);
    }
  }

  renderDay() {
    try {
      if (this.props.currentMessage.createdAt) {
        const { containerStyle, ...other } = this.props;
        const dayProps = {
          ...other,
          isSameUser: this.isSameUser,
          isSameDay: this.isSameDay,
        };
        if (this.props.renderDay) {
          return this.props.renderDay(dayProps);
        }
        return <Day {...dayProps} />;
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Message.js => renderDay', e);
    }
  }

  renderBubble() {
    try {
      const { containerStyle, ...other } = this.props;
      const bubbleProps = {
        ...other,
        isSameUser: this.isSameUser,
        isSameDay: this.isSameDay,
      };
      if (this.props.renderBubble) {
        return this.props.renderBubble(bubbleProps);
      }
      return <Bubble {...bubbleProps} />;
    } catch (e) {
      ErrorHandler.WriteError('Message.js => renderBubble', e);
    }
  }

  renderAvatar() {
    try {
      if (this.props.user._id !== this.props.currentMessage.user._id) {
        const { containerStyle, ...other } = this.props;
        const avatarProps = {
          ...other,
          isSameUser: this.isSameUser,
          isSameDay: this.isSameDay,
        };

        return <Avatar {...avatarProps} />;
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Message.js => renderAvatar', e);
    }
  }

  render() {
    try {
      return (
        <View>
          {this.renderDay()}
          <View style={[styles[this.props.position].container, {
            marginBottom: this.isSameUser(this.props.currentMessage, this.props.nextMessage) ? 2 : 10,
          }, this.props.containerStyle[this.props.position]]}>
            {this.props.position === 'left' ? this.renderAvatar() : null}
            {this.renderBubble()}
            {this.props.position === 'right' ? this.renderAvatar() : null}
          </View>
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('Message.js => render', e);
    }
  }
}

const styles = {
  left: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      marginLeft: 8,
      marginRight: 0,
    },
  }),
  right: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginLeft: 0,
      marginRight: 8,
    },
  }),
};

Message.defaultProps = {
  renderAvatar: null,
  renderBubble: null,
  renderDay: null,
  position: 'left',
  currentMessage: {},
  nextMessage: {},
  previousMessage: {},
  user: {},
  containerStyle: {},
};

Message.propTypes = {
  renderAvatar: React.PropTypes.func,
  renderBubble: React.PropTypes.func,
  renderDay: React.PropTypes.func,
  position: React.PropTypes.oneOf(['left', 'right']),
  currentMessage: React.PropTypes.object,
  nextMessage: React.PropTypes.object,
  previousMessage: React.PropTypes.object,
  user: React.PropTypes.object,
  containerStyle: React.PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
};
