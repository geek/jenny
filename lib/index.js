// Load modules

var Events = require('events');
var Hoek = require('hoek');
var Nes = require('nes');


// Declare internals

var internals = {};


module.exports = internals.Jenny = function (url) {

    Hoek.assert(this.constructor === internals.Jenny, 'must be constructed with new');
    Hoek.assert(url, 'URL parameter is required');

    Events.EventEmitter.call(this);

    this._client = new Nes.Client(url);
};

Hoek.inherits(internals.Jenny, Events.EventEmitter);


internals.Jenny.prototype.connect = function (callback) {

    var self = this;

    this._client.connect(function (err) {

        if (err) {
            return callback(err);
        }

        self._client.subscribe('/command', self._handleCommand.bind(self));
        callback();
    });
};


internals.Jenny.prototype.updateBoard = function (boardId, data, callback) {

    var options = {
        method: 'put',
        path: '/api/board/' + boardId,
        payload: JSON.stringify(data)
    };
    this._client.request(options, callback);
};


internals.Jenny.prototype.updateAddon = function (boardId, addonId, data, callback) {

    var options = {
        method: 'put',
        path: '/api/board/' + boardId + '/' + addonId,
        payload: JSON.stringify(data)
    };
    this._client.request(options, callback);
};


internals.Jenny.prototype.createReading = function (boardId, addonId, data, callback) {

    var options = {
        method: 'post',
        path: '/api/board/' + boardId + '/' + addonId + '/reading',
        payload: JSON.stringify(data)
    };
    this._client.request(options, callback);
};


internals.Jenny.prototype.log = function (message, callback) {

    var options = {
        method: 'post',
        path: '/api/log',
        payload: JSON.stringify(message)
    };
    this._client.request(options, callback);
};


internals.Jenny.prototype._handleCommand = function (err, command) {

    if (err) {
        this.emit('error', err);
        return;
    }

    if (command === 'string') {
        try {
            command = JSON.parse(payload);
        }
        catch (err) {
            this.emit('error', err);
            return;
        }
    }

    if (command) {
        this.emit('command', command);
    }
};
