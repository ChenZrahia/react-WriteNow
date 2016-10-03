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
            this.myChats = result;
            setTimeout(() => {
                this.setState({
                    dataSource: ds.cloneWithRows(result)
                })
            }, 0);

            this.state = {
                dataSource: ds.cloneWithRows(this.myChats)
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
                                    
                                    <Image style={styles.thumb} source={ rowData.isGroup && rowData.groupPicture ? {uri: rowData.groupPicture} : (rowData.participates[0] && rowData.participates[0].publicInfo && rowData.participates[0].publicInfo.picture && !rowData.isGroup ? { uri: rowData.participates[0].publicInfo.picture} : require('../../img/user.jpg')) }/>
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.textName}>
                                        { rowData.isGroup == true ? rowData.groupName : rowData.participates[0].publicInfo.fullName }
                                    </Text>
                                    <Text style={styles.textStatus}>
                                        {(() => {
                                            if (rowData.messages && rowData.messages.length > 0 && rowData.isGroup == false) {
                                                return rowData.messages[0].content;
                                            } else if (rowData.messages && rowData.messages.length > 0 && rowData.isGroup == true) {
                                                return rowData.messages[0].lastMsgSender + rowData.messages[0].content;
                                            }
                                        }) }
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