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
    TextInput,
    BackAndroid
} from 'react-native';
import Toast from 'react-native-root-toast';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import SGListView from 'react-native-sglistview';
import Kohana from '../../styles/Kohana';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import renderIf from '../../plugins/renderIf';

var dismissKeyboard = require('dismissKeyboard');
var serverSrv = require('../../Services/serverSrv');
var PhoneContacts = require('react-native-contacts');
var generalStyle = require('../../styles/generalStyle');
var Event = require('../../Services/Events');
var ErrorHandler = require('../../ErrorHandler');

export default class NewGroup extends Component {
    constructor(props) {
        super(props);
        try {
            dismissKeyboard();
            this.isGetMyContacts = false;
            this.isGetMyFriends = false;
            this.isNewGroup = true;
            this.phnesNumbers = [];
            this.myFriends = [];
            this.GroupContacts = [];
            this.groupMembersCounter = 0;
            this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            this.ds2 = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            if (this.props.groupSource) {
                this.isNewGroup = false;
            }
            this.resetData = this.resetData.bind(this);
            if (!this.isNewGroup) {
                this.GroupContacts = this.props.groupSource._dataBlob.s1;
                this.groupMembersCounter = this.GroupContacts.length;
            }
            this.state = {
                dataSource: this.ds,
                filter: '',
                groupSource: this.ds2.cloneWithRows(this.GroupContacts)
            };
            this.UpdateMyFriends = this.UpdateMyFriends.bind(this);
            this.renderRow = this.renderRow.bind(this);
            this.onLayout = this.onLayout.bind(this);
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => constructor", e);
        }
    }

    componentDidMount() {
        try {
            BackAndroid.addEventListener('hardwareBackPress', () => {
                this.resetData();
            });
            setTimeout(() => {
                var ds = this.ds;
                Event.on('updateFriends', this.reloadFriendFromDB);
                Event.on('UpdateMyFriends', this.UpdateMyFriends);
                this.reloadFriendFromDB();
            }, 0);
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => componentDidMount", e);
        }
    }

    resetData() {
        try {
            this.myFriends.map((user) => {
                user.isHidden = false;
            });
            this.onFilterChange({ nativeEvent: { text: '' } });
            this.GroupContacts = [];
            this.groupMembersCounter = 0;
            this.setState({
                filter: '',
                groupSource: this.ds2.cloneWithRows(this.GroupContacts),
                dataSource: this.ds.cloneWithRows(this.myFriends)
            });
        } catch (error) {
            ErrorHandler.WriteError("NewGroup.js => resetData", e);
        }
    }

    onLayout(event) {
        try {
            this.setState({
                groupSource: this.ds2.cloneWithRows(this.GroupContacts),
                datasource: this.ds.cloneWithRows(this.myFriends)
            });
        } catch (error) {
            ErrorHandler.WriteError("NewGroup.js => onLayout", e);
        }
    }

    reloadFriendFromDB(isUpdate) {
        try {
            serverSrv.GetAllMyFriends(this.UpdateMyFriends, isUpdate);
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => reloadFriendFromDB", e);
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
            if (!this.isNewGroup) {
                this.GroupContactsIds = this.GroupContacts.map((user) => {
                    return user.id;
                });
                result.map((user) => {
                    if (this.GroupContactsIds.indexOf(user.id) >= 0) {
                        user.isHidden = true;
                    }
                    else {
                        user.isHidden = false;
                    }
                });
            }
            setTimeout(() => {
                this.setState({
                    dataSource: this.ds.cloneWithRows(result)
                })
            }, 20);
            this.myFriends = result;
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => UpdateMyFriends", e);
        }
    }

    onFilterChange(event) {
        try {
            this.setState({
                filter: event.nativeEvent.text,
                dataSource: this.getDataSource(event.nativeEvent.text)
            });
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => onFilterChange", e);
        }
    }

    getDataSource(fiterText) {
        try {
            //if filter is empty - return original data source
            if (!fiterText && this.state.dataSource.cloneWithRows) {
                return this.state.dataSource.cloneWithRows(this.myFriends);
            }
            //create filtered datasource
            let filteredContacts = this.myFriends;
            filteredContacts = this.myFriends.filter((user) => {
                return ((user.publicInfo.fullName.toLowerCase().includes(fiterText.toLowerCase())) || (user.phoneNumber ? user.phoneNumber.includes(fiterText) : false));
            });
            if (this.state.dataSource.cloneWithRows) {
                return this.state.dataSource.cloneWithRows(filteredContacts);
            }
            return this.state.dataSource;
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => getDataSource", e);
        }
    }

    render() {
        try {
            return (
                <View
                    style={generalStyle.styles.container}>
                    <View style={generalStyle.styles.appbar}>
                        <TouchableOpacity onPress={() => {
                            this.resetData();
                            Actions.pop();
                        }}>
                            <Icon name="ios-arrow-back" color="white" size={25} style={{ paddingLeft: 3, paddingRight: 8 }} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, justifyContent: 'flex-start', flexDirection: 'column', alignSelf: 'center' }}>
                            <Text style={styles.titleHeader}>
                                Add Participants
                        </Text>
                            <Text style={{ fontSize: 10, color: 'white' }}>
                                {this.groupMembersCounter} participants
                        </Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            if (this.GroupContacts.length == 0) {
                                var toast = Toast.show('At least 1 contact must be selected', {
                                    duration: Toast.durations.LONG,
                                    position: Toast.positions.BOTTOM,
                                    shadow: true,
                                    animation: true,
                                    hideOnPress: true,
                                    delay: 0
                                });
                                return;
                            }
                            if (this.isNewGroup) {
                                Actions.NewGroupInfo({ data: this.GroupContacts });
                            }
                            else {
                                var participantsArray = this.GroupContacts.map((user) => {
                                    return user.id;
                                });
                                Actions.Tabs({ type: 'reset' });
                                serverSrv.updateGroupParticipants(this.props.convId, participantsArray);
                            }
                        }}>
                            <Icon name="md-send" size={30} style={{ height: 40, padding: 5, color: 'white' }} />
                        </TouchableOpacity>
                    </View>
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
                            initialListSize={1}
                            stickyHeaderIndices={[]}
                            onEndReachedThreshold={1}
                            scrollRenderAheadDistance={20}
                            pageSize={20}
                            renderRow={this.renderRow()}
                        />
                    </View>
                    <View style={styles.groupBar}>
                        <SGListView style={{ padding: 5, flex: 1, flexDirection: 'row' }}
                            enableEmptySections={true}
                            dataSource={this.state.groupSource}
                            initialListSize={1}
                            stickyHeaderIndices={[]}
                            onEndReachedThreshold={1}
                            scrollRenderAheadDistance={20}
                            pageSize={20}
                            horizontal={true}
                            renderRow={this.renderGroup()}
                        />
                    </View>
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => render", e);
        }
    }

    renderRow() {
        try {
            return (
                (rowData) =>
                    <View>
                        {renderIf(!rowData.isHidden)(
                            <TouchableOpacity onPress={() => {
                                if (!this.GroupContacts) {
                                    this.GroupContacts = [];
                                }
                                if (this.GroupContacts.indexOf(rowData) === -1) {
                                    this.GroupContacts.push(rowData);
                                    this.groupMembersCounter++;
                                    rowData.isHidden = true;
                                    this.myFriends.map((user) => {
                                        if (user.id == rowData.id) {
                                            user.isHidden = true;
                                        }
                                    });
                                }

                                this.setState({
                                    groupSource: this.ds2.cloneWithRows(this.GroupContacts),
                                    dataSource: this.ds.cloneWithRows(this.myFriends)
                                });
                            }}>
                                <View style={generalStyle.styles.row}>
                                    <View style={generalStyle.styles.viewImg}>
                                        <Image style={generalStyle.styles.thumb} source={rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')} />
                                    </View>
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
                        )}
                    </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => renderRow", e);
        }
    }

    renderGroup() {
        try {
            return (
                (rowData) =>
                    <TouchableOpacity onPress={() => {
                        if (rowData.id != serverSrv._uid) {
                            this.GroupContacts.splice(this.GroupContacts.indexOf(rowData), 1);
                            this.groupMembersCounter--;
                            rowData.isHidden = false;
                            this.myFriends.map((user) => {
                                if (user.id == rowData.id) {
                                    user.isHidden = false;
                                }
                            });
                        }
                        this.setState({
                            groupSource: this.ds2.cloneWithRows(this.GroupContacts),
                            dataSource: this.ds.cloneWithRows(this.myFriends)
                        });
                    }}>
                        <View style={{ paddingBottom: 5, paddingLeft: 5, paddingRight: 5, alignItems: 'center' }}>
                            <Image style={styles.groupMemberPic} source={rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')} />
                            {renderIf(rowData.id == serverSrv._uid)(
                                <Text style={styles.groupMemberName}>
                                    You
                            </Text>
                            )}
                            {renderIf(rowData.id != serverSrv._uid)(
                                <Text style={styles.groupMemberName}>
                                    {rowData.publicInfo.fullName}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity >
            );
        } catch (e) {
            ErrorHandler.WriteError("NewGroup.js => renderGroup", e);
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
    },
    titleHeader: {
        textAlign: 'left',
        fontSize: 18,
        color: 'white',
    },
    groupBar: {
        flexDirection: 'row',
        height: 70,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderTopWidth: 0.5,
        borderColor: '#e7e7e7'
    },
    groupMemberPic: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 40,
        height: 40,
        marginBottom: 2
    },
    groupMemberName: {
        color: 'grey',
        fontSize: 10
    },
});