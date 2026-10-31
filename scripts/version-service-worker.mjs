import {readFileSync,writeFileSync} from 'node:fs';
const path='dist/sw.js';
const version=(process.env.GITHUB_SHA||process.env.DVOLADA_BUILD_ID||Date.now().toString(36)).replace(/[^a-zA-Z0-9-]/g,'').slice(0,40);
let source=readFileSync(path,'utf8');
source=source.replace(/const CACHE='dvolada-shell-[^']+';/,`const CACHE='dvolada-shell-${version}';`);
writeFileSync(path,source+'\n// Build: '+version+'\n');
console.log('PWA build:',version);
