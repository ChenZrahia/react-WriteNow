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
var Event = require('../../Services/Events');
var ErrorHandler = require('../../ErrorHandler');

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
        this.UpdateMyFriends = this.UpdateMyFriends.bind(this);
    }

    componentDidMount() {
        try {
            setTimeout(() => {
                var ds = this.ds;
                Event.on('updateFriends', this.reloadFriendFromDB);
                Event.on('UpdateMyFriends', this.UpdateMyFriends);
                this.reloadFriendFromDB();
            }, 0);
        } catch (error) {
            ErrorHandler.WriteError("Contacts.js => componentDidMount", error);
        }
    }

    reloadFriendFromDB(isUpdate){
        console.log('reloadFriendFromDB: ' + isUpdate);
        serverSrv.GetAllMyFriends(this.UpdateMyFriends, isUpdate);
    }

    UpdateMyFriends(result) {
        try {
            console.log('UpdateMyFriends');
            console.log(result);
            if (!result) {
                result = [];
            }
            setTimeout(() => {
                this.setState({
                    dataSource: this.ds.cloneWithRows(result)
                })
            }, 20);
            this.myFriends = result;
        } catch (error) {
            ErrorHandler.WriteError("Contacts.js => UpdateMyFriends", error);
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
        try {
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
        } catch (error) {
            ErrorHandler.WriteError("Contacts.js => getDataSource", error);
        }
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