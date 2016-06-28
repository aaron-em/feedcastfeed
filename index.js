var util = require('util');
var FetchStream = require('./lib/fetch-stream');

var entries = new FetchStream("https://stratechery.com/feed/");

entries.on('data', function(item) {
  console.log(util.inspect(item));
});

entries.go();
