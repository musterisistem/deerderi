const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Remove target="_blank" from product cards
content = content.replace(/target="_blank"/g, '');

fs.writeFileSync('index.html', content, 'utf8');
console.log("Removed target=_blank in index.html");
