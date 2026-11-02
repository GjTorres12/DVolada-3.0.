import {readFileSync,writeFileSync} from 'node:fs';
const path='dist/sw.js';
const version=(process.env.GITHUB_SHA||process.env.DVOLADA_BUILD_ID||Date.now().toString(36)).replace(/[^a-zA-Z0-9-]/g,'').slice(0,40);
let source=readFileSync(path,'utf8');
source=source.replace(/const CACHE='dvolada-shell-[^']+';/,`const CACHE='dvolada-shell-${version}';`);
writeFileSync(path,source+'\n// Build: '+version+'\n');
console.log('PWA build:',version);

// Publish a lightweight build manifest for active desktop and mobile sessions.
writeFileSync('dist/version.json',JSON.stringify({version,updatedAt:new Date().toISOString()})+'\n');
const indexPath='dist/index.html';
const index=readFileSync(indexPath,'utf8');
writeFileSync(indexPath,index.replace('</head>',`<meta name="dvolada-build" content="${version}"/></head>`));
