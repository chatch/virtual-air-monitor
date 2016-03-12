/* 
 * A virtual air monitor that generates PM2.5 and PM10 µg/m3 values and publishes them to an MQTT topic.
 * 
 * Edit config.yml before running. Set dryrun to test without publishing values.
 */
'use strict';

let mqtt = require('mqtt'),
    fs = require('fs'),
    yaml = require('js-yaml');

const CONFIG = yaml.load(fs.readFileSync('config.yml', 'utf8'));

function mq(mqOpts) {
    //    let mqOpts = {
    //        host: config.mqtt.host,
    //        port: config.mqtt.port
    //    };
    let mqClient = mqtt.connect(mqOpts);

    mqClient.on('error', function (err) {
        console.error('mqtt error: ' + err);
    });

    mqClient.on('connect', function () {
        console.log('Connected to broker');
    });
    return mqClient;
}

function pm2_5() {
    return randInRange(CONFIG.monitor.pm2_5_min, CONFIG.monitor.pm2_5_max);
}

function pm10() {
    return randInRange(CONFIG.monitor.pm10_min, CONFIG.monitor.pm10_max);
}

function randInRange(min, max) {
    return ((Math.random() * (max - min)) + min).toFixed(CONFIG.monitor.float_precision);
}

function readValues() {
    return {
        pm2_5: pm2_5(),
        pm10: pm10()
    };
}

function readAndPublish(mqClient, dryRun) {
    let values = readValues();
    console.info(values);
    if (!dryRun) {
        mqClient.publish('/air/1/pm2.5', values.pm2_5);
        mqClient.publish('/air/1/pm10', values.pm10);
    }
}

let mqClient;
if (!CONFIG.dryrun)
    mqClient = mq(CONFIG.mqtt);

readAndPublish(mqClient, CONFIG.dryrun);
setInterval(function () {
    readAndPublish(mqClient, CONFIG.dryrun);
}, CONFIG.monitor.send_interval);