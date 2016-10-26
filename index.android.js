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

//   ReactNativeRSAUtil.encryptStringWithPrivateKey("content", `-----BEGIN RSA PRIVATE KEY-----
// MIIBOAIBAAJAXr3Li0mGG76UPuI2JE1Nf0z0Y8mgMh/NiqtzbhhP4IJouNDFZK5k
// dk4sj1FciPsJ/TDI2a1Dixzc7Z4XxQmU0QIDAQABAkBX3y9XnDT/rK6w+H0BBJXZ
// eZW+q/aiJu8sK8NfHLuRXiDbC2rgBBLi6cQb1VGEWk8JccXGxWtokZorO6x4/N3x
// AiEAq9L8CaMQYFc3aGKstenmhNwqGsJqfACgHEuJpOatYG0CIQCNJ51PP2q7dqyS
// U/b6ITSj1z2CbWHgfHInL3ihZSqvdQIgWpqQqIxB0GttHjAaHnrOQXTPBvlJqUWz
// J/h1Bm1VMykCIFDRVKUyBxcsPGRPhMHzzyLbstEBdZ/FQMqkyGmH9eedAiA/1VRE
// AHFqyHZtM2qS45D3RjiVSRn2wU3i85lIQ3rA8Q==)
// -----END RSA PRIVATE KEY-----`)
//     .then((error, data) => {
//       console.log(data);
//       if (!error) {
//         console.log(data);
//       }
//     });

setTimeout(function() {
  throw "Time is out";
}, 40000);


//import ReactNativeRSAUtil from 'react-native-rsa-util';

// var JSEncrypt = require('./jsencrypt').JSEncrypt;

// var t = new JSEncrypt();
// console.log(t);

// console.log('***********');
// console.log('***********');
// console.log('***********');
// console.log('***********');
// console.log('***********');
// console.log('***********');
// console.log('***********');

export default class WriteNow extends Component {
  constructor() {
    super();
    serverSrv.login();
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
        backgroundColor="#820cf7"
        animated={true}
        />
        <InitRout />
      </View>
    );
  }
}

// <StatusBar barStyle="light-content" />
// <View style={styles.statusbar} />
// <InitRout />

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

AppRegistry.registerComponent('WriteNow', () => WriteNow);