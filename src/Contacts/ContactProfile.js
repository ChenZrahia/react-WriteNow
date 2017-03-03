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

export default class ContactProfile extends Component {
    constructor() {
        super();
        try {
            dismissKeyboard();
            this.state = {
                imageVisible: false
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
                    />)
            } else {
                return (<Image style={{ width: 300, height: 300, marginLeft: 5, marginRight: 5, marginBottom: 5 }} source={require('../../img/user.jpg')} />);
            }
        } catch (e) {
            ErrorHandler.WriteError("ContactProfile.js => getImageSource", e);
        }
    }

    render() {
        try {
            return (
                <View style={styles.container}>
                    <ScrollView style={{ flex: 1, backgroundColor: '#e7e7e7' }}>
                        <View style={styles.title}>
                            <TouchableOpacity onPress={() => {
                                Actions.pop();
                            }}>
                                <Icon name="ios-arrow-back" color="white" size={25} style={{ paddingLeft: 3, paddingRight: 8 }} />
                            </TouchableOpacity>
                            <Text style={{ color: 'white', fontSize: 25 }}>
                                {this.props.userName}
                            </Text>
                        </View>
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
                    onRequestClose={() => { console.log('image closed') }}
                >
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
        flex: 1
    },
    title: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#9933FF',
        margin: 5,
        padding: 10,
        alignItems: 'center',
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