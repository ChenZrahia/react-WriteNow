import React, { Component } from 'react';
import { Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    StyleSheet,
    RecyclerViewBackedScrollView,
    Text,
    View, } from 'react-native';

var serverSrv = require('../../Services/serverSrv');
//var PhoneContacts = require('react-native-contacts')

export default class Contacts extends Component {
    constructor() {
        super();
        this.myFriends = [];
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        // PhoneContacts.getAll((err, p_contacts) => {
        //     if (err && err.type === 'permissionDenied') {
        //         // x.x
        //     } else {
        //         console.log(contacts)
        //     }
        // })

        this.state = {
            dataSource: ds.cloneWithRows(this.myFriends)
        };
        serverSrv.GetAllMyFriends((result) => {
            this.myFriends = result;
            setTimeout(() => {
                this.setState({
                    dataSource: ds.cloneWithRows(result)
                })
            }, 1000);

            this.state = {
                dataSource: ds.cloneWithRows(this.myFriends)
            };
        });
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <ListView style={{ paddingTop: 5, flex: 1 }}
                    enableEmptySections={true}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) =>
                        <TouchableHighlight underlayColor='#ededed' onPress={() => {
                        } }>
                            <View style={styles.row}>
                                <View style={styles.viewImg}>
                                    <Image style={styles.thumb} source={ rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg') }/>
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.textName}>
                                        {rowData.publicInfo.fullName}
                                    </Text>
                                    <Text style={styles.textStatus}>
                                        {rowData.publicInfo.isOnline ? 'online' : 'offline'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    }
                    />
            </View>
        );
    }


}

// setTimeout(() => {
//     throw "Reload";
// }, 20000);

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
        color: 'black',
        alignSelf: 'flex-start'
    },
    textStatus: {
        paddingLeft: 10,
        color: 'gray',
        alignSelf: 'flex-start'
    }
});