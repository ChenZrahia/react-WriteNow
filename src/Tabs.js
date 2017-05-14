import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    Modal
} from 'react-native';
import Contacts from './Contacts/Contacts';
import ChatRoom from './ChatRoom/ChatRoom';
import SignUp from './SignUp/SignUp';
import Chats from './Chats/Chats';
import LiveChat from './LiveChat/LiveChat';
import { Actions, Scene, Router } from 'react-native-router-flux';
import renderIf from '../plugins/renderIf';
import IconMat from 'react-native-vector-icons/MaterialIcons';

var serverSrv = require('../Services/serverSrv');
var generalStyle = require('../styles/generalStyle');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var ErrorHandler = require('../ErrorHandler');

// var SinchVerification = require('react-native-sinch-verification');
// var custom = "A custom string to be sent to your server backend, through Sinch's callback URL";

// // init with app key 
// SinchVerification.init('your-app-key');

// // sms verification 
// SinchVerification.sms('0546902592', custom, (err, res) => {
//   if (!err) {
//       // for android, verification is done, because the sms has been read automatically 
//       // for ios, this means the sms has been sent out, you need to call verify with the received code 
//   }
// });

// // verify the received code (not needed on android) 
// SinchVerification.verify('the-received-code', (err, res) => {
//   if (!err) {
//       // done! 
//   }
// });

// // flash call verification (android only) 
// SinchVerification.flashCall('0546902592', custom, (err, res) => {
//   if (!err) {
//       // done! 
//   }
// });

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
        try {
            super();
            this.state = {
                showMenu: false
            }
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => constructor', e);
        }
    }

    static propTypes = {
        style: View.propTypes.style,
    };

    menuOption() {
        try {
            this.setState({ showMenu: !this.state.showMenu });
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => menuOption', e);
        }
    }

    showNewGroup() {
        try {
            Actions.NewGroup();
            this.setState({ showMenu: !this.state.showMenu });
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => showNewGroup', e);
        }
    }

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
                        }}>
                            <Text style={generalStyle.styles.titleHeader}>Delete Db</Text>
                        </TouchableHighlight>
                        <TouchableOpacity style={{ margin: 7 }} onPress={() => {
                            this.menuOption();
                        }}>
                            <IconMat name="more-vert" size={25} color="white" />

                        </TouchableOpacity>

                        {renderIf(this.state.showMenu)(
                            <Modal
                                onRequestClose={() => { }}
                                style={{ flex: 1 }}
                                transparent={true}
                            >

                                <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                                    this.setState({ showMenu: !this.state.showMenu })
                                }}>
                                    <View style={{
                                        width: 160,
                                        height: 100,
                                        backgroundColor: 'white',
                                        position: 'absolute',
                                        top: 35,
                                        right: 25,
                                        elevation: 6,
                                    }}>
                                        <TouchableOpacity onPress={() => {
                                            this.showNewGroup();
                                        }}>
                                            <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                                                <IconMat name="people" size={20} color="black" />
                                                <Text> New Group</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                        }}>
                                            <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                                                <IconMat name="list" size={20} color="black" />
                                                <Text> New List</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                        }}>
                                            <View style={{ margin: 7, left: 6, alignItems: 'center', flexDirection: 'row' }}>
                                                <IconMat name="settings" size={20} color="black" />
                                                <Text> Settings</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        )}
                        <View style={styles.button} />
                    </View>

                    <ScrollableTabView tabBarBackgroundColor={generalStyle._mainColor} tabBarTextStyle={{ color: 'white' }} tabBarUnderlineStyle={{ backgroundColor: generalStyle._secondColor, height: 2 }}>
                        <Chats tabLabel="CHATS" />

                        <Contacts tabLabel="CONTACTS" />
                        <LiveChat tabLabel="LIVE CHAT" />
                    </ScrollableTabView>
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('Tabs.js => render', e);
        }
    }
}
