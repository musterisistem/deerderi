const fs = require('fs');
const html = fs.readFileSync('dump.html', 'utf8');
const scriptMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
if (scriptMatch) {
    const state = JSON.parse(scriptMatch[1]);
    const p = state.product.detail;
    console.log("Title:", p.name);
    console.log("Image:", 'https://cdn.dsmcdn.com' + p.images[0]);
    console.log("Price:", p.price.discountedPrice.text);
} else {
    console.log("No initial state found.");
}
