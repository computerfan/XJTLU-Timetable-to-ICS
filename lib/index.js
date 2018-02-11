module.exports = function (callback) {
    let request = require('request').defaults({jar: true});
    let timetableParser = require('./timetableParser');
    let iceParser = require('./iceParser');
    const cheerio = require('cheerio');
    const config = require('config').get('default');

    //console.log(config);

    let user = {
        user: config.get('username'),
        pwd: config.get('password'),
    };

    let headers = config.get('headers');

    let baseUrl = config.get('baseUrl');

    let opts = {
        url: baseUrl + '/siw_lgn',
        headers: headers
    };

    //console.log(opts);

    request(opts, (error, httpResponse, body) => {
        //console.log(body);

        let $ = cheerio.load(body);
        let runtimes = $('input[name="RUNTIME.DUMMY.MENSYS.1"]').val();
        //console.log(runtimes);
        let postOpts = {
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
                'BP101.DUMMY_B.MENSYS.1': 'Log in',
            }
        };
        request(postOpts, (error, httpResponse, body) => {
            if (error)
                return callback(error);
            //console.log(body);
            let $ = cheerio.load(body);
            let url = $('#siw_portal_url').val();
            //console.log(url);
            opts.url = baseUrl + '/' + url;
            request(opts, (error, httpResponse, body) => {
                if (error || body.indexOf('e-Bridge Bulletin') < 0)
                    throw new Error('Login failed!');
                console.log('Login success?', body.indexOf('e-Bridge Bulletin') > 0);
                let $ = cheerio.load(body);
                let url = $('#TIMETABLE').attr('href');
                let opts = {
                    url: baseUrl + '/' + url,
                    headers: headers
                };
                request(opts, (error, httpResponse, body) => {
                    //console.log(body);
                    if (error || body.indexOf('Class Timetable') < 0)
                        throw new Error('Failed when enter timetable tab.');
                    console.log('Enter timetable tab success?', body.indexOf('Class Timetable') > 0);
                    let $ = cheerio.load(body);
                    let url = $(".sv-list-group-item-overflow").first().attr('href');
                    opts.url = baseUrl + '/' + url;
                    request(opts, (error, httpResponse, body) => {
                        if (error || body.indexOf('Monday') < 0)
                            throw new Error('Failed when open timetable.');
                        console.log('Open timetable success?', body.indexOf('Monday') > 0);
                        timetableParser(body, (modules) => {
                            iceParser(modules, data => {
                                //console.log(data);
                                return callback(data);
                            });
                        });
                    })
                })
            });
        });
    });
};
