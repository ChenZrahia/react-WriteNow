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
        <View style={styles.appbar}>
          <Text style={styles.title}>
            WriteNow
          </Text>
          <View style={styles.button} />
        </View>
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

AppRegistry.registerComponent('WriteNow', () => WriteNow);