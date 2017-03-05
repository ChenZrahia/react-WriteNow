import { StyleSheet } from 'react-native';

var mainColor = '#9933FF';
var secondColor = '#f50057';
var darkColor = '#6f00de';

export var _mainColor = mainColor;
export var _darkColor = darkColor;
export var _secondColor = secondColor;

export const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#6A85B1',
        flex: 1,
    },
    container: {
        flex: 1,
    },
    titleHeader: {
        flex: 1,
        margin: 10,
        textAlign: 'left',
        fontSize: 18,
        color: 'white',
    },
    titleHeaderContainer: {
        flex: 1,
        marginTop: 5
    },
    statusbar: {
        backgroundColor: '#820cf7',
        height: 24,
    },
    appbar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: mainColor,
        elevation: 4,
        paddingLeft: 7,
        justifyContent: 'space-between'
    },
    row: {
        flexDirection: 'row',
        paddingRight: 5,
        paddingLeft: 5,
        borderBottomWidth: 0.5,
        borderColor: '#e7e7e7',
        backgroundColor: 'white',
        maxHeight: 50,
        height: 50
    },
    viewImg: {
        borderColor: 'black',
        elevation: 3,
        borderRadius: 4,
        margin: 4
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
        paddingRight: 10,
        color: 'black',
        alignSelf: 'flex-start'
    },
    textStatus: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        color: 'gray',
        alignSelf: 'flex-start',
        maxHeight: 25
    },
    textDate: {
        color: 'gray',
        alignSelf: 'flex-end',
        fontSize: 12
    },
    imageModal: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageInsideModal: {
        width: 200,
        height: 200,
        borderRadius: 10,
        borderWidth: 1
    },
      encryptedMessageModal: {
        flex: 1,
        height: 200,
        borderRadius: 10,
        backgroundColor: 'white'
    },
        encryptedMessageHeader: {
        flexDirection: 'row',
        flex: 0.5,
        alignItems: 'center',
        height: 40,
        width:350,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: mainColor,
        elevation: 4,
        paddingLeft: 7,
        justifyContent: 'center'
    },
    iconContainer:{
        width: 30,
        alignItems:'flex-end',
        justifyContent:'center',
        paddingRight: 5
    }
});