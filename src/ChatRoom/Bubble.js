import React from 'react';
import {
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Text
} from 'react-native';
var generalStyles = require('../../styles/generalStyle');

var Event = require('../../Services/Events');

import MessageText from './MessageText';
import MessageImage from './MessageImage';
//import MessageEncrypted from './MessageEncrypted';
import Time from './Time';

var ErrorHandler = require('../../ErrorHandler');

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    try {
      this.onLongPress = this.onLongPress.bind(this);
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => constructor', e);
    }
  
    this.renderMessageText = this.renderMessageText.bind(this);
    this.renderMessageEncrypted = this.renderMessageEncrypted.bind(this);
    
   ;
  }
  

  handleBubbleToNext() {
    try {
      if (this.props.isSameUser(this.props.currentMessage, this.props.nextMessage) && this.props.isSameDay(this.props.currentMessage, this.props.nextMessage)) {
        return StyleSheet.flatten([styles[this.props.position].containerToNext, this.props.containerToNextStyle[this.props.position]]);
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => handleBubbleToNext', e);
    }
  }

  handleBubbleToPrevious() {
    try {
      if (this.props.isSameUser(this.props.currentMessage, this.props.previousMessage) && this.props.isSameDay(this.props.currentMessage, this.props.previousMessage)) {
        return StyleSheet.flatten([styles[this.props.position].containerToPrevious, this.props.containerToPreviousStyle[this.props.position]]);
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => handleBubbleToPrevious', e);
    }
  }
greenLock(){
  return(
     <Image
                    style={{ width: 40, height: 40, padding: 5 }}
                    source={{ uri: 'https://thebuntlist.files.wordpress.com/2016/05/ratelockgraphic.png' }}
                    />
  );
}
//  if (this.props.currentMessage.text == "הודעה מוצפנת") {
         
//         return (
//           <View style={{ flexDirection: 'row'}}>
//            <Image
//                     style={{ width: 30, height: 30, padding: 5 }}
//                     source={{ uri: 'https://openclipart.org/image/2400px/svg_to_png/188461/gesloten-slot.png' }}
//           />
//           <MessageText {...messageTextProps} />
//           </View>
//         );
//        }
//        else{




  renderMessageEncrypted() {
    try {
      //this.props.messages[0].text = "Encrypted Message";
      if (this.props.currentMessage.isEncrypted == 1) {
        const {containerStyle, wrapperStyle, ...messageEncrypedProps} = this.props;
       return (
         
          <View >
           <TouchableOpacity onPress={() => {
             console.log(this.props.currentMessage.text + this.props.currentMessage._id);
             Event.trigger('decryptedMessage',this.props.currentMessage.text,this.props.currentMessage._id);
            } }>
         
            <View style={{ flexDirection: 'row'}}>
           <Image
                    style={{ width: 35, height: 35, padding: 5 ,marginTop: 8,marginLeft: 8}}
                    source={require('../../img/lock.png')}
          />
          <Text style={{fontSize: 16,lineHeight: 20,marginTop: 16, marginBottom: 5,marginLeft: 5,marginRight: 5,color: 'black',fontWeight: 'bold'}}>
              Encrypted Message
              </Text>
          </View>
          </TouchableOpacity>
       </View>
           
        );
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => renderMessageEncrypted', e);
    }
  }
  renderMessageText() {
    try {  
      if(this.props.currentMessage.isEncrypted == 1){
         
           this.renderMessageEncrypted();
            return;
      }
      if (this.props.currentMessage.text) {
        const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
        if (this.props.renderMessageText) {
          return this.props.renderMessageText(messageTextProps);
        }
        return <MessageText {...messageTextProps} />;
       }
      
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => renderMessageText', e);
    }
  }



  renderMessageImage() {
    try {
      if (this.props.currentMessage.image) {
        const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;
        if (this.props.renderMessageImage) {
          return this.props.renderMessageImage(messageImageProps);
        }
        return <MessageImage {...messageImageProps} />;
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => renderMessageImage', e);
    }
  }

  renderTime() {
    try {
      if (this.props.currentMessage.createdAt) {
        const {containerStyle, wrapperStyle, ...timeProps} = this.props;
        if (this.props.renderTime) {
          return this.props.renderTime(timeProps);
        }
        return <Time {...timeProps} />;
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => renderTime', e);
    }
  }

  renderCustomView() {
    try {
      if (this.props.renderCustomView) {
        return this.props.renderCustomView(this.props);
      }
      return null;
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => renderCustomView', e);
    }
  }

  onLongPress() {
    try {
      if (this.props.onLongPress) {
        this.props.onLongPress(this.context);
      } else {
        if (this.props.currentMessage.text) {
          const options = [
            'Copy Text',
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
                  Clipboard.setString(this.props.currentMessage.text);
                  break;
              }
            });
        }
      }
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => onLongPress', e);
    }
  }

  render() {
    try {
      return (
        <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
          <View style={[styles[this.props.position].wrapper, this.props.wrapperStyle[this.props.position], this.handleBubbleToNext(), this.handleBubbleToPrevious()]}>
            <TouchableWithoutFeedback
              onLongPress={this.onLongPress}
              {...this.props.touchableProps}
              >
              <View>
                {this.renderCustomView()}
                {this.renderMessageImage()}
                {this.renderMessageEncrypted()}
                {this.renderMessageText()}
                {this.renderTime()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      );
    } catch (e) {
      ErrorHandler.WriteError('Bubble.js => render', e);
    }
  }
}

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 7,
      backgroundColor: '#ddcde5',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
      opacity: 1,
    },
    containerToNext: {
      borderBottomLeftRadius: 0,
    },
    containerToPrevious: {
      borderTopLeftRadius: 0,
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 7,
      backgroundColor: '#e7d3ce',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
      opacity: 1,
    },
    containerToNext: {
      borderBottomRightRadius: 0,
    },
    containerToPrevious: {
      borderTopRightRadius: 0,
    },
  }),
};

Bubble.contextTypes = {
  actionSheet: React.PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageEncrypted: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  isSameUser: () => { },
  isSameDay: () => { },
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
};

Bubble.propTypes = {
  touchableProps: React.PropTypes.object,
  onLongPress: React.PropTypes.func,
  renderMessageImage: React.PropTypes.func,
  renderMessageEncrypted: React.PropTypes.func,
  renderMessageText: React.PropTypes.func,
  renderCustomView: React.PropTypes.func,
  renderTime: React.PropTypes.func,
  isSameUser: React.PropTypes.func,
  isSameDay: React.PropTypes.func,
  position: React.PropTypes.oneOf(['left', 'right']),
  currentMessage: React.PropTypes.object,
  nextMessage: React.PropTypes.object,
  previousMessage: React.PropTypes.object,
  containerStyle: React.PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  wrapperStyle: React.PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  containerToNextStyle: React.PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
  containerToPreviousStyle: React.PropTypes.shape({
    left: View.propTypes.style,
    right: View.propTypes.style,
  }),
};
