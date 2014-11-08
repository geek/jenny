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

    it('sends reported data to remote url', function (done) {

        var server = new Hapi.Server(0);
        server.route({ method: 'put', path: '/', handler: function (request, reply) {

            expect(request.payload.test).to.equal('data');
            reply('ok');
        }});

        server.start(function (err) {

            expect(err).to.not.exist();
            var commander = new Jenny.Commander('http://localhost:' + server.info.port);
            commander.report({ test: 'data'}, function (err) {

                expect(err).to.not.exist();
                done();
            });
        });
    });
});
