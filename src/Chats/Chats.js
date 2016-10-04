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

export default class Chats extends Component {
    constructor() {
        super();
        this.myChats = [];
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows(this.myChats)
        };
        serverSrv.GetAllUserConv((result) => {
            try {
                this.myChats = result;
                console.log(result.length);
                console.log(this.myChats.length);
                console.log('this.myChats.length');
                setTimeout(() => {
                    try {
                        this.setState({
                            dataSource: ds.cloneWithRows(result)
                        })
                    } catch (error) {
                        console.log('error');
                        console.log(error);
                    }
                }, 100);

                this.state = {
                    dataSource: ds.cloneWithRows(this.myChats)
                };
            } catch (error) {
                console.log(error);
            }

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

                                    <Image style={styles.thumb} source={ rowData.groupPicture ? { uri: rowData.groupPicture } : (rowData.isGroup ? require('../../img/user.jpg') : require('../../img/user.jpg')) }/>
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.textName}>
                                        { rowData.groupName }
                                    </Text>
                                    <Text style={styles.textStatus}>
                                        {rowData.lastMessage}
                                    </Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    }
                    />
            </View>
        );
    }
}                                        // {(() => {
//     if (rowData.messages && rowData.messages.length > 0 && rowData.isGroup == false) {
//         return rowData.messages[0].content;
//     } else if (rowData.messages && rowData.messages.length > 0 && rowData.isGroup == true) {
//         return rowData.messages[0].lastMsgSender + rowData.messages[0].content;
//     }
// }) }

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