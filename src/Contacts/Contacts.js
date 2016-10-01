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

export default class Contacts extends Component {
    constructor() {
        super();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows([
                {
                    id: '9dd93195-04cb-40a3-8f32-26fb43d100ee',
                    phoneNumber: null,
                    ModifyDate: 1474052912104,
                    ModifyPicDate: 1474052900613,
                    publicInfo: {
                        fullName: 'rugbin ionic',
                        mail: 'hozeleto@gmail.com',
                        picture: 'data:image/jpeg;base64,/9j/4AA...'
                    }
                },
                {
                    id: '9dd93195-04cb-4ba3-8f32-26fb43d100ee',
                    phoneNumber: null,
                    ModifyDate: 1474052912104,
                    ModifyPicDate: 1474052900613,
                    publicInfo: {
                        fullName: 'rugbin apk',
                        mail: 'hozeleto@gmail.com',
                        picture: 'data:image/jpeg;base64,/9j/4AA...'
                    }
                }]),
        };
        serverSrv.getMyFriends((result) => {
            this.myFriends = result;
            console.log(result);
        })
    }

    render() {
        return (
            <ListView
                dataSource={this.state.dataSource}
                renderRow={(rowData) => <Text>rugbin gay</Text>}
                />
        );
    }
}