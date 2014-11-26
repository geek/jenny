#!/usr/bin/env node

require('../lib/cli').run(function (err) {

    if (err) {
        console.error(err.message);
    }
});
