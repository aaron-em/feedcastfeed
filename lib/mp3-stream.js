var util = require('util');
var stream = require('stream');
var child_process = require('child_process');

function MP3Stream(processor) {
  stream.Duplex.call(this, {objectMode: true});
  this.processorPath = processor[0];
  this.processorArgs = processor[1];
};
util.inherits(MP3Stream, stream.Duplex);

MP3Stream.prototype._read = function(size) {};

MP3Stream.prototype._write = function(entry, encoding, done) {
  var self = this;
  var mp3Data = new Buffer(0);
  var child;
  var stderr;

  child = child_process.spawn(this.processorPath, this.processorArgs, {
    cwd: process.cwd(),
    env: {},
    stdio: 'pipe'
  });

  child.stdout.on('readable', function() {
    var chunk;
    while ((chunk = child.stdout.read(1024 * 1024))) {
      mp3Data = Buffer.concat([mp3Data, chunk]);
    };
  });

  child.stdout.on('end', function() {
    self.push({
      entry: entry.entry,
      mp3Data: mp3Data
    });
  });

  child.stderr.on('readable', function() {
    var chunk;
    while ((chunk = child.stderr.read(1024 * 1024))) {
      stderr += chunk.toString('utf8');
    };
  });

  child.on('error', function(err) {
    done(new Error('MP3 unstart: ' + err.message));
  });

  child.on('close', function(exitCode) {
    if (exitCode !== 0) {
      done(new Error('MP3 failed: ' + stderr));
    } else {
      done();
    };
  });

  child.stdin.on('error', function(err) {
    console.log('MP3 blew up:', stderr);
    done(err);
  });
  
  child.stdin.write(entry.wavData);
  child.stdin.end();
};

module.exports = MP3Stream;
