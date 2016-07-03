var util = require('util');
var stream = require('stream');

var FeedParser = require('feedparser');
var config = require('config');
var request = require('request');
var striptags = require('striptags');
var entities = require('entities');

function FetchStream(uri) {
  stream.Readable.call(this, {objectMode: true});

  this.running = false;
  this.uri = uri;
  this.items = [];
};
util.inherits(FetchStream, stream.Readable);

FetchStream.prototype.go = function() {
  this._run();
};

FetchStream.prototype._read = function() {};

FetchStream.prototype._run = function() {
  var self = this;
  
  var req = request(this.uri);
  var parser = new FeedParser({});
  var items = this.items;
  
  this.running = true;

  req.on('error', function(err) {
    throw err;
  });

  req.on('response', function(res) {
    if (res.statusCode !== 200) {
      throw new Error('Failed fetchFeed(' + this.uri + '): HTTP ' + res.statusCode);
    };

    this.pipe(parser);
  });

  parser.on('error', function(err) {
    throw err;
  });

  parser.on('readable', function() {
    var item;

    while ((item = this.read())) {
      self.push({
        source: item.meta.title,
        title: item.title,
        uri: item.origlink || item.link,
        guid: item.guid,
        content: entities.decodeXML(striptags(item.description))
      });
    };
  });
};

module.exports = FetchStream;
