
import React, { Component } from 'react';
//import ImagePicker from 'react-native-image-picker';
/*onPress={this._pickFromCamera.bind(this)}*/ 
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableHighlight
} from 'react-native';

/*var ImagePicker = require('react-native-image-picker');*/

class WriteNow extends Component {
  constructor() {
    super();
    
    this.state = {
      DisplayName: "",
      PhoneNumber: ""
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style = {styles.Welcome}>
          Welcome to WriteNow!
        </Text>
        <Image style={styles.UserImage} source={{uri: 'https://ugotalksalot.files.wordpress.com/2016/06/no-thumb.jpg'}}/>
        <TextInput 
          onChangeText={(val) => this.setState({DisplayName: val})}
          style={styles.input} placeholder="Display Name"
        />
        <TextInput 
          onChangeText={(val) => this.setState({PhoneNumber: val})}
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
  Welcome:{
    fontSize: 24,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input:{
    height:50,
    width:300,
    marginTop:10,
    padding: 4,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48bbec'
  },
  UserImage:{
    width: 100, 
    height: 100,
    borderRadius: 40,
    shadowRadius: 40,
    marginTop:10,
    shadowColor: '#696969',
  },
  button:{
    height: 40,
    width: 80,
    backgroundColor: '#4BBBEC',
    borderColor: '#4BBBEC',
    marginLeft: 10,
    marginTop:10,
    justifyContent: 'center'
    
  },
  buttonText:{
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  }
});

AppRegistry.registerComponent('WriteNow', () => WriteNow);
