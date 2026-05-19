const fs = require('fs');
let data = fs.readFileSync('data.js', 'utf8');
const match = data.indexOf('"id": 13,');
if (match > -1) {
    // Find the previous '},'
    const lastBrace = data.lastIndexOf('}', match);
    if (lastBrace > -1) {
        data = data.substring(0, lastBrace + 1) + '\n];\n';
        fs.writeFileSync('data.js', data);
        console.log('Successfully truncated data.js');
    }
}
