import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ListView,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    TextInput
} from 'react-native';
import FitImage from '../../plugins/FitImage';
import { Actions } from 'react-native-router-flux';
import renderIf from '../../plugins/renderIf';
import Icon from 'react-native-vector-icons/Ionicons';

var dismissKeyboard = require('dismissKeyboard');
var ErrorHandler = require('../../ErrorHandler');
var serverSrv = require('../../Services/serverSrv');
var generalStyle = require('../../styles/generalStyle');
var Dimensions = require('Dimensions');
var win = Dimensions.get('window');
var Orientation = require('react-native-orientation');

export default class ContactProfile extends Component {
    constructor() {
        super();
        try {
            dismissKeyboard();
            this.state = {
                imageVisible: false,
                winWidth: win.width
            }
        } catch (e) {
            ErrorHandler.WriteError("ContactProfile.js => constructor", e);
        }
    }

    setImageVisible(visible) {
        try {
            this.setState({ imageVisible: visible });
        } catch (e) {
            ErrorHandler.WriteError("ContactProfile.js => setImageVisible", e);
        }
    }

    getImageSource(img) {
        try {
            if (img) {
                return (
                    <FitImage
                        indicator
                        originalWidth={400}
                        originalHeight={400}
                        style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }}
                        source={{ uri: img }}
                    />);
            } else {
                return (
                    <View style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }}>
                        <Image style={{ width: this.state.winWidth - 10 }} source={require('../../img/user.jpg')} />
                    </View>);
            }
        } catch (e) {
            ErrorHandler.WriteError("ContactProfile.js => getImageSource", e);
        }
    }

    orientationDidChange(orientation) {
        if (orientation == 'LANDSCAPE') {
            this.setState({
                winWidth: win.width
            });
        }
        else {
            this.setState({
                winWidth: win.width
            });
        }
    }

    render() {
        try {
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <TouchableOpacity onPress={() => {
                            Actions.pop();
                        }}>
                            <Icon name="ios-arrow-back" color="white" size={25} style={{ alignSelf: 'flex-start', paddingLeft: 3, paddingRight: 8, paddingTop: 5 }} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={{ alignSelf: 'center', paddingRight: 20, color: 'white', fontSize: 25 }}>
                                {this.props.userName}
                            </Text>
                        </View>
                    </View>
                    <ScrollView style={{ backgroundColor: '#e7e7e7' }}>
                        <TouchableOpacity on Press={() => {
                            this.setImageVisible(true);
                        }}>
                            {this.getImageSource(this.props.userPicture)}
                        </TouchableOpacity>
                    </ScrollView>
                    {this.openImageModal({ uri: this.props.userPicture })}
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("ContactProfile => render", e);
        }
    }

    openImageModal(image) {
        try {
            return (
                <Modal
                    transparent={true}
                    visible={this.state.imageVisible}
                    onRequestClose={() => { console.log('image closed') }
                    }>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                        this.setImageVisible(!this.state.imageVisible)
                    }}>
                        <View style={generalStyle.styles.imageModal}>
                            <Image style={generalStyle.styles.imageInsideModal} source={image} />
                        </View>
                    </TouchableOpacity>
                </Modal>
            );
        } catch (e) {
            ErrorHandler.WriteError("ContactProfile.js => openImageModal", e);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e7e7e7'
    },
    title: {
        flexDirection: 'row',
        backgroundColor: '#9933FF',
        margin: 5,
        padding: 10,
        justifyContent: 'space-between'
    },
    managerTag: {
        borderColor: 'purple',
        borderWidth: 0.5,
        borderRadius: 5,
        marginLeft: 200,
        alignSelf: 'center',
    }
});