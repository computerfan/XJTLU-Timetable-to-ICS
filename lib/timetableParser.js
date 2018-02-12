const cheerio = require('cheerio');

module.exports = function (body, callback) {
    let $ = cheerio.load(body);
    let time = '';
    let modules = [];
    $('.maintable tbody tr .gridcell, .coltitle').each((index, element) => {
        element = $(element);
        if (element.prev().attr('class') === 'coltitle') {
            time = element.prev().text();
        }
        element = element.filter('.gridcell.nonemptycell').not('td[style*="display: none"]');
        if (element.length > 0) {
            let weekDay = index % 8;
            let timeArray = time.split(':');
            let hour = parseInt(timeArray[0]);
            let miniute = parseInt(timeArray[1]);

            let week = element.find('.R4').eq(1).text().match(/([0-9]+-[0-9]+)|[0-9]+/g);
            let parsedWeek = [];
            week.forEach((value) => {
                if (value.indexOf('-') !== -1) {
                    let dayArray = value.split('-');
                    let first = parseInt(dayArray[0]);
                    let second = parseInt(dayArray[1]);
                    let diff = second - first;

                    for (let i = 0; i <= diff; i++) {
                        parsedWeek.push(i + first);
                    }
                } else {
                    parsedWeek.push(parseInt(value));
                }

            });

            let name = element.find('.R1').eq(0).text();
            let nameArray = name.split('-');
            let category = [nameArray[1]];

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