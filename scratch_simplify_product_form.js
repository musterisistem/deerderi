const fs = require('fs');
let css = fs.readFileSync('product-form.css', 'utf8');

// Strip border radii
css = css.replace(/border-radius:\s*12px/g, 'border-radius: 0');
css = css.replace(/border-radius:\s*6px/g, 'border-radius: 0');
css = css.replace(/border-radius:\s*8px/g, 'border-radius: 0');

// Reduce gaps and paddings
css = css.replace(/gap:\s*25px/g, 'gap: 15px');
css = css.replace(/padding:\s*25px/g, 'padding: 15px');
css = css.replace(/padding:\s*20px/g, 'padding: 10px');
css = css.replace(/padding:\s*15px 20px/g, 'padding: 8px 10px');

// Simplify input controls
css = css.replace(/\.form-control \{[\s\S]*?\}/, `.form-control {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 0;
    font-size: 12px;
    background: #fff;
}`);

// Shadows
css = css.replace(/box-shadow:\s*[^;]+;/g, 'box-shadow: none;');

fs.writeFileSync('product-form.css', css, 'utf8');
console.log('product-form.css simplified');
