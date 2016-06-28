var config = require('config');
var util = require('util');

var FetchStream = require('./lib/fetch-stream');
var TTSStream = require('./lib/tts-stream');

var entries = new FetchStream("https://stratechery.com/feed/");
var tts = new TTSStream(config.paths.tts, config.paths.temp);

entries.pipe(tts);

// entries.on('data', function(item) {
//   console.log(util.inspect(item));
// });

entries.go();
