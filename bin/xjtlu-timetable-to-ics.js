#!/usr/bin/env node
'use strict';

var program = require('commander');
var fs = require('fs');
var path = require('path');
var version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')) + '').version;
var timetableToIcs = require('../');
var config = {};
program.version(version).description('A simple command-line tool for exporting timetable from XJTLU e-bridge to a iCalendar file.')
    .option('-p, --password <password>', 'specify password')
    .option('-y, --year <year>', 'specify the first year in the timetable', 2019)
    .option('-m, --month <month>', 'specify the first month in the timetable', 2)
    .option('-d, --day <day>', 'specify the first day in the timetable', 18)
    .option('-o, --output-file <path>', 'write the iCal to a file')
    .option('-a, --alarm <minute>', 'alert time relative to the start time of each event')
    .arguments('<username>')
    .action(function (username) {
        config.username = username;
    });

program.on('--help', function () {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ xjtlu-timetable-to-ics username');
    console.log('    $ xjtlu-timetable-to-ics username -p pwd -o ./xjtlu.ics');
    console.log('    Set reminders that occur 15 minutes before the start of calendar items:');
    console.log('    $ xjtlu-timetable-to-ics username -p pwd -a -15 -o ./xjtlu.ics');
    console.log('');
});

program.parse(process.argv);

if (program.year) config.year = program.year;
if (program.month) config.month = program.month;
if (program.day) config.day = program.day;
if (program.outputFile) config.outputFile = program.outputFile;
if (program.alarm) config.alarm = program.alarm;

if (!process.argv.slice(2).length) {
    program.help();
} else if (!config.username) {
    console.log('error: missing required argument \'username\'');
    //process.exit(1);
} else if (program.password) {
    config.password = program.password;
    main(config);
} else {
    var readline = require('readline');

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.stdoutMuted = true;

    rl.question('Password: ', function (password) {
        config.password = password;
        rl.close();
        console.log('');
        main(config);
    });

    rl._writeToOutput = function _writeToOutput(stringToWrite) {
        if (rl.stdoutMuted) rl.output.write("*"); else rl.output.write(stringToWrite);
    };
}

function main(config) {
    timetableToIcs(config, function (data) {
        //console.log(a);
        if (program.outputFile) {
            fs.writeFile(config.outputFile, data, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("The file was saved!");
            });
        } else {
            console.log(data);
        }
    });
}