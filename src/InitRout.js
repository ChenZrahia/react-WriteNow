import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Contacts from './Contacts/Contacts'
import SignUp from './SignUp/SignUp'
import Chats from './Chats/Chats'
import Tabs from './Tabs'
import ChatRoom from './ChatRoom/ChatRoom'
import Call from './LiveChat/Call/Call'
import Video from './LiveChat/Video/Video'
import PTT from './LiveChat/PTT/PTT'
import Signature from './ChatRoom/Signature/Signature'
import NewGroup from './NewGroup/NewGroup'
import NewGroupInfo from './NewGroup/NewGroupInfo'
import GroupProfile from './NewGroup/GroupProfile'
import { Actions, Scene, Router } from 'react-native-router-flux';

var serverSrv = require('../Services/serverSrv');
var ErrorHandler = require('../ErrorHandler');

//unmountScenes
const scenes = Actions.create(
    <Scene key="root" hideNavBar={true}>
        <Scene key="SignUp" component={SignUp} title="SignUp" duration="0" />
        <Scene key="Tabs" component={Tabs} title="Tabs" initial={true} duration="0" />
        <Scene key="ChatRoom" component={ChatRoom} title="ChatRoom" />
        <Scene key="Call" component={Call} title="Call" duration="0"/>
        <Scene key="PTT" component={PTT} title="PTT" duration="0"/>
        <Scene key="Video" component={Video} title="Video" duration="0"/>
        <Scene key="Signature" component={Signature} title="Signature" />
        <Scene key="NewGroup" component={NewGroup} title="NewGroup" />
        <Scene key="NewGroupInfo" component={NewGroupInfo} title="NewGroupInfo" />
        <Scene key="GroupProfile" component={GroupProfile} title="GroupProfile" />
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