'use strict';

module.exports = function (callback) {
    var request = require('request').defaults({jar: true});
    var timetableParser = require('./timetableParser');
    var iceParser = require('./icsParser');
    var cheerio = require('cheerio');
    var config = require('config').get('xjtlu-timetable-to-ics');

    var user = {
        user: config.get('username'),
        pwd: config.get('password')
    };

    var headers = config.get('headers');

    var baseUrl = config.get('baseUrl');

    var opts = {
        url: baseUrl + '/siw_lgn',
        headers: headers
    };

    request(opts, function (error, httpResponse, body) {
        //console.log(body);

        var $ = cheerio.load(body);
        var runtimes = $('input[name="RUNTIME.DUMMY.MENSYS.1"]').val();
        //console.log(runtimes);
        var postOpts = {
            url: baseUrl + '/SIW_LGN',
            method: 'POST',
            headers: headers,
            form: {
                'SCREEN_WIDTH.DUMMY.MENSYS.1': 1676,
                'SCREEN_HEIGHT.DUMMY.MENSYS.1': 943,
                '%.DUMMY.MENSYS.1': '',
                'RUNTIME.DUMMY.MENSYS.1': runtimes,
                'PARS.DUMMY.MENSYS.1': '',
                'MUA_CODE.DUMMY.MENSYS.1': user.user,
                'PASSWORD.DUMMY.MENSYS.1': user.pwd,
                'BP101.DUMMY_B.MENSYS.1': 'Log in'
            }
        };
        request(postOpts, function (error, httpResponse, body) {
            if (error) return callback(error);
            //console.log(body);
            var $ = cheerio.load(body);
            var url = $('#siw_portal_url').val();
            //console.log(url);
            opts.url = baseUrl + '/' + url;
            request(opts, function (error, httpResponse, body) {
                if (error || body.indexOf('e-Bridge Bulletin') < 0) throw new Error('Login failed!');
                //console.log('Login success?', body.indexOf('e-Bridge Bulletin') > 0);
                var $ = cheerio.load(body);
                var url = $('#PRS_STU_TB').attr('href');
                var opts = {
                    url: baseUrl + '/' + url,
                    headers: headers
                };
                request(opts, function (error, httpResponse, body) {
                    //console.log(body);
                    if (error || body.indexOf('Class Timetable') < 0) throw new Error('Failed when enter timetable tab.');
                    //console.log('Enter timetable tab success?', body.indexOf('Class Timetable') > 0);
                    var $ = cheerio.load(body);
                    var url = $(".sv-list-group-item-overflow").first().attr('href');
                    opts.url = baseUrl + '/' + url;
                    request(opts, function (error, httpResponse, body) {
                        if (error || body.indexOf('Monday') < 0) throw new Error('Failed when open timetable.');
                        //console.log('Open timetable success?', body.indexOf('Monday') > 0);
                        timetableParser(body, function (modules) {
                            iceParser(modules, function (data) {
                                //console.log(data);
                                return callback(data);
                            });
                        });
                    });
                });
            });
        });
    });
};