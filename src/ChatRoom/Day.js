import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import moment from 'moment/min/moment-with-locales.min';
var ErrorHandler = require('../../ErrorHandler');

export default class Day extends React.Component {
  render() {
    try {
      if (!this.props.isSameDay(this.props.currentMessage, this.props.previousMessage)) {
        return (
          <View style={[styles.container, this.props.containerStyle]}>
            <View style={[styles.wrapper, this.props.wrapperStyle]}>
              <Text style={[styles.text, this.props.textStyle]}>
                {moment(this.props.currentMessage.createdAt).locale(this.context.getLocale()).format('ll').toUpperCase()}
              </Text>
            </View>
          </View>
        );
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Day.js => render', e);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  wrapper: {
  },
  text: {
    backgroundColor: 'transparent',
    color: '#b2b2b2',
    fontSize: 12,
    fontWeight: '600',
  },
});

Day.contextTypes = {
  getLocale: React.PropTypes.func,
};

Day.defaultProps = {
  isSameDay: () => { },
  currentMessage: {
    createdAt: null,
  },
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  textStyle: {},
};

Day.propTypes = {
  isSameDay: React.PropTypes.func,
  currentMessage: React.PropTypes.object,
  previousMessage: React.PropTypes.object,
  containerStyle: View.propTypes.style,
  wrapperStyle: View.propTypes.style,
  textStyle: Text.propTypes.style,
};
