var config = require('config');
var util = require('util');
var fs = require('fs');

function handleError(name) {
  return function(err) {
    console.error(name + ' blew up: ' + err.message + '\n' + err.stack);
  };
};

var feeds = require(config.feeds);
var knownGuids = require(config.paths.guids);

var FetchStream = require('./lib/fetch-stream');
var TTSStream = require('./lib/tts-stream');
var MP3Stream = require('./lib/mp3-stream');

var mp3 = new MP3Stream(config.processors.mp3);
var tts = new TTSStream(config.processors.tts);
tts.pipe(mp3);

var feedStreams = [];
feeds.forEach(function(feed) {
  var feedStream = new FetchStream(feed, knownGuids);

  feedStream.on('error', handleError('parser for ' + feed.uri));
  feedStream.on('data', function(entry) {
    if (config.flags.dumpFeedItems) {
      console.log(JSON.stringify(entry, false, 2));
    } else {
      console.log('parser for ' + feed.uri + ' finished with ' + entry.title);
    };
  });
  
  feedStream.pipe(tts);
  feedStreams.push(feedStream);
});

tts.on('error', handleError('tts'));
mp3.on('error', handleError('mp3'));

tts.on('data', function(item) {
  console.log('tts finished with', item.entry.title);
});

mp3.on('data', function(item) {
  console.log('mp3 finished with', item.entry.title);
  item.filename = config.paths.mp3
    + item.entry.source + ' - '
    + item.entry.title.replace(/:/g, '_')
    + '.mp3';

  var file = fs.createWriteStream(item.filename);
  file.write(item.mp3Data);
  file.end();

  knownGuids.push(item.entry.raw.guid);
  fs.writeFile(config.paths.guids,
               JSON.stringify(knownGuids, false, 2),
               function(err) {
                 if (err) console.error('Failed saving GUID list: ' + err.message);
               });
});

feedStreams.forEach(function(stream) {
  stream.go();
});
