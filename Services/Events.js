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
        ErrorHandler.WriteError('Events.js => on', error);
    }
}

export function trigger(_eventName, ..._args) {
    try {
        if (listeners && listeners[_eventName]) {
            for (var i = 0; i < listeners[_eventName].length; i++) {
                try {
                    if (listeners[_eventName][i].function) {
                        listeners[_eventName][i].function(..._args);
                    }
                } catch (error) {
                    ErrorHandler.WriteError('trigger -> ### ' , error);
                    ErrorHandler.WriteError('_eventName -> ### ' , _eventName);
                }
            }
        }
    } catch (error) {
        ErrorHandler.WriteError('Events.js => trigger', error);
    }
}

export function removeAllListeners(_eventName) {
    try {
        listeners[_eventName] = [];
    } catch (error) {
        ErrorHandler.WriteError('Events.js => removeAllListeners', error);
    }
}