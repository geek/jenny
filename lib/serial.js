// Load modules

var Events = require('events');
var Hoek = require('hoek');
var Sensors = require('sensors');
var SerialPort = require('serialport');


// Declare internals

var internals = {
    defaults: {
        baud: 115200
    }
};


module.exports = internals.Serial = function (options) {

    Hoek.assert(this.constructor === internals.Serial, 'must be constructed with new');
    var settings = Hoek.applyToDefaults(internals.defaults, options);

    Events.EventEmitter.call(this);

    this._serial = new SerialPort.SerialPort(settings.portname, {
        parser: SerialPort.parsers.readline("\n"),
        baudrate: settings.baud
    }, false);
};

Hoek.inherits(internals.Serial, Events.EventEmitter);


internals.Serial.prototype.start = function (callback) {

    var self = this;

    this._serial.open(function (err) {

        if (err) {
            return callback(err);
        }

        self._started = true;
        self._serial.on('data', self._readSerial);
        self._serial.on('error', function (err) {

            self.emit('error', err);
        })
    });
};


internals.Serial.prototype.write = function (command, callback) {

    stringified = Sensors.stringify(command);
    if (stringified instanceof Error) {
        return callback(stringified);
    }

    this._serial.write(stringified, callback);
};


internals.Serial.prototype._readSerial = function (data) {

    var obj = Sensors.parse(data.toString());
    if (obj instanceof Error) {
        this.emit('error', obj);
        return;
    }

    this.emit('sensor', obj);
};