const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
// Remove the inline style from product name h3 tags
html = html.replace(/ style="font-size: 12px; margin-bottom: 5px; height: 34px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"/g, '');
fs.writeFileSync('index.html', html);
console.log('Done - inline styles removed');
