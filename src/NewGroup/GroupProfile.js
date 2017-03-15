import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ListView,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    TextInput
} from 'react-native';
import FitImage from '../../plugins/FitImage';
import SGListView from 'react-native-sglistview';
import { Actions } from 'react-native-router-flux';
import renderIf from '../../plugins/renderIf';
import Icon from 'react-native-vector-icons/Ionicons';

var dismissKeyboard = require('dismissKeyboard');
var ErrorHandler = require('../../ErrorHandler');
var serverSrv = require('../../Services/serverSrv');
var generalStyle = require('../../styles/generalStyle');

export default class GroupProfile extends Component {
    constructor() {
        super();
        try {
            dismissKeyboard();
            this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            this.groupMembers = {};
            this.groupManagers = [];
            this.state = {
                dataSource: this.ds.cloneWithRows([]),
                imageVisible: false
            }
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile.js => constructor", e);
        }
    }

    componentDidMount() {
        serverSrv.getConvParticipates(this.props.convId, (result) => {
            this.groupMembers = result;
            this.setState({
                dataSource: this.ds.cloneWithRows(this.groupMembers)
            });
        });
        serverSrv.getGroupManagers(this.props.convId, (result) => {
            this.groupManagers = result;
            this.setState({
                managerSource: this.ds.cloneWithRows(result)
            });
        });
    }

    renderTextParticipate(rowData) {
        try {
            if (this.groupManagers.indexOf(rowData.id) >= 0) {
                return (
                    <View style={styles.managerTag}>
                        <Text style={{ alignSelf: 'center', color: 'purple', padding: 2 }}>manager</Text>
                    </View>
                );
            }
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile.js => renderTextParticipate", e);
        }
    }

    renderRow() {
        try {
            return (
                (rowData) =>
                    <View>
                        <TouchableOpacity onPress={() => {
                        }}>
                            <View style={generalStyle.styles.row}>
                                <View style={generalStyle.styles.viewImg}>
                                    <Image style={generalStyle.styles.thumb} source={rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')} />
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    {rednerIf(rowData.id == serverSrv._uid)(
                                        <Text style={generalStyle.styles.textName}>
                                            You
                                    </Text>
                                    )}
                                    {rednerIf(rowData.id != serverSrv._uid)(
                                        <Text style={generalStyle.styles.textName}>
                                            {rowData.publicInfo.fullName}
                                        </Text>
                                    )}
                                    <Text style={generalStyle.styles.textStatus}>
                                        {rowData.phoneNumber}
                                    </Text>
                                </View>
                                {this.renderTextParticipate(rowData)}
                            </View>
                        </TouchableOpacity>
                    </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile.js => renderRow", e);
        }
    }

    setImageVisible(visible) {
        try {
            this.setState({ imageVisible: visible });
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile.js => setImageVisible", e);
        }
    }

    getImageSource(img) {
        try {
            if (img) {
                return (
                    <FitImage
                        indicator
                        originalWidth={400}
                        originalHeight={400}
                        style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }}
                        source={{ uri: img }}
                    />)
            } else {
                return (<Image style={{ width: 300, height: 300, marginLeft: 5, marginRight: 5, marginBottom: 5 }} source={require('../../img/group-img.jpg')} />);
            }
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile.js => getImageSource", e);
        }
    }

    render() {
        try {
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <TouchableOpacity onPress={() => {
                            Actions.pop();
                        }}>
                            <Icon name="ios-arrow-back" color="white" size={25} style={{ paddingLeft: 3, paddingRight: 8 }} />
                        </TouchableOpacity>
                        <Text style={{ color: 'white', fontSize: 25 }}>
                            {this.props.userName}
                        </Text>
                        {renderIf(this.groupManagers.indexOf(serverSrv._uid) >= 0)(
                            <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => {
                                    Actions.NewGroup({
                                        convId: this.props.convId,
                                        groupPicture: this.props.userPicture,
                                        groupName: this.props.userName,
                                        groupSource: this.state.dataSource
                                    });
                                }}>
                                    <Icon name="ios-person-add" size={25} color="white" style={{ paddingRight: 10 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    Actions.NewGroupInfo({
                                        convId: this.props.convId,
                                        groupPicture: this.props.userPicture,
                                        groupName: this.props.userName,
                                        groupSource: this.state.dataSource
                                    });
                                }}>
                                    <Icon name="ios-create" size={25} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {renderIf(this.groupManagers.indexOf(serverSrv._uid) < 0)(
                            <TouchableOpacity onPress={() => {
                                Actions.NewGroupInfo({ convId: this.props.convId, groupPicture: this.props.userPicture, groupName: this.props.userName, groupSource: this.state.dataSource });
                            }}>
                                <Icon name="ios-create" size={25} color="white" style={{ alignItems: 'flex-end' }} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <ScrollView style={{ flex: 1, backgroundColor: '#e7e7e7' }}>
                        <TouchableOpacity on Press={() => {
                            this.setImageVisible(true);
                        }}>
                            {this.getImageSource(this.props.userPicture)}
                        </TouchableOpacity>
                        <View style={{ flex: 1, backgroundColor: 'white', marginLeft: 5, marginRight: 5 }}>
                            <Text style={{ color: 'purple', paddingLeft: 5 }}>Group participants</Text>
                            <SGListView style={{ paddingTop: 5 }}
                                enableEmptySections={true}
                                dataSource={this.state.dataSource}
                                initialListSize={30}
                                stickyHeaderIndices={[]}
                                onEndReachedThreshold={1}
                                scrollRenderAheadDistance={50}
                                pageSize={30}
                                renderRow={this.renderRow()}
                            />
                        </View>
                    </ScrollView>
                    {this.openImageModal({ uri: this.props.userPicture })}
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile => render", e);
        }
    }

    openImageModal(image) {
        try {
            return (
                <Modal
                    transparent={true}
                    visible={this.state.imageVisible}
                    onRequestClose={() => { console.log('image closed') }}
                >
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                        this.setImageVisible(!this.state.imageVisible)
                    }}>
                        <View style={generalStyle.styles.imageModal}>
                            <Image style={generalStyle.styles.imageInsideModal} source={image} />
                        </View>
                    </TouchableOpacity>
                </Modal>
            );
        } catch (e) {
            ErrorHandler.WriteError("GroupProfile.js => openImageModal", e);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        flexDirection: 'row',
        backgroundColor: '#9933FF',
        margin: 5,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    managerTag: {
        borderColor: 'purple',
        borderWidth: 0.5,
        borderRadius: 5,
        marginLeft: 200,
        alignSelf: 'center',
    }
});