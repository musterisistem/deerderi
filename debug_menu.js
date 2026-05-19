const fs = require('fs');
const code = fs.readFileSync('admin.js','utf8');
const idx = code.indexOf("case 'menu-settings'");
console.log('menu-settings case found at idx:', idx);
if(idx > 0) console.log(code.substring(idx, idx+150));

// Also check renderMenuConfigSettings
const idx2 = code.indexOf("renderMenuConfigSettings");
console.log('\nrenderMenuConfigSettings idx:', idx2);
if(idx2 > 0) console.log(code.substring(idx2, idx2+80));
