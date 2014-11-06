// Load modules

var Events = require('events');
var Hoek = require('hoek');
var Sensors = require('sensors');
var Wreck = require('wreck');


// Declare internals

var internals = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};


module.exports = internals.Commander = function (url) {

    Hoek.assert(this.constructor === internals.Commander, 'must be constructed with new');
    Hoek.assert(url, 'URL parameter is required');

    Events.EventEmitter.call(this);

    this._url = url;

    this._poll();
};

Hoek.inherits(internals.Commander, Events.EventEmitter);


internals.Commander.prototype.report = function (command, callback) {

    var stringified = JSON.stringify(command);
    Wreck.post(this._url, { payload: stringified, headers: internals.headers }, callback);
};


internals.Commander.prototype._checkForCommand = function (callback) {

    Wreck.get(this._url, { headers: internals.headers }, function (err, res, payload) {

        var command = payload;
        if (typeof payload === 'string') {
            command = JSON.parse(payload);
        }

        if (command instanceof Error) {
            return callback(command);
        }

        return callback(null, command.length === 0 ? null : command);
    });
};


internals.Commander.prototype._poll = function () {

    var self = this;

    setTimeout(function () {

        self._checkForCommand(function (err, command) {

            if (err) {
                self.emit('error', err);
            }
            else if (command) {
                self.emit('command', command);
            }

            self._poll();
        });
    }, 500);
};