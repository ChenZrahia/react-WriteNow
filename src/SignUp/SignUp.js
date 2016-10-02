
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableHighlight
} from 'react-native';

var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');

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
      avatarSource: { uri: '../../img/user.jpg' }
    }
  }

  showImagePicker = () => {
    console.log('this.state');
    console.log(this.state);
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

        this.setState({
          avatarSource: source
        });
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style = {styles.Welcome}>
          Welcome to WriteNow!
        </Text>
        <TouchableHighlight onPress={this.showImagePicker}>
          <Image style={styles.UserImage} source={this.state.avatarSource}/>
        </TouchableHighlight>
        <TextInput
          onChangeText={(val) => this.setState({ DisplayName: val }) }
          style={styles.input} placeholder="Display Name"
          />
        <TextInput
          onChangeText={(val) => this.setState({ PhoneNumber: val }) }
          style={styles.input} placeholder="Phone Number"
          />
        <TouchableHighlight style = {styles.button} underlayColor='#99d7f4'>
          <Text style = {styles.buttonText}>Submit</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 10,
    paddingTop: 80
  },
  Welcome: {
    fontSize: 24,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    width: 300,
    marginTop: 10,
    padding: 4,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48bbec'
  },
  UserImage: {
    width: 100,
    height: 100,
    borderRadius: 90,
    shadowRadius: 90,
    marginTop: 10,
    shadowColor: '#696969',
  },
  button: {
    height: 40,
    width: 80,
    backgroundColor: '#4BBBEC',
    borderColor: '#4BBBEC',
    marginLeft: 10,
    marginTop: 10,
    justifyContent: 'center'

  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  }
});
