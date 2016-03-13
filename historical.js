/* 
 * Generate historical PM2.5 and PM10 µg/m3 data and write out as CSV.
 * 
 * Set the PM ranges in config.yml before running.
 */
'use strict';

let moment = require('moment'),
    pmValues = require('./lib/airmonitor.js').pmValues,
    argv = process.argv.slice(2);

const DATE_FORMAT = "YYYY-MM-DD HH:mm";
const USAGE = `
Usage: node historical <from> <to> <interval>

    from        (${DATE_FORMAT})   start generating reads from this UTC datetime
    to          (${DATE_FORMAT})   generate reads up to this UTC datetime
    interval    (millis)           interval between each generated read
    
For example: > node historical '2016-03-01 00:00' '2016-03-02 12:00' 30000

See http://momentjs.com/docs/#/parsing/string/ for time format details
`;

function error(msg) {
    console.error(msg);
    process.exit(-1);
}

if (argv.length != 3)
    error(USAGE);

let from = moment.utc(argv[0], DATE_FORMAT);
let to = moment.utc(argv[1], DATE_FORMAT);
let interval = argv[2];

if (!from.isValid() || !to.isValid())
    usage("Date invalid, check format is ${DATE_FORMAT}");

var ts = from;
while (ts.isBefore(to)) {
    let pm = pmValues();
    let line = `${ts.toISOString()},${pm.pm2_5},${pm.pm10}`;
    console.info(line);
    ts.add(interval, 'milliseconds');
}