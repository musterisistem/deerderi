const fs = require('fs');

let content = fs.readFileSync('checkout.html', 'utf8');

// Replace CSS values to make it more compact
content = content.replace(/gap: 50px;/g, 'gap: 30px;');
content = content.replace(/padding: 35px;/g, 'padding: 15px 20px;');
content = content.replace(/margin-bottom: 30px;/g, 'margin-bottom: 15px;');
content = content.replace(/margin-bottom: 25px;/g, 'margin-bottom: 12px;');
content = content.replace(/padding-bottom: 15px;/g, 'padding-bottom: 8px;');
content = content.replace(/font-size: 22px;/g, 'font-size: 18px;');
content = content.replace(/gap: 20px;/g, 'gap: 12px;');
content = content.replace(/margin-bottom: 20px;/g, 'margin-bottom: 12px;');
content = content.replace(/margin-bottom: 8px;/g, 'margin-bottom: 4px;');
content = content.replace(/font-size: 12px;/g, 'font-size: 11px;');
content = content.replace(/padding: 14px;/g, 'padding: 10px;');
content = content.replace(/padding: 30px;/g, 'padding: 15px;');
content = content.replace(/padding: 20px;/g, 'padding: 12px;');
content = content.replace(/gap: 15px;/g, 'gap: 10px;');
content = content.replace(/rows="3"/g, 'rows="2"');

fs.writeFileSync('checkout.html', content, 'utf8');
console.log('CSS compacted.');
