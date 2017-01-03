import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';

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
                    onRequestClose={() => { console.log('image closed') } }
                    >
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                        this.setImageVisible(!this.state.imageVisible)
                    } }>
                        <View style={generalStyles.styles.imageModal}>
                            <Image style={generalStyles.styles.imageInsideModal} source={{uri: image}} />
                        </View>
                    </TouchableOpacity>
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
