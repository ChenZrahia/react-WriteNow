import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

var ErrorHandler = require('../../ErrorHandler');

export default class Actions extends React.Component {
    constructor(props) {
        super(props);
        try {
            this.onActionsPress = this.onActionsPress.bind(this);
        } catch (e) {
            ErrorHandler.WriteError('Actions.js => constructor', e);
        }
    }

    onActionsPress() {
        try {
            const options = Object.keys(this.props.options);
            const cancelButtonIndex = Object.keys(this.props.options).length - 1;
            this.context.actionSheet().showActionSheetWithOptions({
                options,
                cancelButtonIndex,
            },
                (buttonIndex) => {
                    let i = 0;
                    for (let key in this.props.options) {
                        if (this.props.options.hasOwnProperty(key)) {
                            if (buttonIndex === i) {
                                this.props.options[key](this.props);
                                return;
                            }
                            i++;
                        }
                    }
                });
        } catch (e) {
            ErrorHandler.WriteError('Actions.js => onActionsPress', e);
        }
    }

    renderIcon() {
        try {
            if (this.props.icon) {
                return this.props.icon();
            }
            return (
                <View
                    style={[styles.wrapper, this.props.wrapperStyle]}
                    >
                    <Text
                        style={[styles.iconText, this.props.iconTextStyle]}
                        >
                        +
        </Text>
                </View>
            );
        } catch (e) {
            ErrorHandler.WriteError('Actions.js => renderIcon', e);
        }
    }

    render() {
        try {
            return (
                <TouchableOpacity
                    style={[styles.container, this.props.containerStyle]}
                    onPress={this.onActionsPress}
                    >
                    {this.renderIcon()}
                </TouchableOpacity>
            );
        } catch (e) {
            ErrorHandler.WriteError('Actions.js => render', e);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

Actions.contextTypes = {
    actionSheet: React.PropTypes.func,
};

Actions.defaultProps = {
    onSend: () => { },
    options: {},
    icon: null,
    containerStyle: {},
    iconTextStyle: {},
};

Actions.propTypes = {
    onSend: React.PropTypes.func,
    options: React.PropTypes.object,
    icon: React.PropTypes.func,
    containerStyle: View.propTypes.style,
    iconTextStyle: Text.propTypes.style,
};
