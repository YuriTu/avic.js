const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, './dec/avif_dec.js');
const origin = fs
    .readFileSync(filepath)
    .toString('UTF8')
    .split(/\r?\n/g);

origin.push(`export default avif_dec;`);

fs.writeFileSync(filepath, origin.join('\n'));