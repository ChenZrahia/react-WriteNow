import React from 'react';
import {
  ListView,
  View,
  TouchableOpacity,
} from 'react-native';
import shallowequal from 'shallowequal';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import md5 from 'md5';
import LoadEarlier from './LoadEarlier';
import Message from './Message';

var ErrorHandler = require('../../ErrorHandler');

export default class MessageContainer extends React.Component {
  constructor(props) {
    super(props);
    try {
      this.renderRow = this.renderRow.bind(this);
      this.renderFooter = this.renderFooter.bind(this);
      this.renderLoadEarlier = this.renderLoadEarlier.bind(this);
      this.renderScrollComponent = this.renderScrollComponent.bind(this);
      const dataSource = new ListView.DataSource({
        rowHasChanged: (r1, r2) => {
          return r1.hash !== r2.hash;
        }
      });

      const messagesData = this.prepareMessages(props.messages);
      this.state = {
        dataSource: dataSource.cloneWithRows(messagesData.blob, messagesData.keys)
      };
    } catch (e) {
      ErrorHandler.WriteError('MessageContainer.js => constructor', e);
    }
  }

  prepareMessages(messages) {
    try {
      return {
        keys: messages.map(m => m._id),
        blob: messages.reduce((o, m, i) => {
          const previousMessage = messages[i + 1] || {};
          const nextMessage = messages[i - 1] || {};
          // add next and previous messages to hash to ensure updates
          const toHash = JSON.stringify(m) + previousMessage._id + nextMessage._id;
          o[m._id] = {
          ...m,
          previousMessage,
          nextMessage,
          hash: md5(toHash)
        };
      return o;
    }, { })
  };
} catch (e) {
  ErrorHandler.WriteError('MessageContainer.js => prepareMessages', e);
}
  }

shouldComponentUpdate(nextProps, nextState) {
  try {
    if (!shallowequal(this.props, nextProps)) {
      return true;
    }
    if (!shallowequal(this.state, nextState)) {
      return true;
    }
    return false;
  } catch (e) {
    ErrorHandler.WriteError('MessageContainer.js => shouldComponentUpdate', e);
  }
}

componentWillReceiveProps(nextProps) {
  try {
    if (this.props.messages === nextProps.messages) {
      return;
    }
    const messagesData = this.prepareMessages(nextProps.messages);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(messagesData.blob, messagesData.keys)
    });
  } catch (e) {
    ErrorHandler.WriteError('MessageContainer.js => componentWillReceiveProps', e);
  }
}

renderFooter() {
  try {
    if (this.props.renderFooter) {
      const footerProps = {
        ...this.props,
      };
    return this.props.renderFooter(footerProps);
  }
return null;
} catch (e) {
  ErrorHandler.WriteError('MessageContainer.js => renderFooter', e);
}
  }

renderLoadEarlier() {
  try {
    if (this.props.loadEarlier === true) {
      const loadEarlierProps = {
        ...this.props,
      };
    if (this.props.renderLoadEarlier) {
      return this.props.renderLoadEarlier(loadEarlierProps);
    }
    return (
      <LoadEarlier {...loadEarlierProps} />
    );
  }
return null;
} catch (e) {
  ErrorHandler.WriteError('MessageContainer.js => renderLoadEarlier', e);
}
}

scrollTo(options) {
  try {
    this._invertibleScrollViewRef.scrollTo(options);
  } catch (e) {
    ErrorHandler.WriteError('MessageContainer.js => scrollTo', e);
  }
}




renderRow(message, sectionId, rowId) {
  try {
    if (!message._id && message._id !== 0) {
      console.warn('GiftedChat: `_id` is missing for message', JSON.stringify(message));
    }
    if (!message.user) {
      console.warn('GiftedChat: `user` is missing for message', JSON.stringify(message));
      message.user = {};
    }

    const messageProps = {
      ...this.props,
      key: message._id,
        currentMessage: message,
          previousMessage: message.previousMessage,
            nextMessage: message.nextMessage,
              position: !message.user._id || message.user._id === this.props.user._id ? 'right' : 'left',
    };

  if (this.props.renderMessage) {
    return this.props.renderMessage(messageProps);
  }

   return  <Message {...messageProps} />
    
 
} catch (e) {
  ErrorHandler.WriteError('MessageContainer.js => renderRow', e);
}
  }

renderScrollComponent(props) {
  try {
    const invertibleScrollViewProps = this.props.invertibleScrollViewProps;
    return (
      <InvertibleScrollView
        {...props}
        {...invertibleScrollViewProps}
        ref={component => this._invertibleScrollViewRef = component}
        />
    );
  } catch (e) {
    ErrorHandler.WriteError('MessageContainer.js => renderScrollComponent', e);
  }
}

render() {
  try {
    return (
      <View ref='container' style={{ flex: 2, backgroundColor: '#f8f8f8' }}>
        <ListView
          enableEmptySections={true}
          keyboardShouldPersistTaps="always"
          automaticallyAdjustContentInsets={false}
          initialListSize={20}
          pageSize={20}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderFooter}
          renderFooter={this.renderLoadEarlier}
          renderScrollComponent={this.renderScrollComponent}
          />
      </View>
    );
  } catch (e) {
    ErrorHandler.WriteError('MessageContainer.js => render', e);
  }
}
}

MessageContainer.defaultProps = {
  messages: [],
  user: {},
  renderFooter: null,
  renderMessage: null,
  onLoadEarlier: () => {
  },
};

MessageContainer.propTypes = {
  messages: React.PropTypes.array,
  user: React.PropTypes.object,
  renderFooter: React.PropTypes.func,
  renderMessage: React.PropTypes.func,
  onLoadEarlier: React.PropTypes.func,
};
