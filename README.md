# XJTLU-Timetable-to-ICS

A simple command-line tool for exporting timetable from 
XJTLU e-bridge to a iCalendar file.

### CLI
    npm install -g xjtlu-timetable-to-ics

```
$ xjtlu-timetable-to-ics -h

  Usage: xjtlu-timetable-to-ics [options] <username>

  A simple command-line tool for exporting timetable from XJTLU e-bridge to a iCalendar file.


  Options:

    -V, --version              output the version number
    -p, --password <password>  specify password
    -y, --year <year>          specify the first year in the timetable (default: 2018)
    -m, --month <month>        specify the first month in the timetable (default: 2)
    -d, --day <day>            specify the first day in the timetable (default: 26)
    -o, --output-file <path>   write the iCal to a file
    -a, --alarm <minute>       alert time relative to the start time of each event
    -h, --help                 output usage information

  Examples:

    $ xjtlu-timetable-to-ics username
    $ xjtlu-timetable-to-ics username -p pwd -o ./xjtlu.ics
    Set reminders that occur 15 minutes before the start of calendar items:
    $ xjtlu-timetable-to-ics username -p pwd -a -15 -o ./xjtlu.ics
```

### As a Module
    npm install xjtlu-timetable-to-ics
```javascript
const xjtluIcs = require('xjtlu-timetable-to-ics');

xjtluIcs({
    username: 'user',//required
    password: 'pwd',//required
    year: 2019,
    month: 2,
    day: 26,
    alarm: -15
}, ics => {
    console.log(ics)
    // BEGIN:VCALENDAR
    // VERSION:2.0
    // PRODID:XJTLU-Timetable-to-ICS v0.0.1
    // BEGIN:VEVENT
    // UID:23128048-81B0-4B61-8088-604AC7F5A4D0
    // DTSTAMP;VALUE=DATE-TIME:20180212T145653
    // DTSTART;VALUE=DATE-TIME:20190226T090000
    // DTEND;VALUE=DATE-TIME:20190226T110000
    // LOCATION:Science Building-SC176
    // STATUS:CONFIRMED
    // CATEGORIES:Lecture
    // DESCRIPTION:Muhammad Alam, Wenjin Lu
    // SUMMARY:CSE102-Lecture-D1/1
    // BEGIN:VALARM
    // ACTION:DISPLAY
    // TRIGGER:-PT15M
    // DESCRIPTION:Reminder
    // END:VALARM
    // END:VEVENT
    // BEGIN:VEVENT
    // …………
    // END:VEVENT
    // …………
    // END:VCALENDAR
});
```