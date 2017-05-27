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
var Event = require('../../Services/Events');
import FitImage from '../../plugins/FitImage';


export default class MessageImage extends React.Component {
  constructor() {
    try {
      super();
      this.state = {
        imageVisible: false
      };
      this.onLongPress = this.onLongPress.bind(this);
    } catch (e) {
      ErrorHandler.WriteError("MessageImage.js => constructor", e);
    }
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
              onRequestClose={() => { console.log('image closed') }}
          >
              <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                  this.setImageVisible(!this.state.imageVisible)
              }}>
               <View style={generalStyles.styles.imageModal}>
                            <FitImage style={generalStyles.styles.imageInsideModal}   indicator
                        originalWidth={300}
                        originalHeight={300}
                        source={{ uri: image }} />
            
                  </View>
              </TouchableOpacity>
          </Modal>
      

      );
    } catch (e) {
      ErrorHandler.WriteError('MessageImage.js => openImageModal', e);
    }
  }


  deleteMessage() {
    try {
      Event.trigger('deleteMessage', this.props.currentMessage.image, this.props.currentMessage._id);
    } catch (e) {
      ErrorHandler.WriteError('messagesImage.js => deleteMessage', e);
    };
  }
  onLongPress() {
    try {
      if (this.props.currentMessage.image) {
        if (this.props.currentMessage.from == serverSrv._uid) {
          const options = [
            'Delete Message',
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
                  this.deleteMessage();
                  break;
                case 1:
                  break;
              }
            }
          )
        }
      }
    } catch (e) {
      ErrorHandler.WriteError('messagesImage.js => onLongPress', e);
    }
  }

  render() {
    try {
      return (
        <View style={[styles.container, this.props.containerStyle]} >
          <TouchableOpacity
            onLongPress={this.onLongPress}
            onPress={() => {
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

MessageImage.contextTypes = {
  actionSheet: React.PropTypes.func,
};

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
