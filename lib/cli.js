// Load modules

var Bossy = require('bossy');
var Hoek = require('hoek');
var Commander = require('./commander');
var Serial = require('./serial');


// Declare internals

var internals = {};


exports.run = function (options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    callback = callback || Hoek.ignore;

    var settings = options || internals.options();

    var commander = new Commander(settings.url);
    var serial = new Serial({ portname: settings.portname });
    serial.start(function (err) {

        if (err) {
            internals.handleError(err);
            process.exit(1);
        }

        serial.on('error', internals.handleError);
        commander.on('error', internals.handleError);

        serial.on('register', function () {

            commander.registerRadio(function (err, id) {

                if (err) {
                    return internals.handleError(err);
                }

                serial.writeId(id, internals.handleError);
            });
        });

        var events = ['battery', 'name', 'version'];
        events.forEach(function (event) {

            serial.on(event, function (data) {

                commander.updateRadio(data.radioId, data, internals.handleError);
            });
        });

        serial.on('reading', function (data) {

            var formattedData = { type: data.type, value: data.value, time: data.time };
            commander.createReading(data.radioId, data.sensorId, formattedData, internals.handleError);
        });

        serial.on('sensor', function (data) {

            commander.updateSensor(data.radioId, data.sensorId, { type: data.type }, internals.handleError);
        });

        serial.on('log', function (message) {

            commander.log(message, formattedData,internals.handleError);
        });

        callback();
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
            description: 'specify serial port name to use, defaults to /dev/tty-usbserial1',
            default: '/dev/tty-usbserial1'
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
