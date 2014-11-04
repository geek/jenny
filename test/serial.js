// Load modules

var Events = require('events');
var Code = require('code');
var Hoek = require('hoek');
var Lab = require('lab');
var SerialPort = require('serialport');
var Jenny = require('../');


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Serial', function () {

    it('emits parsed sensor data when a sensor sends data', function (done) {

        var currentSerialPort = SerialPort.SerialPort;
        SerialPort.SerialPort = function (portname) {

            Events.EventEmitter.call(this);
            expect(portname).to.equal('test');
        };
        Hoek.inherits(SerialPort.SerialPort, Events.EventEmitter);

        SerialPort.SerialPort.prototype.open = function (callback) {

            callback();
        };

        var serial = new Jenny.Serial({ portname: 'test' });
        serial.on('sensor', function (sensor) {

            expect(sensor.length).to.equal(1);
            expect(sensor[0].id).to.equal('12');
            done();
        });

        serial.start(function (err) {

            expect(err).to.not.exist();
            serial._serial.emit('data', '12;6;0;0;3;1.4\n');
        });
    });
});