const fs = require('fs');
let html = fs.readFileSync('checkout.html', 'utf8');

// Update .checkout-section CSS
html = html.replace(/\.checkout-section\s*\{\s*background:\s*#fff;\s*border:\s*1px solid var\(--border-color\);/g, 
    '.checkout-section {\n            background: #fafafa;\n            border: 1px solid #ebebeb;\n            box-shadow: 0 4px 15px rgba(0,0,0,0.03);');

// Update .form-control CSS to be explicitly white with a slightly darker border
html = html.replace(/\.form-control\s*\{\s*width:\s*100%;\s*padding:\s*10px;\s*border:\s*1px solid var\(--border-color\);/g,
    '.form-control {\n            width: 100%;\n            padding: 10px;\n            background: #ffffff;\n            border: 1px solid #dcdcdc;');

// Update the first .summary-box (which has no inline styles) via CSS
if (!html.includes('.summary-box {') && html.includes('<div class="summary-box">')) {
    html = html.replace('<div class="summary-box">', '<div class="summary-box" style="background:#fafafa; border:1px solid #ebebeb; padding:20px; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">');
}

// Update the second .summary-box which has inline styles (the payment section we moved to sidebar)
html = html.replace(/<div class="summary-box" style="margin-top:20px; padding:20px; background:#fff; border:1px solid var\(--border-color\); border-radius:4px;">/g,
    '<div class="summary-box" style="margin-top:20px; padding:20px; background:#fafafa; border:1px solid #ebebeb; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">');

// Also update the Guest Mode selector background to match
html = html.replace(/<div id="auth-mode-selector" style="display:flex; border-bottom:1px solid var\(--border-color\); background:#fafafa;">/g,
    '<div id="auth-mode-selector" style="display:flex; border-bottom:1px solid #ebebeb; background:#f0f0f0; border-radius:6px 6px 0 0;">');

html = html.replace(/btn-addr-type active(.*?)background:#fff;/g, 'btn-addr-type active$1background:#fafafa;');

fs.writeFileSync('checkout.html', html, 'utf8');
console.log('CSS modified for darker sections.');
