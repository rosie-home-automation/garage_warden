const tee = require('pino-tee');
const fs = require('fs');
const stream = tee(process.stdin);
stream.tee(fs.createWriteStream('logs/garage-warden.log'));
stream.pipe(process.stdout);
