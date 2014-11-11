// Load modules

var Events = require('events');
var Hoek = require('hoek');
var Sensors = require('sensors');
var SerialPort = require('serialport');


// Declare internals

var internals = {
    defaults: {
        baud: 115200,
        gatewayId: 255,
        gatewayChildId: 255
    }
};


module.exports = internals.Serial = function (options) {

    Hoek.assert(this.constructor === internals.Serial, 'must be constructed with new');
    var settings = Hoek.applyToDefaults(internals.defaults, options);
    this._settings = settings;

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
        self._serial.on('data', self._readSerial.bind(self));
        self._serial.on('error', function (err) {

            self.emit('error', err);
        });

        callback();
    });
};


internals.Serial.prototype.write = function (command, callback) {

    callback = callback || Hoek.ignore;

    var stringified = (command && typeof command === 'object') ? Sensors.stringify(command) : command;
    if (!stringified || (typeof stringified !== 'string')) {
        return callback(stringified);
    }

    this._serial.write(stringified, callback);
};


internals.Serial.prototype.writeTime = function (destination, callback) {

    var command = {
        id: destination.id,
        childId: destination.childId,
        type: 'internal',
        subType: 'I_TIME',
        ack: false,
        payload: new Date().getTime()
    };

    this.write(command, callback);
};


internals.Serial.prototype.writeId = function (id, callback) {

    var command = {
        id: this._settings.gatewayId,
        childId: this._settings.gatewayChildId,
        type: 'internal',
        subType: 'I_ID_RESPONSE',
        ack: false,
        payload: id
    };

    this.write(command, callback);
};


internals.Serial.prototype.rebootId = function (id, callback) {

    var command = {
        id: Id,
        childId: this._settings.gatewayChildId,
        type: 'internal',
        ack: false,
        subType: 'I_REBOOT',
        payload: ''
    };

    this.write(command, callback);
};


internals.Serial.prototype._internalCommand = function (command, source) {

    var now = Date.now();

    switch(command) {
        case 'I_ID_REQUEST':
            this.emit('register');
            break;
        case 'I_TIME':
            this.writeTime({
                id: source.id,
                childId: source.childId,
                time: now
            });
            break;
        case 'I_BATTERY_LEVEL':
            this.emit('battery', {
                id: source.id,
                childId: source.childId,
                level: source.payload,
                time: now
            });
            break;
        case 'I_LOG_MESSAGE':
            this.emit('log', {
                id: source.id,
                childId: source.childId,
                message: source.payload,
                time: now
            });
            break;
        case 'I_SKETCH_NAME':
            this.emit('name', {
                id: source.id,
                childId: source.childId,
                name: source.payload,
                time: now
            });
            break;
        case 'I_SKETCH_VERSION':
            this.emit('version', {
                id: source.id,
                childId: source.childId,
                version: source.payload,
                time: now
            });
            break;
    }
};


internals.Serial.prototype._presentation = function (sensor) {

    if (sensor.id === this._settings.gatewayId) {
        return this.emit('protocol', sensor.payload);
    }

    this.emit('sensor', {
        id: sensor.id,
        childId: sensor.childId,
        type: sensor.subType,
        time: Date.now()
    });
};


internals.Serial.prototype._readSerial = function (data) {

    var arr = Sensors.parse(data.toString());
    if (!arr || (arr instanceof Error)) {
        this.emit('error', arr);
        return;
    }

    for (var i = 0, il = arr.length; i < il; ++i) {
        var sensor = arr[i];
        if (sensor.type === 'internal') {
            this._internalCommand(sensor.subType, sensor);
        }
        else if (sensor.type === 'presentation') {
            this._presentation(sensor);
        }
        else if (sensor.type === 'set') {
            this.emit('value', {
                id: sensor.id,
                childId: sensor.childId,
                value: sensor.payload,
                type: sensor.subType,
                time: Date.now()
            });
        }
    }
};
