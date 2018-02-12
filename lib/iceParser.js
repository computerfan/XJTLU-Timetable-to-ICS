const ics = require('ics-js');
const config = require('config').get('xjtlu-timetable-to-ics');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')) + '').version;

module.exports = function (modules, callback) {
    const cal = new ics.VCALENDAR();
    let year = config.get('year');
    let month = config.get('month') - 1;
    let day = config.get('day');
    cal.addProp('VERSION', 2);
    cal.addProp('PRODID', 'XJTLU-Timetable-to-ICS v' + version);

    modules.forEach(event => {
            event.week.forEach(week => {
                const vevent = new ics.VEVENT();
                let date = new Date(year, month, day, event.startHour, event.startMin);
                date.setDate(day + (week - 1) * 7 + (event.weekDay - 1));
                vevent.addProp('UID');
                vevent.addProp('DTSTAMP', new Date(), {VALUE: 'DATE-TIME'});
                vevent.addProp('DTSTART',
                    new Date(year, month, day + (week - 1) * 7 + (event.weekDay - 1), event.startHour, event.startMin),
                    {VALUE: 'DATE-TIME'});
                vevent.addProp('DTEND',
                    new Date(year, month, day + (week - 1) * 7 + (event.weekDay - 1), event.startHour, event.startMin + event.duration * 30),
                    {VALUE: 'DATE-TIME'});
                vevent.addProp('LOCATION', event.room);
                vevent.addProp('STATUS', 'CONFIRMED');
                vevent.addProp('CATEGORIES', event.category);
                vevent.addProp('DESCRIPTION', event.tutor);
                vevent.addProp('SUMMARY', event.name);

                if (config.has('alarm')) {
                    const valarm = new ics.VALARM();
                    valarm.addProp('ACTION', 'DISPLAY');
                    valarm.addProp('TRIGGER', moment.duration(parseInt(config.get('alarm')), 'minutes').toISOString());
                    valarm.addProp('DESCRIPTION', 'Reminder');
                    vevent.addComponent(valarm);
                }
                cal.addComponent(vevent);
            })
        }
    );
    callback(cal.toString())
};