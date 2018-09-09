'use strict';

var ics = require('ics-js');
var config = require('config').get('xjtlu-timetable-to-ics');
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')) + '').version;

module.exports = function (modules, callback) {
    var cal = new ics.VCALENDAR();
    var year = parseInt(config.get('year'));
    var month = parseInt(config.get('month')) - 1;
    var day = parseInt(config.get('day'));
    cal.addProp('VERSION', 2);
    cal.addProp('PRODID', 'XJTLU-Timetable-to-ICS v' + version);

    modules.forEach(function (event) {
        event.week.forEach(function (week) {
            var vevent = new ics.VEVENT();
            var date = new Date(year, month, day, event.startHour, event.startMin);
            date.setDate(day + (week - 1) * 7 + (event.weekDay - 1));
            vevent.addProp('UID');
            vevent.addProp('DTSTAMP', new Date(), {VALUE: 'DATE-TIME'});
            vevent.addProp('DTSTART', new Date(year, month, day + (week - 1) * 7 + (event.weekDay - 1), event.startHour, event.startMin), {VALUE: 'DATE-TIME'});
            vevent.addProp('DTEND', new Date(year, month, day + (week - 1) * 7 + (event.weekDay - 1), event.startHour, event.startMin + event.duration * 30), {VALUE: 'DATE-TIME'});
            vevent.addProp('LOCATION', event.room);
            vevent.addProp('STATUS', 'CONFIRMED');
            vevent.addProp('CATEGORIES', event.category);
            vevent.addProp('DESCRIPTION', event.tutor);
            vevent.addProp('SUMMARY', event.name);

            if (config.has('alarm')) {
                var valarm = new ics.VALARM();
                valarm.addProp('ACTION', 'DISPLAY');
                valarm.addProp('TRIGGER', moment.duration(parseInt(config.get('alarm')), 'minutes').toISOString());
                valarm.addProp('DESCRIPTION', 'Reminder');
                vevent.addComponent(valarm);
            }
            cal.addComponent(vevent);
        });
    });
    callback(cal.toString());
};