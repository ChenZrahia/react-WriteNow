import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
var generalStyles = require('../../styles/generalStyle');
export default class MessageImage extends React.Component {
  render() {
    return (
      <View style={[styles.container, this.props.containerStyle, generalStyles.Styles.viewImg]}>
        <Image
          style={[styles.image, this.props.imageStyle, generalStyles.Styles.ImgChatRoom]}
          source={{ uri: this.props.currentMessage.image }}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
    resizeMode: 'cover',
  },
});

MessageImage.defaultProps = {
  currentMessage: {
    image: null,
  },
  containerStyle: {},
  imageStyle: {},
};

MessageImage.propTypes = {
  currentMessage: React.PropTypes.object,
  containerStyle: View.propTypes.style,
  imageStyle: Image.propTypes.style,
};
