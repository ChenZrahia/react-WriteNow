import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal
} from 'react-native';
import PhotoView from 'react-native-photo-view';
var ErrorHandler = require('../../ErrorHandler');
var generalStyles = require('../../styles/generalStyle');
var serverSrv = require('../../Services/serverSrv');

export default class MessageImage extends React.Component {
     constructor() {
        super();
         this.state = {
            imageVisible: false
         };
     }

  setImageVisible(visible) {
        try {
            this.setState({ imageVisible: visible });
        } catch (e) {
            ErrorHandler.WriteError('MessageImage.js => setImageVisible', e);
        }
    }

     
  openImageModal(image) {
        try {
            return (
                <Modal
                    transparent={true}
                    visible={this.state.imageVisible == true}
                    onRequestClose={() => { this.setImageVisible(false); } }
                    >
                        <View style={generalStyles.styles.imageModalBlack}>
                          <PhotoView
                            source={{uri: image}}
                            minimumZoomScale={0.5}
                            maximumZoomScale={6}
                            androidScaleType="center"
                            scale={5}
                            style={{flex: 1, width: 1000, height: 1000}}/>
                            {/*<Image style={generalStyles.styles.imageInsideModal} source={{uri: image}} />*/}
                        </View>
                </Modal>
            );
        } catch (e) {
            ErrorHandler.WriteError('MessageImage.js => openImageModal', e);
        }
    }



  render() {
    try {
      return (
        <View style={[styles.container, this.props.containerStyle]} >
        <TouchableOpacity onPress={() => {
          this.setImageVisible(true)
            }}>
         <Image
            style={[styles.image, this.props.imageStyle]}
            source={{ uri: this.props.currentMessage.image }}
            />
            </TouchableOpacity>
          {this.openImageModal(this.props.currentMessage.image)}
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('MessageImage.js => render', e);
    }
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
