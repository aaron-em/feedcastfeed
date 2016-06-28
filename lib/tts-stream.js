var util = require('util');
var stream = require('stream');
var child_process = require('child_process');

function TTSStream(binaryPath, tempDir) {
  stream.Writable.call(this, {objectMode: true});

  this.binaryPath = binaryPath;
  this.tempDir = tempDir;
};
util.inherits(TTSStream, stream.Writable);

TTSStream.prototype._write = function(chunk, encoding, done) {
  var child;
  
  console.log('got a chunk', chunk.title);

  child = child_process
    .spawn(this.binaryPath,
           ['-o',
            './'
            + this.tempDir
            + '/'
            + Math.random().toString(36).slice(2) + '.wav'],
           {
             cwd: process.cwd(),
             env: {},
             stdio: 'pipe'
           });

  child.on('error', function(err) {
    done(err);
  });

  child.on('close', function(exitCode) {
    var stderr = child.stderr.read(16384);
    if (stderr && stderr.length > 0) {
      done(new Error('TTS failed: ' + stderr.toString('utf8')));
    } else {
      done();
    };
  });

  child.stdin.write(chunk.title);
  child.stdin.end();
};

module.exports = TTSStream;
