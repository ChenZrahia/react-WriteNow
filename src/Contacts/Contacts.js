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
        this.myFriends = [];
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows(this.myFriends)            
        };
        serverSrv.GetAllMyFriends((result) => {
            this.myFriends = result;
            this.setState({
                dataSource: ds.cloneWithRows(result)
            })

            // this.state = {
            //     dataSource: ds.cloneWithRows(this.myFriends)
            // };
        });
    }

    render() {
        return (
            <ListView
                enableEmptySections={true}
                dataSource={this.state.dataSource}
                renderRow={(rowData) =>
                    <View style={styles.row}>
                        <Image style={styles.thumb} source={{uri: rowData.publicInfo.picture}}/>
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