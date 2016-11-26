import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Contacts from './Contacts/Contacts'
import SignUp from './SignUp/SignUp'
import Chats from './Chats/Chats'
import Tabs from './Tabs'
import ChatRoom from './ChatRoom/ChatRoom'
import Signature from './ChatRoom/Signature/Signature'
import { Actions, Scene, Router } from 'react-native-router-flux';

var serverSrv = require('../Services/serverSrv');
var ErrorHandler = require('../ErrorHandler');

//unmountScenes
const scenes = Actions.create(
    <Scene key="root" hideNavBar={true}>
        <Scene key="SignUp" component={SignUp} title="SignUp" duration="0" />
        <Scene key="Tabs" component={Tabs} title="Tabs" initial={true} duration="0" />
        <Scene key="ChatRoom" component={ChatRoom} title="ChatRoom" />
        <Scene key="Signature" component={Signature} title="Signature" />
    </Scene>
);

export default class InitRout extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Router scenes={scenes} />
        );
    }
}