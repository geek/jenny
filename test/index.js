// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Nes = require('nes');
var Jenny = require('../');


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('createReading()', function () {

    it('sends reported data to remote url', function (done) {

        var server = new Hapi.Server();
        server.connection({ port: 0 });

        server.register(Nes, function (err) {

            expect(err).to.not.exist();

            server.subscription('/command');
            server.route({ method: 'post', path: '/board/12/0/reading', handler: function (request, reply) {

                expect(request.payload.type).to.equal('data');
                reply('ok');
            }});

            server.start(function (err) {

                expect(err).to.not.exist();
                var jenny = new Jenny('http://localhost:' + server.info.port);
                jenny.connect(function (err) {

                    jenny.createReading(12, 0, { type: 'data' }, function (err) {

                        expect(err).to.not.exist();
                        done();
                    });
                });
            });
        });
    });
});
