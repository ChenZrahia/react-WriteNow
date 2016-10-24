import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import { Actions } from 'react-native-router-flux'
import Toast from 'react-native-root-toast';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Fumi from '../../styles/Fumi';

var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');
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
    super();
    this.state = {
      DisplayName: "",
      PhoneNumber: "",
      avatarSource: require('../../img/user.jpg')
    }
  }
  test = (() => { });


  // Add a Toast on screen.


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

      var newUser = {
        pkey: '',
        lastSeen: Date.now,
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
          tokenNotification: ''
        }
      };

      serverSrv.signUpFunc(newUser, (userId) => {
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
      });
    } catch (e) {
      ErrorHandler.WriteError('SigbUp.js => SignUpSubmit', e);
    }
  });

  showImagePicker = () => {
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
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
        profileImg = response.data;

        this.setState({
          avatarSource: source
        });
      }
    });
  };

  logIn() {
    Actions.Tabs({ type: 'reset' });
  }
  // <Image source={require('../../img/signUpBAckground.jpg')} style={styles.backgroundImage} />


  // <TextInput underlineColorAndroid="transparent" autoCapitalize="words"
  //           onChangeText={(val) => this.setState({ DisplayName: val }) }
  //           style={styles.input} placeholder="Display Name"
  //           />
  // <TextInput underlineColorAndroid="transparent" keyboardType="phone-pad"
  //         onChangeText={(val) => this.setState({ PhoneNumber: val })}
  //         style={styles.input} placeholder="Phone Number"
  //         />
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.Welcome}>
          Welcome to WriteNow!
        </Text>
        <TouchableHighlight onPress={this.showImagePicker} underlayColor='#ededed'>
          <View style={styles.viewImg}>
            <Image style={styles.UserImage} source={this.state.avatarSource} />
          </View>
        </TouchableHighlight>
        <Fumi
          label={'Display Name'}
          iconClass={FontAwesomeIcon}
          iconName={'users'}
          iconColor={'#f50057'}
          style={styles.input}
          />
        <Fumi
          label={'Phone Number'}
          iconClass={FontAwesomeIcon}
          iconName={'phone'}
          iconColor={'#f50057'}
          style={styles.input}
          />
        <TouchableOpacity disabled={disabled} style={styles.button} underlayColor='#ededed' onPress={this.SignUpSubmit}>
          <View>
            <Text style={styles.buttonText}>Submit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} underlayColor='#ededed' onPress={this.logIn}>
          <View>
            <Text style={styles.buttonText}>tabs page</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
// padding: 10,
// paddingTop: 10
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Welcome: {
    fontSize: 24,
    alignSelf: 'center',
    marginTop: 5
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
    padding: 4,
    fontSize: 18,
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
