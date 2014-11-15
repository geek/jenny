// Load modules

var Events = require('events');
var Hoek = require('hoek');
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


internals.Commander.prototype.registerRadio = function (callback) {

    Wreck.post(this._url + '/radio', { headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

        return callback(null, payload.id || payload.radioId);
    });
};


internals.Commander.prototype.updateRadio = function (radioId, data, callback) {

    var stringified = JSON.stringify(data);
    Wreck.put(this._url + '/radio/' + radioId, { payload: stringified, headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

        return callback(null, payload);
    });
};


internals.Commander.prototype.updateSensor = function (radioId, sensorId, data, callback) {

    var stringified = JSON.stringify(data);
    Wreck.put(this._url + '/radio/' + radioId + '/sensor/' + sensorId, { payload: stringified, headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

        return callback(null, payload);
    });
};


internals.Commander.prototype.createReading = function (radioId, sensorId, data, callback) {

    var stringified = JSON.stringify(data);
    Wreck.post(this._url + '/radio/' + radioId + '/sensor/' + sensorId + '/reading', { payload: stringified, headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

        return callback(null, payload);
    });
};


internals.Commander.prototype.log = function (message, callback) {

    var stringified = JSON.stringify(message);
    Wreck.post(this._url + '/log', { payload: stringified, headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

        return callback(null, payload);
    });
};


internals.Commander.prototype._checkForCommand = function (callback) {

    Wreck.get(this._url + '/command', { headers: internals.headers }, function (err, res, payload) {

        if (err) {
            return callback(err);
        }

        if (res.statusCode !== 200) {
            return callback();
        }

        var command = payload;
        if (payload && typeof payload === 'string') {
            try {
                command = JSON.parse(payload);
            }
            catch (err) {
                return callback();
            }
        }

        if (command instanceof Error) {
            return callback(command);
        }

        return callback(null, (!command || command.length === 0) ? null : command);
    });
};


internals.Commander.prototype._poll = function () {

    var self = this;

    setTimeout(function () {

        self._checkForCommand(function (err, command) {

            if (err) {
                self.emit('error', err);
            }
            else if (command && Object.keys(command).length) {
                self.emit('command', command);
            }

            self._poll();
        });
    }, 30);
};