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
//var PhoneContacts = require('react-native-contacts')

export default class Contacts extends Component {
    constructor() {
        super();
                    // PhoneContacts.getAll((err, p_contacts) => { אתה תצטרך את זה
            //     if (err && err.type === 'permissionDenied') {
            //         // x.x
            //     } else {
            //         console.log(contacts)
            //     }
            // })
        this.myFriends = [];
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows(this.myFriends),
            imageVisible: false
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

    setImageVisible(visible) {
        this.setState({ imageVisible: visible });
    }

    render() {
        return (
            <View style={{ flex: 1, alignSelf: 'stretch' }}>
                <ListView style={{ paddingTop: 5, flex: 1 }}
                    enableEmptySections={true}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) =>
                        <View>
                            <TouchableHighlight underlayColor='#ededed' onPress={() => {
                            } }>
                                <View style={styles.row}>
                                    <TouchableHighlight onPress={() => {
                                        this.imgSelected = rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')
                                        this.setImageVisible(true);
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
                        </View>
                    }
                    />
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.imageVisible}
                    onRequestClose={() => { console.log('image closed') } }
                    >
                    <View style={styles.imageModal}>
                        <TouchableHighlight onPress={() => {
                            this.setImageVisible(!this.state.imageVisible)
                        } }>
                            <Image style={styles.imageInsideModal} source={ this.imgSelected }/>
                        </TouchableHighlight>
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
    },
    imageModal: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageInsideModal: {
        width: 200,
        height: 200,
        borderRadius: 10,
        borderWidth: 1
    }
});