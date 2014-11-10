// Load modules

var Events = require('events');
var Code = require('code');
var Hoek = require('hoek');
var Hapi = require('hapi');
var Lab = require('lab');
var SerialPort = require('serialport');
var Cli = require('../lib/cli');


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('CLI', function () {

    it('sends reported data to remote url passed in on argument', function (done) {

        var currentSerialPort = SerialPort.SerialPort;
        var serial;

        var server = new Hapi.Server(0);
        server.route({ method: 'put', path: '/', handler: function (request, reply) {

            SerialPort.SerialPort = currentSerialPort;
            expect(request.payload.id).to.equal('12');
            done();
        }});

        server.start(function (err) {

            expect(err).to.not.exist();
            var options = {
                url: 'http://localhost:' + server.info.port,
                portname: '/test/port'
            };

            SerialPort.SerialPort = function (portname) {

                Events.EventEmitter.call(this);
                expect(portname).to.equal(options.portname);
                serial = this;
            };
            Hoek.inherits(SerialPort.SerialPort, Events.EventEmitter);

            SerialPort.SerialPort.prototype.open = function (callback) {

                callback();
            };

            Cli.run(options, function () {

                serial.emit('data', '12;6;0;0;3;1.4\n');
            });
        });
    });
});

