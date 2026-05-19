const fs = require('fs');
let code = fs.readFileSync('v6-script.js', 'utf8');
const searchCode = '<i class="fa-solid ${camp.icon}" style="color: ${camp.color};"></i>';
const replacement = '<svg class="i i-${camp.icon}" style="color: ${camp.color}; --i-size: 16px; margin-right: 5px; vertical-align: text-top;"><use href="/assets/svg-sprite.svg#${camp.icon}"/></svg>';
code = code.split(searchCode).join(replacement);
fs.writeFileSync('v6-script.js', code);
console.log('v6-script.js updated.');
