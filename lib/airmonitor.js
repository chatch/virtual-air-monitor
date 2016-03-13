/* 
 * Virtual air monitor that generates random PM2.5 and PM10 µg/m3 values.
 * See config.yml for tweaking the range of possible values.
 */
'use strict';

let fs = require('fs'),
    yaml = require('js-yaml');

const CONFIG = yaml.load(fs.readFileSync('./config/config.yml', 'utf8')).airmonitor;

function pm2_5() {
    return randInRange(CONFIG.pm2_5_min, CONFIG.pm2_5_max);
}

function pm10() {
    return randInRange(CONFIG.pm10_min, CONFIG.pm10_max);
}

function randInRange(min, max) {
    return ((Math.random() * (max - min)) + min).toFixed(CONFIG.float_precision);
}

function pmValues() {
    return {
        pm2_5: pm2_5(),
        pm10: pm10()
    };
}

module.exports.pmValues = pmValues;