import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TextInput,
    Image,
    View,
    Modal,
    NativeModules,
    TouchableOpacity,
} from 'react-native';
import { Actions } from 'react-native-router-flux'
import Toast from 'react-native-root-toast';
import Fumi from '../../styles/Fumi';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import ImageResizer from 'react-native-image-resizer';

var Event = require('../../Services/Events');
var CryptoJS = require("crypto-js");
var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');
var generalStyles = require('../../styles/generalStyle');
var ErrorHandler = require('../../ErrorHandler');
var serverSrv = require('../../Services/serverSrv');
var disabled = false;
var profileImg = '';
var options = {
    title: 'Select Profile Image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

export default class SignUp extends Component {
    constructor() {
        try {
            super();
            this.state = {
                DisplayName: "",
                PhoneNumber: "",
                Password: "",
                avatarSource: require('../../img/user.jpg'),
                SpinnerVisible: false
            }
        } catch (e) {
            ErrorHandler.WriteError('SignUp.js => constructor', e);
        }
    }

    checkStringPassword_pam(password) {
        try {
            var msg = '';
            if (!password) {
                msg = 'Enter A Password';
            } else if (password.length < 5) {
                msg = 'Password Need To Contain At Least 5 Characters';
            } else if (password.search(/\d/) == -1) {
                msg = 'Password Need To Contain Numbers';
            } else if (password.search(/[a-zA-Z]/) == -1) {
                msg = 'Password Need To Contain Letters';
            // } else if (password.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) == -1) {
            //     msg = 'Password Need To Contain Signs';
             }
            return msg;
        } catch (e) {
            ErrorHandler.WriteError('SignUp.js => checkStringPassword_pam', e);
        }
    }

    componentDidMount() {
    }

    SignUpSubmit = (() => {
        try {
            if (disabled == true) {
                return;
            }
            var msg = '';
            if (!this.state.PhoneNumber) {
                msg = 'Enter Your Phone Number';
            } else if (this.state.PhoneNumber.length != 10) {
                msg = 'Invalid Phone Number';
            } else if (!this.state.DisplayName || this.state.DisplayName < 2) {
                msg = 'Enter Your Name';
            }
            else {
                msg = this.checkStringPassword_pam(this.state.Password);
            }
            if (msg.length > 0) {
                var toast = Toast.show(msg, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    delay: 0
                });
                return;
            }
            disabled = true;
            setTimeout(() => {
                this.setState({
                    SpinnerVisible: true
                });
            }, 0);

            var hashPassword = CryptoJS.SHA256(this.state.Password);
            var newUser = {
                pkey: '',
                lastSeen: Date.now(),
                isOnline: true,
                ModifyDate: Date.now(),
                ModifyPicDate: Date.now(),
                phoneNumber: this.state.PhoneNumber,
                publicInfo: {
                    fullName: this.state.DisplayName,
                    mail: '',
                    picture: profileImg,
                    gender: ''
                },
                privateInfo: {
                    tokenNotification: '',
                    password: hashPassword.toString(),
                }
            };

            serverSrv.signUpFunc(newUser, (userId) => {
                try {
                    this.setState({
                        SpinnerVisible: false
                    });
                    if (userId) {
                        Actions.Tabs({ type: 'reset' });
                    } else {
                        disabled = false;
                        var toast = Toast.show('Phone Number Already In Use', {
                            duration: Toast.durations.LONG,
                            position: Toast.positions.BOTTOM,
                            shadow: true,
                            animation: true,
                            hideOnPress: true,
                            delay: 0
                        });
                    }
                } catch (error) {
                    ErrorHandler.WriteError('SignUp.js => SignUpSubmit => serverSrv.signUpFunc', e);
                }
            });
        } catch (e) {
            ErrorHandler.WriteError('SignUp.js => SignUpSubmit', e);
        }
    });

    showImagePicker = () => {
        try {
            ImagePicker.showImagePicker(options, (response) => {
                try {
                    if (response.didCancel) {
                        console.log('User cancelled image picker');
                    }
                    else if (response.error) {
                        ErrorHandler.WriteError('ImagePicker Error: ', response.error);
                    }
                    else if (response.customButton) {
                        console.log('User tapped custom button: ', response.customButton);
                    }
                    else {
                        // You can display the image using either data...
                        const source = { uri: 'data:image/jpeg;base64,' + response.data, isStatic: true };
                        // or a reference to the platform specific asset location
                        if (Platform.OS === 'ios') {
                            const source = { uri: response.uri.replace('file://', ''), isStatic: true };
                        } else {
                            const source = { uri: response.uri, isStatic: true };
                        }
                        //profileImg = response.data;
                        try {
                            if (response && response.uri) {
                                ImageResizer.createResizedImage(response.uri, 400, 400, 'JPEG', 100, 0, null).then((resizedImageUri) => {
                                    if (!resizedImageUri) {
                                        return;
                                    }
                                    NativeModules.RNImageToBase64.getBase64String(resizedImageUri, (err, base64) => {
                                        profileImg = 'data:image/jpeg;base64,' + base64;
                                    })
                                }).catch((err) => {
                                    ErrorHandler.WriteError('SignUp.js => showImagePicker => createResizedImage = >ImageResizer', err);
                                });
                            }
                        } catch (error) {
                            ErrorHandler.WriteError('SignUp.js => showImagePicker = > ImageResizer(1)', error);
                        }

                        this.setState({
                            avatarSource: source
                        });
                    }
                } catch (error) {
                    ErrorHandler.WriteError('SignUp.js => showImagePicker => response', error);
                }

            });
        } catch (e) {
            ErrorHandler.WriteError('SignUp.js => showImagePicker', e);
        }
    }

    logInSpinner() {
        try {
            if (this.state.SpinnerVisible == true) {
                return (
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0)', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                        <Modal
                            transparent={true}
                            style={{ backgroundColor: 'rgba(0,0,0,0)' }}
                            visible={this.state.SpinnerVisible}
                            onRequestClose={() => { console.log('closed') }}
                        >
                            <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: 'rgba(0,0,0,0)', position: 'absolute' }}>
                                <Spinner visible={true} />
                            </View>
                        </Modal>
                    </View>)
            }
        } catch (e) {
            ErrorHandler.WriteError('SignUp.js => logInSpinner', e);
        }
    }

    render() {
        try {
            return (
                <View style={styles.container}>
                    <View style={{
                        flex: 1,
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                    }}>
                        <Image source={require("../../img/signUpBAckground.png")} style={{ resizeMode: 'stretch', width: null, height: 20, flex: 1 }}>
                            <View style={{
                                flex: 1,
                                alignSelf: 'stretch',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}>
                                <Text style={styles.Welcome}>
                                    Welcome to WriteNow!
                                </Text>
                                <View style={styles.viewImg}>
                                    <TouchableOpacity onPress={this.showImagePicker} >
                                        <Image style={styles.UserImage} source={this.state.avatarSource} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Image>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Fumi
                            label={'Display Name'}
                            iconClass={FontAwesomeIcon}
                            iconName={'users'}
                            iconColor={'#f50057'}
                            style={styles.input}
                            autoCapitalize="words"
                            onChangeText={(val) => this.setState({ DisplayName: val })}
                        />
                        <Fumi
                            label={'Phone Number'}
                            iconClass={FontAwesomeIcon}
                            iconName={'phone'}
                            iconColor={'#f50057'}
                            style={styles.input}
                            keyboardType="phone-pad"
                            onChangeText={(val) => this.setState({ PhoneNumber: val })}
                        />
                        <Fumi
                            label={'Password'}
                            iconClass={FontAwesomeIcon}
                            iconName={'key'}
                            iconColor={'#f50057'}
                            style={styles.input}
                            secureTextEntry={true}
                            onChangeText={(val) => this.setState({ Password: val })}
                        />
                        <TouchableOpacity disabled={disabled} style={styles.button} underlayColor='#ededed' onPress={this.SignUpSubmit}>
                            <View>
                                <Text style={styles.buttonText}>Submit</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {this.logInSpinner()}
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('SignUp.js => render', e);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    Welcome: {
        fontSize: 24,
        alignSelf: 'center',
        marginTop: 5,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: 'black',
        textShadowRadius: 2,
        textShadowOffset: {
            height: 1.5,
            width: 1
        }
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    input: {
        height: 45,
        width: 300,
        marginTop: 10,
        padding: 2,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#f50057'
    },
    UserImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    button: {
        height: 40,
        width: 80,
        backgroundColor: '#f50057',
        borderColor: '#f50057',
        borderRadius: 10,
        marginLeft: 10,
        marginTop: 10,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    viewImg: {
        borderColor: 'black',
        elevation: 8,
        borderRadius: 10,
        margin: 10,
        alignSelf: 'center',
        justifyContent: 'center'
    },
});