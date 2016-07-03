var util = require('util');
var stream = require('stream');
var child_process = require('child_process');

function TTSStream(processor) {
  stream.Duplex.call(this, {objectMode: true});
  this.processorPath = processor[0];
  this.processorArgs = processor[1];
};
util.inherits(TTSStream, stream.Duplex);

TTSStream.prototype._read = function(size) {};

TTSStream.prototype._write = function(entry, encoding, done) {
  var self = this;
  var wavData = new Buffer(0);
  var child;

  child = child_process.spawn(this.processorPath, this.processorArgs, {
    cwd: process.cwd(),
    env: {},
    stdio: 'pipe'
  });

  child.stdout.on('readable', function() {
    var chunk;
    while ((chunk = child.stdout.read(1024 * 1024))) {
      wavData = Buffer.concat([wavData, chunk]);
    };
  });

  child.stdout.on('end', function() {
    self.push({
      entry: entry,
      wavData: wavData
    });
  });

  child.on('error', function(err) {
    done(new Error('TTS unstart: ' + err.message));
  });

  child.on('close', function(exitCode) {
    var stderr = child.stderr.read(16384);
    if (stderr && stderr.length > 0) {
      done(new Error('TTS failed: ' + stderr.toString('utf8')));
    } else {
      done();
    };
  });

  child.stdin.write(entry.title);
  child.stdin.write('\n\n');
  child.stdin.write(entry.content);
  child.stdin.write('\n\n');
  child.stdin.end();
};

module.exports = TTSStream;
