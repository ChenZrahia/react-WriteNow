import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

var ErrorHandler = require('../../ErrorHandler');

export default class GiftedAvatar extends React.Component {
  setAvatarColor() {
    try {
      const userName = this.props.user.name || '';
      const name = userName.toUpperCase().split(' ');
      if (name.length === 1) {
        this.avatarName = `${name[0].charAt(0)}`;
      } else if (name.length > 1) {
        this.avatarName = `${name[0].charAt(0)}${name[1].charAt(0)}`;
      } else {
        this.avatarName = '';
      }

      let sumChars = 0;
      for (let i = 0; i < userName.length; i++) {
        sumChars += userName.charCodeAt(i);
      }
      const colors = [
        '#e67e22', // carrot
        '#2ecc71', // emerald
        '#3498db', // peter river
        '#8e44ad', // wisteria
        '#e74c3c', // alizarin
        '#1abc9c', // turquoise
        '#2c3e50', // midnight blue
      ];

      this.avatarColor = colors[sumChars % colors.length];
    } catch (e) {
      ErrorHandler.WriteError('GiftedAvatar.js => setAvatarColor', e);
    }
  }

  renderAvatar() {
    try {
      if (typeof this.props.user.avatar === 'function') {
        return this.props.user.avatar();
      } else if (typeof this.props.user.avatar === 'string') {
        return (
          <Image
            source={{ uri: this.props.user.avatar }}
            style={[defaultStyles.avatarStyle, this.props.avatarStyle]}
          />
        );
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('GiftedAvatar.js => renderAvatar', e);
    }
  }

  renderInitials() {
    try {
      return (
        <Text style={[defaultStyles.textStyle, this.props.textStyle]}>
          {this.avatarName}
        </Text>
      );
    } catch (e) {
      ErrorHandler.WriteError('GiftedAvatar.js => renderInitials', e);
    }
  }

  render() {
    try {
      if (!this.props.user.name && !this.props.user.avatar) {
        return (
          <View style={[
            defaultStyles.avatarStyle,
            { backgroundColor: 'transparent' },
            this.props.avatarStyle,
          ]} />
        )
      }
      if (this.props.user.avatar) {
        return (
          <TouchableOpacity
            disabled={this.props.onPress ? false : true}
            onPress={() => {
              const { onPress, ...other } = this.props;
              this.props.onPress && this.props.onPress(other);
            }}
          >
            {this.renderAvatar()}
          </TouchableOpacity>
        );
      }

      if (!this.avatarColor) {
        this.setAvatarColor();
      }

      return (
        <TouchableOpacity
          disabled={this.props.onPress ? false : true}
          onPress={() => {
            const { onPress, ...other } = this.props;
            this.props.onPress && this.props.onPress(other);
          }}
          style={[
            defaultStyles.avatarStyle,
            { backgroundColor: this.avatarColor },
            this.props.avatarStyle,
          ]}
        >
          {this.renderInitials()}
        </TouchableOpacity>
      );
    } catch (e) {
      ErrorHandler.WriteError('GiftedAvatar.js => render', e);
    }
  }
}

const defaultStyles = {
  avatarStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 3,
  },
  textStyle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontWeight: '100',
  },
};

GiftedAvatar.defaultProps = {
  user: {
    name: null,
    avatar: null,
  },
  onPress: null,
  avatarStyle: {},
  textStyle: {},
};

GiftedAvatar.propTypes = {
  user: React.PropTypes.object,
  onPress: React.PropTypes.func,
  avatarStyle: Image.propTypes.style,
  textStyle: Text.propTypes.style,
};
