var React = require('react');
var ReactNative = require('react-native');
var Event = require('../../../Services/Events');

var {Component} = React;

var {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    NativeModules
} = ReactNative;
import { Actions } from 'react-native-router-flux';
import SignatureCapture from 'react-native-signature-capture';
import ImageResizer from 'react-native-image-resizer';

var ErrorHandler = require('../../../ErrorHandler');

export default class Signature extends Component {
    render() {
        try {
            return (
                <View style={{ flex: 1, flexDirection: "column" }}>
                    <SignatureCapture
                        style={[{ flex: 1 }, styles.signature]}
                        ref="sign"
                        onSaveEvent={this._onSaveEvent}
                        onDragEvent={this._onDragEvent}
                        saveImageFileInExtStorage={false}
                        showNativeButtons={false}
                        viewMode={"portrait"} />

                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity style={styles.buttonStyle}
                            onPress={() => { this.saveSign() } } >
                            <Text style={{ color: 'white' }}>Send</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonStyle}
                            onPress={() => { this.resetSign() } } >
                            <Text style={{ color: 'white' }}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonStyle}
                            onPress={() => { this.cancelSign() } } >
                            <Text style={{ color: 'white' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('Signature.js => render', e);
        }
    }

    saveSign() {
        try {
            this.refs["sign"].saveImage();
        } catch (e) {
            ErrorHandler.WriteError('Signature.js => saveSign', e);
        }
    }

    resetSign() {
        try {
            this.refs["sign"].resetImage();
        } catch (e) {
            ErrorHandler.WriteError('Signature.js => resetSign', e);
        }
    }

    cancelSign() {
        try {
            Actions.pop();
        } catch (e) {
            ErrorHandler.WriteError('Signature.js => cancelSign', e);
        }
    }

    _onSaveEvent(result) {
        try {
            //result.encoded - for the base64 encoded png
            //result.pathName - for the file path name
            ImageResizer.createResizedImage('data:image/jpeg;base64,' + result.encoded, 400, 400, 'JPEG', 100, 0, null).then((resizedImageUri) => {
                NativeModules.RNImageToBase64.getBase64String(resizedImageUri, (err, base64) => {
                    Event.trigger('sendSegnature', 'data:image/jpeg;base64,' + base64);
                    //error check
                })
            }).catch((err) => {
                console.log(err);
                console.log('err');
            });
            Actions.pop();
        } catch (e) {
            ErrorHandler.WriteError('Signature.js => _onSaveEvent', e);
        }
    }

    _onDragEvent() {
        try {
            // This callback will be called when the user enters signature
            console.log("dragged");
        } catch (e) {
            ErrorHandler.WriteError('Signature.js => _onDragEvent', e);
        }
    }
}

const styles = StyleSheet.create({
    signature: {
        flex: 1,
        borderColor: '#000033',
        borderWidth: 1,
    },
    buttonStyle: {
        flex: 1, justifyContent: "center", alignItems: "center", height: 35,
        alignSelf: 'flex-end',
        backgroundColor: "#9933FF",
        borderColor: "#9933FF",
        borderRadius: 6,
        borderWidth: 0.5,
        margin: 10,
    }
});