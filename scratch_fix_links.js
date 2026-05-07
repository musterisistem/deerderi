const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Replace trendyol links in product cards with product.html
content = content.replace(/href="https:\/\/www\.trendyol\.com\/[^"]+"/g, 'href="product.html"');

fs.writeFileSync('index.html', content, 'utf8');
console.log("Updated links in index.html");
