import React, { PropTypes, Component } from 'react';
import {
  Animated,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from 'react-native';

import BaseInput from './BaseInput';
var ErrorHandler = require('../ErrorHandler');

const PADDING = 18;
const ICON_WIDTH = 40;

export default class Fumi extends BaseInput {

  static propTypes = {
    /*
     * This is the icon component you are importing from react-native-vector-icons.
     * import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
     * iconClass={FontAwesomeIcon}
     */
    iconClass: PropTypes.func.isRequired,
    /*
     * Passed to react-native-vector-icons library as name prop
     */
    iconName: PropTypes.string.isRequired,
    /*
     * Passed to react-native-vector-icons library as color prop.
     * Also used as textInput color.
     */
    iconColor: PropTypes.string,
    height: PropTypes.number,
  };

  static defaultProps = {
    height: 48,
    iconColor: '#f50057',
    animationDuration: 300,
  };

  render() {
    try {
      const {
      iconClass,
        iconColor,
        iconName,
        label,
        style: containerStyle,
        inputStyle,
        height: inputHeight,
        labelStyle,
    } = this.props;
      const { focusedAnim, value } = this.state;
      const AnimatedIcon = Animated.createAnimatedComponent(iconClass);
      const ANIM_PATH = PADDING + inputHeight;
      const NEGATIVE_ANIM_PATH = ANIM_PATH * -1;

      return (
        <View style={[containerStyle, styles.container]} onLayout={this._onLayout}>
          <TouchableWithoutFeedback onPress={this._focus}>
            <AnimatedIcon
              name={iconName}
              color={iconColor}
              size={20}
              style={{
                position: 'absolute',
                left: PADDING,
                top: 12,
                height: 40,
                bottom: focusedAnim.interpolate({
                  inputRange: [0, 0.5, 0.51, 0.7, 1],
                  outputRange: [24, ANIM_PATH, NEGATIVE_ANIM_PATH, NEGATIVE_ANIM_PATH, 24],
                }),
                color: focusedAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['#a3a3a3', iconColor, iconColor],
                }),
              }}
            />
          </TouchableWithoutFeedback>
          <View
            style={[styles.separator, {
              height: inputHeight,
              left: ICON_WIDTH + 8,
            }]}
          />
          <TouchableWithoutFeedback onPress={this._focus}>
            <Animated.View style={{
              position: 'absolute',
              left: ICON_WIDTH + PADDING,
              height: inputHeight,
              top: focusedAnim.interpolate({
                inputRange: [0, 0.5, 0.51, 0.7, 1],
                outputRange: [10, ANIM_PATH, NEGATIVE_ANIM_PATH, NEGATIVE_ANIM_PATH, -2],
              }),
            }}>
              <Animated.Text style={[styles.label, labelStyle, {
                fontSize: focusedAnim.interpolate({
                  inputRange: [0, 0.7, 0.71, 1],
                  outputRange: [16, 16, 12, 12],
                }),
                color: focusedAnim.interpolate({
                  inputRange: [0, 0.7],
                  outputRange: ['#696969', '#a3a3a3'],
                }),
              }]}>
                {label}
              </Animated.Text>
            </Animated.View>
          </TouchableWithoutFeedback>
          <TextInput
            ref="input"
            {...this.props}
            style={[styles.textInput, inputStyle, {
              marginLeft: ICON_WIDTH + PADDING,
              color: iconColor,
            }]}
            value={value}
            onBlur={this._onBlur}
            onFocus={this._onFocus}
            onChange={this._onChange}
            underlineColorAndroid={'transparent'}
          />
        </View>
      );
    } catch (error) {
      ErrorHandler.WriteError('Fumi.js => render', error);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingTop: 0,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 18,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    top: 0,
    height: 50
  },
  textInput: {
    flex: 1,
    color: 'black',
    fontSize: 18,
    paddingLeft: 0,
    height: 48,
    marginTop: 0
  },
  separator: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#f50057',
    marginTop: -2
  },
});