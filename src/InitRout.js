import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { TabViewAnimated, TabViewPage, TabBarTop } from 'react-native-tab-view';
import Contacts from './Contacts/Contacts'
import SignUp from './SignUp/SignUp'
import Chats from './Chats/Chats'
import Tabs from './Tabs'
import {Actions, Scene, Router} from 'react-native-router-flux';

var serverSrv = require('../Services/serverSrv');

//unmountScenes
const scenes = Actions.create(
    <Scene key="root" hideNavBar={true}>
        <Scene key="SignUp" component={SignUp} title="SignUp" />
        <Scene key="Tabs" initial={true} component={Tabs} title="Tabs" />
    </Scene>
);

export default class InitRout extends Component {
    constructor() {
        super();
    }
    
    render() {
        return (
            <Router scenes={scenes}/>
        );
    }
}
