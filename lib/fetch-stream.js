var util = require('util');
var stream = require('stream');

var FeedParser = require('feedparser');
var config = require('config');
var request = require('request');
var striptags = require('striptags');
var xmlEntities = require('entities');
var htmlEntities = require('html-entities').AllHtmlEntities;

function FetchStream(feed, knownGuids) {
  stream.Readable.call(this, {objectMode: true});

  this.running = false;
  this.known = knownGuids;
  this.feed = feed;
  this.uri = feed.uri;
  this.include = feed.include || function() { return true; };
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
      if (! self.include(item)) continue;
      if (self.known.indexOf(item.guid) !== -1) continue;
      
      self.push({
        source: item.meta.title,
        title: item.title,
        uri: item.origlink || item.link,
        guid: item.guid,
        content: htmlEntities.decode(xmlEntities.decodeXML(striptags(item.description))),
        raw: item
      });
    };
  });
};

module.exports = FetchStream;
