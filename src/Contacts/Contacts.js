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
                        picture: 'http://www.maariv.co.il/HttpHandlers/ShowImage.ashx?id=338891&w=758&h=530'
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
                        picture: 'http://www.maariv.co.il/HttpHandlers/ShowImage.ashx?id=338891&w=758&h=530'
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
                renderRow={(rowData) =>
                    <View style={styles.row}>
                        <Image style={styles.thumb} source={rowData.publicInfo.picture} />
                        <Text style={styles.text}>
                            {rowData.publicInfo.fullName}
                        </Text>
                    </View>}
                />
        );
    }
}

var styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#F6F6F6',
    },
    thumb: {
        width: 64,
        height: 64,
    },
    text: {
        flex: 1,
    }
});