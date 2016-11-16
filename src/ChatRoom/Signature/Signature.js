var React = require('react');
var ReactNative = require('react-native');
var Event = require('../../../Services/Events');

var {Component} = React;

var {
    AppRegistry,
    StyleSheet,
    Text,
    View, TouchableHighlight,
    NativeModules
} = ReactNative;
import { Actions } from 'react-native-router-flux';
import SignatureCapture from 'react-native-signature-capture';
import ImageResizer from 'react-native-image-resizer';
export default class Signature extends Component {
    render() {
        return (
            <View style={{ flex: 1, flexDirection: "column" }}>
                <SignatureCapture
                    style={[{ flex: 2 }, styles.signature]}
                    ref="sign"
                    onSaveEvent={this._onSaveEvent}
                    onDragEvent={this._onDragEvent}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    viewMode={"portrait"} />

                <View style={{ flex: 1, flexDirection: "row" }}>
                    <TouchableHighlight style={styles.buttonStyle}
                        onPress={() => { this.saveSign() } } >
                        <Text>Send</Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={styles.buttonStyle}
                        onPress={() => { this.resetSign() } } >
                        <Text>Reset</Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={styles.buttonStyle}
                        onPress={() => { this.cancelSign() } } >
                        <Text>Cancel</Text>
                    </TouchableHighlight>
                </View>

            </View>
        );
    }

    saveSign() {
        this.refs["sign"].saveImage();
    }

    resetSign() {
        this.refs["sign"].resetImage();
    }

    cancelSign() {
        //close modal
    }

    _onSaveEvent(result) {
        //result.encoded - for the base64 encoded png
        //result.pathName - for the file path name
        ImageResizer.createResizedImage('data:image/jpeg;base64,' + result.encoded, 400, 400, 'JPEG', 100, 0, null).then((resizedImageUri) => {
        console.log(resizedImageUri);
            NativeModules.RNImageToBase64.getBase64String(resizedImageUri, (err, base64) => {
        console.log(33333);
                Event.trigger('sendSegnature', 'data:image/jpeg;base64,' + base64);
                //error check
            })
        }).catch((err) => {
            console.log(err);
            console.log('err');
        });
        Actions.pop();
    }
    _onDragEvent() {
        // This callback will be called when the user enters signature
        console.log("dragged");
    }
}

const styles = StyleSheet.create({
    signature: {
        flex: 1,
        borderColor: '#000033',
        borderWidth: 1,
    },
    buttonStyle: {
        flex: 1, justifyContent: "center", alignItems: "center", height: 30,
        backgroundColor: "#eeeeee",
        margin: 10
    }
});