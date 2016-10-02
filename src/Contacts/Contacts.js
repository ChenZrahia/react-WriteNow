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
            <ListView style={{ paddingTop: 5 }}
                enableEmptySections={true}
                dataSource={this.state.dataSource}
                renderRow={(rowData) =>
                    <TouchableHighlight onPress={() => {
                    } }>
                        <View>
                            <View style={styles.row}>
                                <Image style={styles.thumb} source={{ uri: rowData.publicInfo.picture }}/>
                                <Text style={styles.text}>
                                    {rowData.publicInfo.fullName}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlight>}
                renderSeperator={
                    <View style={{ height: 4, backgroundColor: 'black' }}
                        />}
                />
        );
    }
}

setTimeout(() => {
    throw "Reload";
}, 10000);

var styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 5,
        backgroundColor: '#F6F6F6',
        alignItems: 'flex-start'
    },
    thumb: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 40,
        height: 40,
    },
    text: {
        flex: 1,
        width: 100,
        height: 40,
        paddingLeft: 10
    }
});