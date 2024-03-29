import React, { Component } from 'react';
import {
    Image,
    ReactNative,
    ListView,
    TouchableOpacity,
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

var dismissKeyboard = require('dismissKeyboard');
var serverSrv = require('../../Services/serverSrv');
var generalStyle = require('../../styles/generalStyle');
var Event = require('../../Services/Events');
var ErrorHandler = require('../../ErrorHandler');

export default class Contacts extends Component {
    constructor() {
        try {
        super();
            dismissKeyboard();
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
            this.UpdateMyFriends = this.UpdateMyFriends.bind(this);
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => constructor", e);
        }
    }

    componentDidMount() {
        try {
            setTimeout(() => {
                var ds = this.ds;
                Event.on('signUpCompleted', this.reloadFriendFromDB);
                Event.on('updateFriends', this.reloadFriendFromDB);
                Event.on('UpdateMyFriends', this.UpdateMyFriends);
                this.reloadFriendFromDB();
            }, 300);
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => componentDidMount", e);
        }
    }

    reloadFriendFromDB(isUpdate) {
        try {
            serverSrv.GetAllMyFriends(this.UpdateMyFriends, isUpdate);
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => reloadFriendFromDB", e);
        }
    }

    UpdateMyFriends(result) {
        try {
            if (!result) {
                result = [];
            }
            result = result.filter((user) => {
                if (user.id == serverSrv._uid) {
                    return false;
                }
                else {
                    return true;
                }
            });
            setTimeout(() => {
                this.setState({
                    dataSource: this.ds.cloneWithRows(result)
                });
                this.myFriends = result;
            }, 20);
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => UpdateMyFriends", e);
        }
    }

    setImageVisible(visible) {
        try {
            this.setState({ imageVisible: visible });
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => setImageVisible", e);
        }
    }

    onFilterChange(event) {
        try {
            this.setState({
                filter: event.nativeEvent.text,
                dataSource: this.getDataSource(event.nativeEvent.text)
            });
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => onFilterChange", e);
        }
    }

    getDataSource(filterText) {
        try {
            //if filter is empty - return original data source
            if (!filterText) {
                return this.state.dataSource.cloneWithRows(this.myFriends);
            }
            //create filtered datasource
            let filteredContacts = this.myFriends;
            try {
                filteredContacts = this.myFriends.filter((user) => {
                    try {
                        return ((user.publicInfo.fullName.toLowerCase().includes(filterText.toLowerCase())) || (user.phoneNumber ? user.phoneNumber.includes(filterText) : false));
                    } catch (error) {
                        ErrorHandler.WriteError("Contacts.js => getDataSource => this.myFriends.filter", e);
                        return false;
                    }
                });
            } catch (e) {
                ErrorHandler.WriteError("Contacts.js => getDataSource => filter", e);
            }
            return this.state.dataSource.cloneWithRows(filteredContacts);
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => getDataSource", e);
        }
    }

    render() {
        try {
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
                        dataSource={this.state.dataSource}
                        initialListSize={30}
                        stickyHeaderIndices={[]}
                        onEndReachedThreshold={1}
                        scrollRenderAheadDistance={50}
                        pageSize={30}
                        renderRow={this.renderRow()}
                    />
                    {this.openImageModal(this.imgSelected)}
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => render", e);
        }
    }

    renderRow() {
        try {
            return (
                (rowData) =>
                    <View>
                        <TouchableOpacity onPress={() => {
                            rowData.isContact = true;
                            Actions.ChatRoom(rowData);
                            rowData.groupName = rowData.publicInfo.fullName;
                            rowData.groupPicture = rowData.publicInfo.picture;
                            Event.trigger('LoadNewChat', null, true, rowData.id, rowData.phoneNumber, rowData.publicInfo.fullName);
                        }}>
                            <View style={generalStyle.styles.row}>
                                <TouchableOpacity onPress={() => {
                                    this.imgSelected = rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')
                                    this.setImageVisible(true);
                                }}>
                                    <View style={generalStyle.styles.viewImg}>
                                        <Image style={generalStyle.styles.thumb} source={rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')} />
                                    </View>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={generalStyle.styles.textName}>
                                        {rowData.publicInfo.fullName}
                                    </Text>
                                    <Text style={generalStyle.styles.textStatus}>
                                        {rowData.phoneNumber}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => renderRow", e);
        }
    }

    openImageModal(image) {
        try {
            return (
                <Modal
                    transparent={true}
                    visible={this.state.imageVisible}
                    onRequestClose={() => { console.log('image closed') }}
                >
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                        this.setImageVisible(!this.state.imageVisible)
                    }}>
                        <View style={generalStyle.styles.imageModal}>
                            <Image style={generalStyle.styles.imageInsideModal} source={image} />
                        </View>
                    </TouchableOpacity>
                </Modal>
            );
        } catch (e) {
            ErrorHandler.WriteError("Contacts.js => openImageModal", e);
        }
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