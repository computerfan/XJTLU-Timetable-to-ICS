'use strict';

module.exports = function (configs, callback) {
    process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
    var config = require('config');
    var timetableToIcs = require('./lib');
    var defaultConfigs = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
        },
        baseUrl: 'https://ebridge.xjtlu.edu.cn/urd/sits.urd/run',
        year: 2018,
        month: 2,
        day: 26
    };
    config.util.extendDeep(defaultConfigs, configs);
    config.util.setModuleDefaults('xjtlu-timetable-to-ics', defaultConfigs);
    //console.log(config);
    timetableToIcs(function (data) {
        callback(data);
    });
};