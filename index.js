var config = require('config');
var util = require('util');
var fs = require('fs');

var FetchStream = require('./lib/fetch-stream');
var TTSStream = require('./lib/tts-stream');
var MP3Stream = require('./lib/mp3-stream');

var entries = new FetchStream("https://stratechery.com/feed/");
var tts = new TTSStream(config.processors.tts);
var mp3 = new MP3Stream(config.processors.mp3);

entries
  .pipe(tts)
  .pipe(mp3);

function handleError(name) {
  return function(err) {
    throw new Error(name + ' blew up: ' + err.message + '\n' + err.stack);
  };
};

entries.on('error', handleError('parser'));
tts.on('error', handleError('tts'));
mp3.on('error', handleError('mp3'));

entries.on('data', function(entry) {
  console.log('parser finished with', entry.title);
});

tts.on('data', function(item) {
  console.log('tts finished with', item.entry.title);
});

mp3.on('data', function(item) {
  console.log('mp3 finished with', item.entry.title);

  var file = fs.createWriteStream(config.paths.mp3
                                  + item.entry.title + '.mp3');
  file.write(item.mp3Data);
  file.end();
});

entries.go();
