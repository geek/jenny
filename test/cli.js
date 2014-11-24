// Load modules

var Stream = require('stream');
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

        var server = new Hapi.Server();
        server.connection();
        server.route({ method: 'post', path: '/radio/{radioId}/sensor/{sensorId}/reading', handler: function (request, reply) {

            SerialPort.SerialPort = currentSerialPort;
            expect(request.payload.value).to.equal('1.4');
            done();
        }});

        server.start(function (err) {

            expect(err).to.not.exist();
            var options = {
                url: 'http://localhost:' + server.info.port,
                portname: '/test/port'
            };

            SerialPort.SerialPort = function (portname) {

                Stream.Duplex.call(this);
                expect(portname).to.equal(options.portname);
                this.passThrough = new Stream.PassThrough();
                serial = this;
            };
            Hoek.inherits(SerialPort.SerialPort, Stream.Duplex);

            SerialPort.SerialPort.prototype.open = function (callback) {

                callback();
            };

            SerialPort.SerialPort.prototype._read = function (size) {

                this.passThrough._read(size);
            };

            SerialPort.SerialPort.prototype._write = function (chunk, encoding, callback) {

                this.passThrough._write(chunk, encoding, callback);
            };


            Cli.run(options, function () {

                serial.emit('data', '12;6;1;0;3;1.4\n');
            });
        });
    });
});

