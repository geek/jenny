// Load modules

var Bossy = require('bossy');
var Hoek = require('hoek');
var SerialPort = require('serialport');
var CowboyMouth = require('cowboymouth');
var Jenny = require('./index');


// Declare internals

var internals = {
    baud: 115200
};


exports.run = function (options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    callback = callback || Hoek.ignore;

    var settings = options || internals.options();

    if (settings.portname) {
        return internals.openSerial(settings, callback);
    }

    internals.getSerialPort(function (err, portname) {

        if (err) {
            return callback(err);
        }

        if (!portname) {
            return callback(new Error('Can\'t find valid arduino serial port'));
        }

        settings.portname = portname;

        return internals.openSerial(settings, callback);
    });
};


internals.openSerial = function (settings, callback) {

    var serial = new SerialPort.SerialPort(settings.portname, {
        parser: SerialPort.parsers.readline("\n"),
        baudrate: internals.baud
    }, false);

    serial.open(function (err) {

        if (err) {
            internals.handleError(err);
            process.exit(1);
        }

        internals.wireEvents(serial, settings);
        callback();
    });
};


internals.getSerialPort = function (callback) {

    SerialPort.list(function (err, ports) {

        if (err) {
            return callback(err);
        }

        for (var i = 0, il = ports.length; i < il; ++i) {
            var portname = ports[i].comName;

            if (portname.indexOf('usb') !== -1) {
                return callback(null, portname);
            }
        }

        return callback();
    });
};


internals.wireEvents = function (serial, settings) {

    var jenny = new Jenny(settings.url);
    var mouth = new CowboyMouth(serial);
    serial.on('error', internals.handleError);
    jenny.on('error', internals.handleError);

    jenny.on('command', function (command) {

        serial.write(command);
    });

    mouth.on('register', function () {

        jenny.registerRadio(function (err, id) {

            if (err) {
                return internals.handleError(err);
            }

            mouth.writeId(id, internals.handleError);
        });
    });

    var events = ['battery', 'name', 'version'];
    events.forEach(function (event) {

        mouth.on(event, function (data) {

            jenny.updateRadio(data.radioId, data, internals.handleError);
        });
    });

    mouth.on('reading', function (data) {

        var formattedData = { type: data.type, value: data.value, time: data.time };
        jenny.createReading(data.radioId, data.sensorId, formattedData, internals.handleError);
    });

    mouth.on('sensor', function (data) {

        jenny.updateSensor(data.radioId, data.sensorId, { type: data.type }, internals.handleError);
    });

    mouth.on('log', function (message) {

        jenny.log(message, internals.handleError);
    });
};


internals.handleError = function (err) {

    if (err) {
        console.error(err);
    }
};


internals.options = function () {

    var definition = {
        portname: {
            alias: 'p',
            type: 'string',
            description: 'specify serial port name to use, defaults to first arduino serial'
        },
        url: {
            alias: 'u',
            type: 'string',
            description: 'URL to send data to',
            required: true
        },
        help: {
            alias: 'h',
            type: 'boolean',
            description: 'display usage options'
        }
    };

    var argv = Bossy.parse(definition);

    if (argv instanceof Error) {
        console.error(Bossy.usage(definition, 'jenny [options]'));
        console.error('\n' + argv.message);
        process.exit(1);
    }

    if (argv.help) {
        console.log(Bossy.usage(definition, 'jenny [options]'));
        process.exit(0);
    }

    return {
        portname: argv.portname,
        url: argv.url
    };
};
