import React, { Component } from 'react';
import {
  AppRegistry,
  AsyncStorage,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import InitRout from './src/InitRout';
import ChatRoom from './src/ChatRoom/ChatRoom';

var serverSrv = require('./Services/serverSrv');


export default class WriteNow extends Component {
  constructor() {
    super();
    serverSrv.login();
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.statusbar} />
        <InitRout />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  example: {
    elevation: 4,
  },
  statusbar: {
    backgroundColor: '#820cf7',
    height: Platform.OS === 'ios' ? 20 : 24,
  },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 44 : 56,
    backgroundColor: '#9933FF',
    elevation: 4,
  },
  title: {
    flex: 1,
    margin: 16,
    textAlign: Platform.OS === 'ios' ? 'center' : 'left',
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    color: '#fff',
  }
});

var encrypted = '';
try {
  var RSAKey = require('react-native-rsa');
  const bits = 1024;
  const exponent = '10001'; // must be a string. This is hex string. decimal = 65537
  var rsa = new RSAKey();
  rsa.generate(bits, exponent);
  var publicKey = rsa.getPublicString(); // return json encoded string
  var privateKey = rsa.getPrivateString(); // return json encoded string

  console.log(publicKey);
  console.log(privateKey);

} catch (error) {
  console.log(1);
  console.log(1);
  console.log(error);
}

// try {

//   rsa = new RSAKey();
//   rsa.setPrivateString(privateKey);
//   var originText = 'Sagi Uziel Test 123';
//   encrypted = rsa.encrypt(originText);
//   console.log(encrypted);

// } catch (error) {
//   console.log(2);
//   console.log(2);
//   console.log(error);
// }

// try {
//   rsa = new RSAKey();
//   rsa.setPublicString(publicKey);
//   console.log(3333);
//   console.log(publicKey);
//   console.log(3333);
//   var decrypted = rsa.decrypt(encrypted); // decrypted == originText
//   console.log(3333);
//   console.log(decrypted);

// } catch (error) {
//   console.log(3);
//   console.log(3);
//   console.log(3);
//   console.log(error);
// }

// try {
//   console.log(decrypted);

// } catch (error) {
//   console.log(3);
//   console.log(3);
//   console.log(3);
//   console.log(error);
// }
// console.log('start');

AppRegistry.registerComponent('WriteNow', () => WriteNow);


// var encrypted = '';
// try {
//   var RSAKey = require('react-native-rsa');
//   const bits = 1024;
//   const exponent = '10001';
//   var rsa = new RSAKey();
//   rsa.generate(bits, exponent);
//   var publicKey = rsa.getPublicString(); 
//   var privateKey = rsa.getPrivateString(); 
// } catch (error) {
//   console.log(1);
//   console.log(error);
// }

// try {

//   rsa = new RSAKey();
//   rsa.setPrivateString(privateKey);
//   var originText = 'Test 123 Test 321';
//   encrypted = rsa.encrypt(originText);

// } catch (error) {
//   console.log(2);
//   console.log(error);
// }

// try {
//   rsa = new RSAKey();
//   rsa.setPublicString(publicKey);
//   var decrypted = rsa.decrypt(encrypted);
//   console.log(decrypted);

// } catch (error) {
//   console.log(3);
//   console.log(error);
// }
