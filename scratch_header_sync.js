const fs = require('fs');

let index_content = fs.readFileSync('index.html', 'utf8');

// Extract v6 header (from top bar to sidebar menu end)
let header_match = index_content.match(/(<!-- 1\. Top Bar \(Campaign Marquee\) -->[\s\S]*?<\/nav>\s*<\/div>)/);
let v6_header = header_match ? header_match[1] : null;

if (!v6_header) {
    console.error("Could not find v6 header in index.html");
    process.exit(1);
}

// Extract v6 footer
let footer_match = index_content.match(/(<footer id="dynamic-footer">[\s\S]*?<\/footer>)/);
let v6_footer = footer_match ? footer_match[1] : null;

if (!v6_footer) {
    console.error("Could not find v6 footer in index.html");
    process.exit(1);
}

let product_content = fs.readFileSync('product.html', 'utf8');

// Add v6-design.css to product.html if not present
if (!product_content.includes('v6-design.css')) {
    product_content = product_content.replace(
        '<link rel="stylesheet" href="/styles.css">',
        '<link rel="stylesheet" href="/styles.css">\n    <link rel="stylesheet" href="v6-design.css?v=206">'
    );
}

// Add v6-script.js to product.html if not present
if (!product_content.includes('v6-script.js')) {
    product_content = product_content.replace(
        /<\/body>/,
        '    <script src="v6-script.js"></script>\n</body>'
    );
}

// Replace old header
product_content = product_content.replace(/<!-- 1\. Duyuru Bandı -->[\s\S]*?<\/header>/, v6_header);

// Replace old footer
product_content = product_content.replace(/<!-- Footer \(Same as index\) -->[\s\S]*?<footer id="dynamic-footer">[\s\S]*?<\/footer>/, '<!-- Footer -->\n    ' + v6_footer);
// Just in case it didn't match the exact comment string:
if (product_content.includes('<footer id="dynamic-footer">')) {
    product_content = product_content.replace(/<footer id="dynamic-footer">[\s\S]*?<\/footer>/, v6_footer);
}


fs.writeFileSync('product.html', product_content, 'utf8');
console.log("Successfully synced header and footer to product.html");
