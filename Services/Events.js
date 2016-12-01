var React = require('react-native');
var ErrorHandler = require('../ErrorHandler');

var listeners = {};

export function on(_eventName, _func) {
    try {
        if (!listeners[_eventName]) {
            listeners[_eventName] = [];
        }
        listeners[_eventName].push({
            function: _func
        });
    } catch (error) {
        ErrorHandler.WriteError('Events.js => on');
    }
}

export function trigger(_eventName, ..._args) {
    try {
        if (listeners[_eventName]) {
            for (var i = 0; i < listeners[_eventName].length; i++) {
                listeners[_eventName][i].function(..._args);
            }
        }
    } catch (error) {
        ErrorHandler.WriteError('Events.js => trigger');
    }
}

export function removeAllListeners(_eventName) {
    try {
        listeners[_eventName] = [];
    } catch (error) {
        ErrorHandler.WriteError('Events.js => removeAllListeners');
    }
}