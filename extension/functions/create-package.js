const fs = require('fs');
const archiver = require('archiver');

const name = `${process.env.TARGET}-${process.env.CHANNEL}.zip`;

if (!fs.existsSync("dist")) fs.mkdirSync("dist");

const output = fs.createWriteStream(`dist/${name}`);

const archive = archiver('zip', {
    zlib: { level: 9 }
});

archive.pipe(output);

archive.directory('build', '.');
archive.finalize();
