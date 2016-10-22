import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import serverSrv from '../Services/serverSrv';
import Contacts from './Contacts/Contacts';
import ChatRoom from './ChatRoom/ChatRoom';
import SignUp from './SignUp/SignUp'
import Chats from './Chats/Chats'
import { Actions, Scene, Router } from 'react-native-router-flux';

var generalStyle = require('../styles/generalStyle');
var ScrollableTabView = require('react-native-scrollable-tab-view');

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor: '#9933FF',
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 100,
      width: 100
    }
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    backgroundColor: '#f50057',
  },
  label: {
    color: '#fff',
    fontWeight: '400',
  },
});

export default class Tabs extends Component {
  constructor() {
    super();
    console.log(' ### Tabs init - ' + new Date());
  }
  static propTypes = {
    style: View.propTypes.style,
  };

  state = {
    index: 1,
  };

  render() {
    return (
      <View style={generalStyle.styles.container}>
        <View style={generalStyle.styles.appbar}>
          <Text style={generalStyle.styles.titleHeader}>
            WriteNow
          </Text>
          <View style={styles.button} />
        </View>
        <ScrollableTabView tabBarBackgroundColor={generalStyle._mainColor} tabBarTextStyle={{color: 'white'}} tabBarUnderlineStyle={{backgroundColor: generalStyle._secondColor}}>
          <Contacts tabLabel="CONTACTS" />
          <Chats tabLabel="CHATS" />
        </ScrollableTabView>
      </View>
    );
  }
}