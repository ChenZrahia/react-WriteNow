import { StyleSheet } from 'react-native';

var mainColor = '#9933FF';
var secondColor = '#f50057';

export var _mainColor = mainColor;
export var _secondColor = secondColor;

export const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#6A85B1',
        flex: 1,
    },
    container: {
        flex: 1,
    },
    viewImgChatRoom: {
        borderColor: 'black',
        elevation: 3,
        borderRadius: 4,
        paddingRight: 7,

    },
    ImgChatRoom: {
        borderRadius: 4,
        borderWidth: 0.5,
        width: 40,
        height: 40,
        alignSelf: 'flex-end'
    },
    titleHeader: {
        flex: 1,
        margin: 16,
        textAlign: 'left',
        fontSize: 18,
        color: 'white',
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
        justifyContent: 'space-between',
    },
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
        paddingRight: 10,
        color: 'black',
        alignSelf: 'flex-start'
    },
    textStatus: {
        paddingLeft: 10,
        paddingRight: 10,
        color: 'gray',
        alignSelf: 'flex-start'
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
});