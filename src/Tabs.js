import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { TabViewAnimated, TabViewPage, TabBarTop } from 'react-native-tab-view';
<<<<<<< HEAD
import serverSrv from '../Services/serverSrv';
import Contacts from './Contacts/Contacts';
import SignUp from './SignUp/SignUp';
=======
import Contacts from './Contacts/Contacts'
import SignUp from './SignUp/SignUp'
import Chats from './Chats/Chats'
import {Actions, Scene, Router} from 'react-native-router-flux';

var serverSrv = require('../Services/serverSrv');
>>>>>>> 88eb21961f9f5cebe4cfaf5d5773a9dd8a301b26

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  }
  static propTypes = {
    style: View.propTypes.style,
  };

  state = {
    index: 1,
    routes: [
      { key: '1', title: 'Contacts' },
      { key: '2', title: 'Chats' },
      { key: '3', title: 'Other' }
    ],
  };

  _handleChangeTab = (index) => {
    this.setState({
      index,
    });
  };

  _renderHeader = (props) => {
    return (
      <TabBarTop
        {...props}
        pressColor='rgba(0, 0, 0, .2)'
        indicatorStyle={styles.indicator}
        style={styles.tabbar}
        labelStyle={styles.label}
        />
    );
  };

  _renderScene = ({ route }) => {
    switch (route.key) {
      case '1':
<<<<<<< HEAD
        return (<View style={[styles.page, { backgroundColor: '#F6F6F6' }]}><Contacts /></View>);
=======
        return <View style={[styles.page, { backgroundColor: 'white' }]} ><Contacts /></View>;
>>>>>>> 88eb21961f9f5cebe4cfaf5d5773a9dd8a301b26
      case '2':
        return <View style={[styles.page, { backgroundColor: 'white' }]}><Chats /></View>;
      case '3':
        return <View style={[styles.page, { backgroundColor: 'white' }]}></View>;
      default:
        return null;
    }
  };

  _renderPage = (props) => {
    return <TabViewPage {...props} renderScene={this._renderScene} />;
  };

  render() {
    return (
      <TabViewAnimated
        style={[styles.container, this.props.style]}
        navigationState={this.state}
        renderScene={this._renderPage}
        renderHeader={this._renderHeader}
        onRequestChangeTab={this._handleChangeTab}
        />
    );
  }
}
