var util = require('util');
var stream = require('stream');

var FeedParser = require('feedparser');
var config = require('config');
var request = require('request');
var striptags = require('striptags');
var entities = require('entities');

function fetchFeed(uri) {
  var req = request(uri);
  var parser = new FeedParser({});
  var resultStream = new stream.Readable({objectMode: true});
  var items = [];

  req.on('error', function(err) {
    throw err;
  });

  req.on('response', function(res) {
    var stream = this;

    if (res.statusCode !== 200) {
      throw new Error('Failed fetchFeed(' + uri + '): HTTP ' + res.statusCode);
    };

    stream.pipe(parser);
  });

  parser.on('error', function(err) {
    throw err;
  });

  parser.on('readable', function() {
    var stream = this;
    var item;

    while ((item = stream.read())) {
      // console.log(util.inspect(item));
      resultStream.push({
        title: item.title,
        uri: item.origlink || item.link,
        guid: item.guid,
        content: entities.decodeXML(striptags(item.description))
      });
    };
  });

  resultStream._read = function(size) {};

  return resultStream;
};

var entries = fetchFeed("https://stratechery.com/feed/");
entries.on('data', function(item) {
  console.log(util.inspect(item));
});
