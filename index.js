'use strict';

const parser = require('subtitles-parser');
const moment = require('moment');
const builder = require('xmlbuilder');

let srt = '';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    srt += chunk;
  }
});

process.stdin.on('end', () => {
  const data = parser.fromSrt(srt);

  const re = /\GPS\([-]?[0-9]{1,3}\.[0-9]{3,}\,[-]?[0-9]{1,3}\.[0-9]{3,},?[0-9]{1,2}\)/;

  const gpx = builder.create('gpx').att({xmlns: 'http://www.topografix.com/GPX/1/1', version: '1.1'});

  const trk = gpx.ele('trk');
  const trkseg = trk.ele('trkseg');

  data.forEach(item => {

      const rows = item.text.split("\n");

      const time = rows[0].split(") ")[1];

      const m = re.exec(rows[1]);
      if (m) {
          const trkpt = trkseg.ele('trkpt');
          
          const parts = JSON.parse(m[0].replace("GPS(","[").replace(")","]"));

          trkpt.att({
              lat: parts[1],
              lon: parts[0]
          });
          trkpt.ele('time', moment(time, 'YYYY.MM.DD HH:mm:ss').format());
          //trkpt.ele('speed', parseFloat(m[9]) * 1.60934);
      } else {
          console.error(item.text);
      }
  });

  console.log(gpx.end({ pretty: true }));
});
