import React, { Component } from 'react';
import {
    Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    StyleSheet,
    RecyclerViewBackedScrollView,
    Text,
    View,
    Modal,
    TextInput
} from 'react-native';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import SGListView from 'react-native-sglistview';
import Kohana from '../../styles/Kohana';
import { Actions } from 'react-native-router-flux';

var serverSrv = require('../../Services/serverSrv');
var PhoneContacts = require('react-native-contacts');
var generalStyle = require('../../styles/generalStyle');

export default class Contacts extends Component {
    constructor() {
        super();
        this.isGetMyContacts = false;
        this.isGetMyFriends = false;
        this.phnesNumbers = [];
        this.myFriends = [];
        this.myContacts = [];
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: this.ds,
            imageVisible: false,
            filter: ''
        };


    }

    componentDidMount() {
        setTimeout(() => {
            var ds = this.ds;
            serverSrv.GetAllMyFriends((result) => {
                if (result && result.length > 0) {
                    this.setState({
                        dataSource: ds.cloneWithRows(result)
                    })
                    if (this.isGetMyFriends == false) {
                        this.isGetMyFriends = true;
                        this.myFriends = this.myFriends.concat(result);
                    }
                    this.mergeContacts();
                    this.updateMyContactsView(ds, this.myFriends);
                }
            });

            // לחשוב איך ליעל את זה ------------------------ לא למחוק--------------------------ת
            PhoneContacts.getAll((err, contacts) => {
                if (err && err.type === 'permissionDenied') {
                    // x.x
                } else {
                    contacts = contacts.filter((user) => {
                        if (user.phoneNumbers && user.phoneNumbers[0]) {
                            var usr = {
                                isOnline: false,
                                isPhoneContact: true,
                                phoneNumber: user.phoneNumbers[0].number.replace('+972', '0').replace(/[ ]|[-()]/g, ''),
                                publicInfo: {
                                    fullName: user.givenName + (user.middleName ? (' ' + user.middleName) : '') + (user.familyName ? (' ' + user.familyName) : ''),
                                    picture: user.thumbnailPath
                                }
                            };
                            if (this.phnesNumbers.indexOf(usr.phoneNumber) >= 0) {
                                return false;
                            }
                            else {
                                this.myContacts.push(usr);
                                this.phnesNumbers.push(usr.phoneNumber);
                                return true;
                            }
                        } else {
                            return false;
                        }
                    });

                    serverSrv.InsertMyContacts(this.myContacts, () => {
                        serverSrv.GetAllMyFriends_Server((result) => {
                            this.setState({
                                dataSource: ds.cloneWithRows(result)
                            })
                        });
                    });
                }
                this.isGetMyContacts = true;
                this.updateMyContactsView(ds, this.myFriends);
            });

            serverSrv.GetAllMyFriends_Server((result) => {
                this.setState({
                    dataSource: ds.cloneWithRows(result)
                })
            });

        }, 0);
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
            // array.sort((a, b) => {
            //     if (a.publicInfo.fullName.toLowerCase() < b.publicInfo.fullName.toLowerCase()) {
            //         return -1;
            //     }
            //     else if (a.publicInfo.fullName.toLowerCase() > b.publicInfo.fullName.toLowerCase()) {
            //         return 1;
            //     }
            //     else {
            //         return 0;
            //     }
            // });
            serverSrv.GetAllMyFriends_Server((result) => {
                setTimeout(() => {
                    this.setState({
                        dataSource: ds.cloneWithRows(result)
                    })
                }, 200);
            });
        }
    }

    setImageVisible(visible) {
        this.setState({ imageVisible: visible });
    }

    onFilterChange(event) {
        this.setState({
            filter: event.nativeEvent.text
        });
    }

    getDataSource() {
        //if filter is empty - return original data source
        if (!this.state.filter && this.state.dataSource.cloneWithRows) {
            return this.state.dataSource.cloneWithRows(this.myFriends);
        }
        //create filtered datasource
        let filteredContacts = this.myFriends;
        filteredContacts = this.myFriends.filter((user) => {
            // return user.publicInfo.fullName.toLowerCase().includes(this.state.filter.toLowerCase());
            return ((user.publicInfo.fullName.toLowerCase().includes(this.state.filter.toLowerCase())) || (user.phoneNumber ? user.phoneNumber.includes(this.state.filter) : false));
        });
        if (this.state.dataSource.cloneWithRows) {
            return this.state.dataSource.cloneWithRows(filteredContacts);
        }
        return this.state.dataSource;
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <Kohana
                    style={styles.searchBar}
                    label={'Search'}
                    iconClass={MaterialsIcon}
                    iconName={'search'}
                    iconColor={'#f50057'}
                    labelStyle={{ color: '#f50057', justifyContent: 'center', alignSelf: 'stretch' }}
                    inputStyle={{ color: '#f50057', alignSelf: 'stretch' }}
                    value={this.state.filter}
                    onChange={this.onFilterChange.bind(this)}
                    />
                <SGListView style={{ paddingTop: 5, flex: 1 }}
                    enableEmptySections={true}
                    dataSource={this.getDataSource()}
                    initialListSize={1}
                    stickyHeaderIndices={[]}
                    onEndReachedThreshold={1}
                    scrollRenderAheadDistance={20}
                    pageSize={20}
                    renderRow={this.renderRow()}
                    />
                {this.openImageModal(this.imgSelected)}
            </View>
        );
    }

    renderRow() {
        return (
            (rowData) =>
                <View>
                    <TouchableHighlight underlayColor='#ededed' onPress={() => {
                        rowData.isContact = true;
                        Actions.ChatRoom(rowData);
                    } }>
                        <View style={generalStyle.styles.row}>
                            <TouchableHighlight onPress={() => {
                                this.imgSelected = rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')
                                this.setImageVisible(true);
                            } }>
                                <View style={generalStyle.styles.viewImg}>
                                    <Image style={generalStyle.styles.thumb} source={rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')} />
                                </View>
                            </TouchableHighlight>
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={generalStyle.styles.textName}>
                                    {rowData.publicInfo.fullName}
                                </Text>
                                <Text style={generalStyle.styles.textStatus}>
                                    {rowData.phoneNumber}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                </View>
        );
    }

    openImageModal(image) {
        return (
            <Modal
                animationType={"slide"}
                transparent={true}
                visible={this.state.imageVisible}
                onRequestClose={() => { console.log('image closed') } }
                >
                <TouchableHighlight style={{ flex: 1 }} onPress={() => {
                    this.setImageVisible(!this.state.imageVisible)
                } }>
                    <View style={generalStyle.styles.imageModal}>
                        <Image style={generalStyle.styles.imageInsideModal} source={image} />
                    </View>
                </TouchableHighlight>
            </Modal>
        );
    }
}

var styles = StyleSheet.create({
    searchBar: {
        borderWidth: 0.5,
        borderRadius: 4,
        borderColor: '#f50057',
        height: 35,
        margin: 5
    }
});