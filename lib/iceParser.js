const ics = require('ics-js');
const config = require('config').get('default');
const moment = require('moment');

module.exports = function (modules, callback) {
    const cal = new ics.VCALENDAR();
    let year = config.get('year');
    let month = config.get('month') - 1;
    let day = config.get('day');
    cal.addProp('VERSION', 2);

    modules.forEach(event => {
            event.week.forEach(week => {
                const vevent = new ics.VEVENT();
                let date = new Date(year, month, day, event.startHour, event.startMin);
                date.setDate(day + (week - 1) * 7 + (event.weekDay - 1));
                let dateEnd = date.setMinutes(date.getMinutes() + event.duration * 30);
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

                if (config.has('alarmTime')) {
                    const valarm = new ics.VALARM();
                    valarm.addProp('ACTION', 'DISPLAY');
                    valarm.addProp('TRIGGER', moment.duration(config.get('alarmTime'), 'minutes').toISOString());
                    valarm.addProp('DESCRIPTION', 'Reminder');
                    vevent.addComponent(valarm);
                }
                cal.addComponent(vevent);
            })
        }
    );
    callback(cal.toString())
};