// Load modules

var Events = require('events');
var Hoek = require('hoek');
var Wreck = require('wreck');


// Declare internals

var internals = {
    headers: {
        'Content-Type': 'application/json'
    }
};


module.exports = internals.Commander = function (url) {

    Hoek.assert(this.constructor === internals.Commander, 'must be constructed with new');
    Hoek.assert(url, 'URL parameter is required');

    Events.EventEmitter.call(this);

    this._url = url;
};

Hoek.inherits(internals.Commander, Events.EventEmitter);


internals.Commander.prototype.report = function (command, callback) {

    var stringified = JSON.stringify(command);
    Wreck.post(this._url, { payload: stringified, headers: internals.headers }, callback);
};

