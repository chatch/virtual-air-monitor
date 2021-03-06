/* 
 * A virtual air monitor that generates PM2.5 and PM10 µg/m3 values and publishes them to an MQTT topic.
 * 
 * Edit config.yml before running. Set dryrun to test without publishing values.
 */
'use strict';

let mqtt = require('mqtt'),
    fs = require('fs'),
    yaml = require('js-yaml');

let pmValues = require('./lib/airmonitor.js').pmValues;

const CONFIG = yaml.load(fs.readFileSync('./config/config.yml', 'utf8')),
    DRYRUN = CONFIG.publisher.dryrun;

function mq(mqOpts) {
    let mqClient = mqtt.connect(mqOpts);

    mqClient.on('error', function (err) {
        console.error('mqtt error: ' + err);
    });

    mqClient.on('connect', function () {
        console.log('Connected to broker ' + mqOpts.host);
    });
    return mqClient;
}

function readAndPublish(mqClient, dryRun) {
    let values = pmValues();
    console.info(values);
    if (!dryRun) {
        let topic = CONFIG.mqtt.topics.pm;
        let csvStr = values.pm2_5 + ',' + values.pm10;
        mqClient.publish(topic, csvStr);
    }
}

let mqClient;
if (!DRYRUN)
    mqClient = mq(CONFIG.mqtt.broker);

readAndPublish(mqClient, DRYRUN);
setInterval(function () {
    readAndPublish(mqClient, DRYRUN);
}, CONFIG.publisher.send_interval);