import React, { Component } from 'react';
import { Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    StyleSheet,
    RecyclerViewBackedScrollView,
    Text,
    View,
    Modal } from 'react-native';

var serverSrv = require('../../Services/serverSrv');
var PhoneContacts = require('react-native-contacts')

export default class Contacts extends Component {
    constructor() {
        super();
        this.isGetMyContacts = false;
        this.isGetMyFriends = false;
        this.phnesNumbers = [];
        this.myFriends = [];
        this.myContacts = [];
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows(this.myFriends),
            imageVisible: false
        };

        serverSrv.GetAllMyFriends((result) => {
            if (result && result.length > 0) {
                // result = result.filter((user) => {
                //     if (this.phnesNumbers.indexOf(user.phoneNumber) < 0) {
                //         this.phnesNumbers.push(user.phoneNumber);
                //     }
                // })
                if (this.isGetMyFriends == false) {
                    this.myFriends = this.myFriends.concat(result);
                }
                this.mergeContacts();
                //this.myFriends = this.myContacts.concat(this.myFriends);
                this.isGetMyFriends = true;
                this.updateMyContactsView(ds, this.myFriends);
            }
        });

        PhoneContacts.getAll((err, contacts) => {
            if (err && err.type === 'permissionDenied') {
                // x.x
            } else {
                contacts = contacts.filter((user) => {
                    if (user.phoneNumbers && user.phoneNumbers[0] && this.phnesNumbers.indexOf(user.phoneNumbers[0].number) < 0) {
                        this.phnesNumbers.push(user.phoneNumbers[0].number);
                        this.myContacts.push({
                            isOnline: false,
                            isPhoneContact: true,
                            phoneNumber: (user.phoneNumbers && user.phoneNumbers[0]) ? user.phoneNumbers[0].number.replace(/-/g, '').replace('+972 ', '0') : '',
                            publicInfo: {
                                fullName: user.givenName + (user.middleName ? (' ' + user.middleName) : '') + (user.familyName ? (' ' + user.familyName) : ''),
                                picture: user.thumbnailPath
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
            }
            //this.myFriends = this.myFriends.concat(this.myContacts);
            this.mergeContacts();
            this.isGetMyContacts = true;
            this.updateMyContactsView(ds, this.myFriends);
        })
    }

    mergeContacts() {
        if (this.isGetMyContacts == true && this.isGetMyFriends == false) {
            this.myFriends = this.myFriends.concat(this.myContacts)
        }
        else if (this.isGetMyContacts == false && this.isGetMyFriends == true) {
            this.myFriends = this.myContacts.concat(this.myFriends);
        }
    }

    updateMyContactsView(ds, array) {
        if (this.isGetMyContacts == true && this.isGetMyFriends == true) {
            array.sort((a, b) => {
                if (a.publicInfo.fullName.toLowerCase() < b.publicInfo.fullName.toLowerCase()) {
                    return -1;
                }
                else if (a.publicInfo.fullName.toLowerCase() > b.publicInfo.fullName.toLowerCase()) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            setTimeout(() => {
                this.setState({
                    dataSource: ds.cloneWithRows(array)
                })
            }, 100);
        }
    }

    setImageVisible(visible) {
        this.setState({ imageVisible: visible });
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <ListView style={{ paddingTop: 5, flex: 1 }}
                    enableEmptySections={true}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) =>
                        <View>
                            <TouchableHighlight underlayColor='#ededed' onPress={() => {
                            } }>
                                <View style={styles.row}>
                                    <TouchableHighlight onPress={() => {
                                        this.imgSelected = rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')
                                        this.setImageVisible(true);
                                    } }>
                                        <View style={styles.viewImg}>
                                            <Image style={styles.thumb} source={ rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg') }/>
                                        </View>
                                    </TouchableHighlight>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={styles.textName}>
                                            {rowData.publicInfo.fullName}
                                        </Text>
                                        <Text style={styles.textStatus}>
                                            {rowData.isPhoneContact ? rowData.phoneNumber : (rowData.publicInfo.isOnline ? 'online' : 'offline') }
                                        </Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    }
                    />
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.imageVisible}
                    onRequestClose={() => { console.log('image closed') } }
                    >
                    <View style={styles.imageModal}>
                        <TouchableHighlight onPress={() => {
                            this.setImageVisible(!this.state.imageVisible)
                        } }>
                            <Image style={styles.imageInsideModal} source={ this.imgSelected }/>
                        </TouchableHighlight>
                    </View>
                </Modal>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
        borderBottomWidth: 0.5,
        borderColor: '#e7e7e7',
        backgroundColor: 'white'
    },
    viewImg: {
        borderColor: 'black',
        elevation: 3,
        borderRadius: 4,
    },
    thumb: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 40,
        height: 40,
        alignSelf: 'flex-end',
    },
    textName: {
        paddingLeft: 10,
        paddingRight: 10,
        color: 'black',
        alignSelf: 'flex-start'
    },
    textStatus: {
        paddingLeft: 10,
        paddingRight: 10,
        color: 'gray',
        alignSelf: 'flex-start'
    },
    imageModal: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageInsideModal: {
        width: 200,
        height: 200,
        borderRadius: 10,
        borderWidth: 1
    }
});