// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Jenny = require('../');


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Commander', function () {

    describe('createReading()', function () {

        it('sends reported data to remote url', function (done) {

            var server = new Hapi.Server();
            server.connection();
            server.route({ method: 'post', path: '/radio/12/sensor/0/reading', handler: function (request, reply) {

                expect(request.payload.type).to.equal('data');
                reply('ok');
            }});

            server.start(function (err) {

                expect(err).to.not.exist();
                var jenny = new Jenny('http://localhost:' + server.info.port);
                jenny.createReading(12, 0, { type: 'data'}, function (err) {

                    expect(err).to.not.exist();
                    done();
                });
            });
        });
    });
});
