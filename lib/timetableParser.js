'use strict';

var cheerio = require('cheerio');

module.exports = function (body, callback) {
    var $ = cheerio.load(body);
    var time = '';
    var modules = [];
    var weekMap = {0: 0};
    var weekCount = 1;
    var spanCount = 0;
    $('.rowtitle td[colspan]').each(function (index, element) {
        element = $(element);
        var colspan = parseInt(element.attr('colspan'));
        if (isNaN(colspan)) {
            spanCount += 1;
        } else {
            for (var i = 0; i < colspan; i++) {
                spanCount += 1;
                weekMap[spanCount] = weekCount;
            }
        }
        weekCount += 1;
    });
    $('.maintable tbody tr .gridcell, .coltitle').each(function (index, element) {
        element = $(element);
        if (element.prev().attr('class') === 'coltitle') {
            time = element.prev().text();
        }
        element = element.filter('.gridcell.nonemptycell').not('td[style*="display: none"]');
        if (element.length > 0) {
            var weekDay = weekMap[index % (spanCount + 1)];
            var timeArray = time.split(':');
            var hour = parseInt(timeArray[0]);
            var miniute = parseInt(timeArray[1]);

            var week = element.find('.R4').eq(1).text().match(/([0-9]+-[0-9]+)|[0-9]+/g);
            var parsedWeek = [];
            week.forEach(function (value) {
                if (value.indexOf('-') !== -1) {
                    var dayArray = value.split('-');
                    var first = parseInt(dayArray[0]);
                    var second = parseInt(dayArray[1]);
                    var diff = second - first;

                    for (var i = 0; i <= diff; i++) {
                        parsedWeek.push(i + first);
                    }
                } else {
                    parsedWeek.push(parseInt(value));
                }
            });

            var name = element.find('.R1').eq(0).text();
            var nameArray = name.split('-');
            var category = [nameArray[1]];

            modules.push({
                name: name,
                tutor: element.find('.R2').eq(0).text(),
                room: element.find('.R4').eq(0).text(),
                weekDay: weekDay,
                week: parsedWeek,
                startTime: time,
                startHour: hour,
                startMin: miniute,
                duration: element.attr('rowspan'),
                category: category
            });
        }
    });
    return callback(modules);
};