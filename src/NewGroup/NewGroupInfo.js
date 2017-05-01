import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TextInput,
    Image,
    View,
    ListView,
    Modal,
    NativeModules,
    TouchableOpacity,
} from 'react-native';
import { Actions } from 'react-native-router-flux'
import Toast from 'react-native-root-toast';
import Fumi from '../../styles/Fumi';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import ImageResizer from 'react-native-image-resizer';
import SGListView from 'react-native-sglistview';
import Icon from 'react-native-vector-icons/Ionicons';
import renderIf from '../../plugins/renderIf';

var Event = require('../../Services/Events');
var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');
var generalStyles = require('../../styles/generalStyle');
var ErrorHandler = require('../../ErrorHandler');
var serverSrv = require('../../Services/serverSrv');
var disabled = false;
var profileImg = '';
var options = {
    title: 'Select Group Image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    },
    allowsEditing: true
};

export default class NewGroupInfo extends Component {
    constructor(props) {
        super(props);
        this.isNewGroup = true;
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.props.groupName) {
            this.isNewGroup = false;
        }
        if (this.isNewGroup) {
            this.state = {
                groupName: "",
                groupAvatar: require('../../img/group-img.jpg'),
                groupSource: this.ds.cloneWithRows(this.props.data)
            }
        }
        else {
            this.state = {
                groupName: this.props.groupName,
                groupAvatar: { uri: this.props.groupPicture },
                groupSource: this.ds.cloneWithRows(this.props.groupSource)
            }
        }
    }

    showImagePicker = () => {
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                ErrorHandler.WriteError('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // You can display the image using either data...
                const source = { uri: 'data:image/jpeg;base64,' + response.data, isStatic: true };
                // or a reference to the platform specific asset location
                if (Platform.OS === 'ios') {
                    const source = { uri: response.uri.replace('file://', ''), isStatic: true };
                } else {
                    const source = { uri: response.uri, isStatic: true };
                }
                ImageResizer.createResizedImage(response.uri, 400, 400, 'JPEG', 100, 0, null).then((resizedImageUri) => {
                    NativeModules.RNImageToBase64.getBase64String(resizedImageUri, (err, base64) => {
                        profileImg = 'data:image/jpeg;base64,' + base64;
                    })
                }).catch((err) => {
                    ErrorHandler.WriteError('NewGroupInfo.js => showImagePicker => createResizedImage', err);
                });
                this.setState({
                    groupAvatar: source
                });
            }
        });
    }

    render() {
        try {
            return (
                <View style={styles.container}>
                    <View style={{
                        flex: 1,
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                    }}>
                        <Image source={require("../../img/signUpBAckground.png")} style={{ resizeMode: 'stretch', width: null, height: 20, flex: 1 }}>
                            <View style={{
                                flex: 1,
                                alignSelf: 'stretch',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}>
                                {renderIf(this.isNewGroup)(
                                    <Text style={styles.Welcome}>
                                        New Group Information
                                </Text>
                                )}
                                {renderIf(!this.isNewGroup)(
                                    <Text style={styles.Welcome}>
                                        Update Group Information
                                </Text>
                                )}
                                <TouchableOpacity onPress={this.showImagePicker} >
                                    <View style={styles.viewImg}>
                                        <Image style={styles.UserImage} source={this.state.groupAvatar} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Image>
                    </View>
                    <View style={{ flex: 1 }}>
                        {renderIf(this.isNewGroup)(
                            <Fumi
                                label={'Group Name'}
                                iconClass={FontAwesomeIcon}
                                iconName={'users'}
                                iconColor={'#f50057'}
                                style={styles.input}
                                autoCapitalize="words"
                                onChangeText={(val) => this.setState({ groupName: val })}
                            />
                        )}
                        {renderIf(!this.isNewGroup)(
                            <Fumi
                                label={this.state.groupName}
                                iconClass={FontAwesomeIcon}
                                iconName={'users'}
                                iconColor={'#f50057'}
                                style={styles.input}
                                autoCapitalize="words"
                                onChangeText={(val) => this.setState({ groupName: val })}
                            />
                        )}
                        {renderIf(this.isNewGroup)(
                            <View style={styles.groupBar}>
                                <SGListView style={{ padding: 5, flex: 1, flexDirection: 'row' }}
                                    enableEmptySections={true}
                                    dataSource={this.state.groupSource}
                                    initialListSize={1}
                                    stickyHeaderIndices={[]}
                                    onEndReachedThreshold={1}
                                    scrollRenderAheadDistance={20}
                                    pageSize={20}
                                    horizontal={true}
                                    renderRow={this.renderGroup()}
                                />
                            </View>
                        )}
                        {renderIf(this.isNewGroup)(
                            <TouchableOpacity disabled={disabled} style={styles.button} underlayColor='#ededed' onPress={() => {
                                if (!this.state.groupName) {
                                    var toast = Toast.show('Provide a group name', {
                                        duration: Toast.durations.LONG,
                                        position: Toast.positions.BOTTOM,
                                        shadow: true,
                                        animation: true,
                                        hideOnPress: true,
                                        delay: 0
                                    });
                                    return;  
                                } 
                                var participateArray = this.props.data.map((user) => {
                                    return user.id;
                                });
                                serverSrv.createNewGroup(this.state.groupName, this.state.groupAvatar.uri, participateArray);
                                Actions.Tabs({ type: 'reset' });
                            }}>
                                <View>
                                    <Text style={styles.buttonText}>Create Group</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {renderIf(!this.isNewGroup)(
                            <TouchableOpacity disabled={disabled} style={[styles.button, styles.button2]} underlayColor='#ededed' onPress={() => {
                                serverSrv.updateGroupInfo(this.props.convId, this.state.groupName, this.state.groupAvatar.uri);
                                Event.trigger('UpdateChatInfo', {
                                    convId: this.props.convId,
                                    groupName: this.state.groupName,
                                    groupPicture: this.state.groupAvatar.uri
                                });
                            }}>
                                <View>
                                    <Text style={styles.buttonText}>Update Group</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ alignSelf: 'flex-start' }}>
                        <TouchableOpacity onPress={() => {
                            Actions.pop();
                        }}>
                            <View style={{ height: 35, width: 35, borderRadius: 20, backgroundColor: '#f50057', margin: 10 }}>
                                <Icon name="md-arrow-back" size={30} color="white" style={{ paddingTop: 3, alignSelf: 'center' }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('NewGroupInfo.js => render', e);
        }
    }

    renderGroup() {
        try {
            return (
                (rowData) =>
                    <View style={{ paddingBottom: 5, paddingLeft: 5, paddingRight: 5, alignItems: 'center' }}>
                        <Image style={styles.groupMemberPic} source={rowData.publicInfo.picture ? { uri: rowData.publicInfo.picture } : require('../../img/user.jpg')} />
                        <Text style={styles.groupMemberName}>
                            {rowData.publicInfo.fullName}
                        </Text>
                    </View>
            );
        } catch (e) {
            ErrorHandler.WriteError("NewGroupInfo.js => renderGroup", e);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    Welcome: {
        fontSize: 24,
        alignSelf: 'center',
        marginTop: 5,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: 'black',
        textShadowRadius: 2,
        textShadowOffset: {
            height: 1.5,
            width: 1
        }
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    input: {
        height: 45,
        width: 300,
        marginTop: 10,
        padding: 2,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#f50057'
    },
    UserImage: {
        width: 110,
        height: 110,
        borderRadius: 10,
    },
    button: {
        height: 40,
        width: 120,
        backgroundColor: '#f50057',
        borderColor: '#f50057',
        borderRadius: 10,
        marginLeft: 10,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    button2: {
        marginTop: 20
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    viewImg: {
        borderColor: 'black',
        elevation: 8,
        borderRadius: 10,
        margin: 10,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    groupBar: {
        flexDirection: 'row',
        height: 80,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderTopWidth: 0.5,
        borderColor: '#e7e7e7',
        paddingTop: 10,
        marginBottom: 5
    },
    groupMemberPic: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 40,
        height: 40,
    },
    groupMemberName: {
        color: 'grey',
        fontSize: 10
    },
});