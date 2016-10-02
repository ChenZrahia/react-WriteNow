import React, { Component } from 'react';
import { Image,
    ReactNative,
    ListView,
    TouchableHighlight,
    StyleSheet,
    RecyclerViewBackedScrollView,
    Text,
    View,
    Modal } from 'react-native';

var serverSrv = require('../../Services/serverSrv');

export default class Contacts extends Component {
    constructor() {
        super();
        this.myFriends = [];
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows(this.myFriends),
            modalVisible: false
        };
        serverSrv.GetAllMyFriends((result) => {
            this.myFriends = result;
            setTimeout(() => {
                this.setState({
                    dataSource: ds.cloneWithRows(result)
                })
            }, 1000);
        });
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
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
                                <TouchableHighlight onPress={() => {
                                    this.setModalVisible(true)
                                } }>
                                    <View style={styles.viewImg}>
                                        <Image style={styles.thumb} source={ rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg') }/>
                                    </View>
                                </TouchableHighlight>
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
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { console.log("Modal has been closed.") } }>
                    <View>
                        <Text>Hello World</Text>
                        <Image style={styles.thumb} source={{ uri: 'http://img.mako.co.il/2016/09/21/709707_I_reduced.jpg' }}/>
                    </View>
                </Modal>
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