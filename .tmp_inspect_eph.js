import fs from 'fs';
import readline from 'readline';

const stream = fs.createReadStream('./data/raw/eph_personas.txt');
const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

rl.on('line', (line) => {
  const headers = line.split(';').map((h) => h.trim().replace(/"/g, ''));
  console.log(line.slice(0, 300));
  console.log('ESTADO', headers.indexOf('ESTADO'), 'CH03', headers.indexOf('CH03'), 'CH04', headers.indexOf('CH04'), 'PONDERA', headers.indexOf('PONDERA'));
  rl.close();
  stream.close();
});