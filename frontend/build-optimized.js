const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { join, resolve } = require('path');
const { createReadStream, createWriteStream, readdir } = require('fs');

const { promisify } = require('util');
const pipe = promisify(pipeline);

async function do_gzip(input, output) {
  const gzip = createGzip({
    level: 9
  });
  const source = createReadStream(input);
  const destination = createWriteStream(output);
  await pipe(source, gzip, destination);
}

const directoryPaths = [
  join(__dirname, 'dist/pwa'),
  join(__dirname, 'dist/pwa/js'),
  join(__dirname, 'dist/pwa/fonts'),
  join(__dirname, 'dist/pwa/statics/icons')
];

for (let p of directoryPaths) {
  readdir(p, function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach(async function (file) {
      let full_path = join(p, file);
      if (file.indexOf('.gz') === -1 && file.indexOf('.') !== -1) await do_gzip(full_path, full_path + '.gz');
    });
  });
}
