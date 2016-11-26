import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableHighlight
} from 'react-native';
import { TabViewAnimated, TabViewPage, TabBarTop } from 'react-native-tab-view';
import Contacts from './Contacts/Contacts';
import ChatRoom from './ChatRoom/ChatRoom';
import SignUp from './SignUp/SignUp'
import Chats from './Chats/Chats'
import { Actions, Scene, Router } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu, {
    MenuContext,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

var serverSrv = require('../Services/serverSrv');
var generalStyle = require('../styles/generalStyle');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var ErrorHandler = require('../ErrorHandler');

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
    }

    static propTypes = {
        style: View.propTypes.style,
    };

    render() {
        try {
            return (
                <View style={generalStyle.styles.container}>
                    <View style={generalStyle.styles.appbar}>
                        <Text style={generalStyle.styles.titleHeader}>
                            WriteNow
        </Text>
                        <TouchableHighlight style={{ flex: 1, alignSelf: 'stretch' }} onPress={() => {
                            serverSrv.DeleteDb();
                        } }>
                            <Text style={generalStyle.styles.titleHeader}>Delete Db</Text>
                        </TouchableHighlight>
                        <View style={styles.button}>
                        </View>
                    </View>
                    <ScrollableTabView tabBarBackgroundColor={generalStyle._mainColor} tabBarTextStyle={{ color: 'white' }} tabBarUnderlineStyle={{ backgroundColor: generalStyle._secondColor, height: 2 }}>
                        <Chats tabLabel="CHATS" />
                        <Contacts tabLabel="CONTACTS" />
                    </ScrollableTabView>
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => render', e);
        }
    }
    // <Icon name="md-more" onPress={} />

    onOptionSelect(value) {
        try {
            alert(`Selected number: ${value}`);
            this.setState({ opened: false });
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => onOptionSelect', e);
        }
    }

    Menu() {
        try {
            return (
                <MenuContext
                    style={{ flexDirection: 'row', padding: 30 }}>
                    <Text style={generalStyle.styles.titleHeader}>
                        WriteNow
        </Text>
                    <Menu
                        opened={this.state.opened}
                        onBackdropPress={() => this.setState({ opened: false })}
                        onSelect={value => this.onOptionSelect(value)}>
                        <MenuTrigger
                            onPress={() => this.setState({ opened: true })}
                            text='Select option' />
                        <MenuOptions>
                            <MenuOption value={1} text='New Group' />
                            <MenuOption value={2} text='New List' />
                            <MenuOption value={3} text='WriteNow Web' />
                            <MenuOption value={4} text='Settings' />
                        </MenuOptions>
                    </Menu>
                </MenuContext >
            );
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => Menu', e);
        }
    }
}
