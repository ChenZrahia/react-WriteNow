import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import Composer from './Composer';
import Send from './Send';

var ErrorHandler = require('../../ErrorHandler');

export default class InputToolbar extends React.Component {
  constructor(props) {
    try {
      super(props);
    } catch (e) {
      ErrorHandler.WriteError('InputToolbar.js => constructor', e);
    }
  }

  renderActions() {
    try {
      if (this.props.renderActions) {
        return this.props.renderActions(this.props);
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('InputToolbar.js => renderActions', e);
    }
  }

  renderSend() {
    try {
      if (this.props.renderSend) {
        return this.props.renderSend(this.props);
      }
      return <Send {...this.props} />;
    } catch (e) {
      ErrorHandler.WriteError('InputToolbar.js => renderSend', e);
    }
  }

  renderComposer() {
    try {
      if (this.props.renderComposer) {
        return this.props.renderComposer(this.props);
      }

      return (
        <Composer
          {...this.props}
        />
      );
    } catch (e) {
      ErrorHandler.WriteError('InputToolbar.js => renderComposer', e);
    }
  }

  renderAccessory() {
    try {
      if (this.props.renderAccessory) {
        return (
          <View style={[styles.accessory, this.props.accessoryStyle]}>
            {this.props.renderAccessory(this.props)}
          </View>
        );
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('InputToolbar.js => renderAccessory', e);
    }
  }

  render() {
    try {
      return (
        <View style={[styles.container, this.props.containerStyle]}>
          <View style={[styles.primary, this.props.primaryStyle]}>
            {this.renderActions()}
            {this.renderComposer()}
            {this.renderSend()}
          </View>
          {this.renderAccessory()}
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('InputToolbar.js => render', e);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#b2b2b2',
    backgroundColor: '#FFFFFF',
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  accessory: {
    height: 44,
  },
});

InputToolbar.defaultProps = {
  renderAccessory: null,
  renderActions: null,
  renderSend: null,
  renderComposer: null,
  containerStyle: {},
  primaryStyle: {},
  accessoryStyle: {},
};

InputToolbar.propTypes = {
  renderAccessory: React.PropTypes.func,
  renderActions: React.PropTypes.func,
  renderSend: React.PropTypes.func,
  renderComposer: React.PropTypes.func,
  containerStyle: View.propTypes.style,
  primaryStyle: View.propTypes.style,
  accessoryStyle: View.propTypes.style,
};
