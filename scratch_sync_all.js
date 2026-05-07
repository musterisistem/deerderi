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

const filesToSync = ['cart.html', 'checkout.html', 'success.html'];

filesToSync.forEach(filename => {
    if (fs.existsSync(filename)) {
        let content = fs.readFileSync(filename, 'utf8');

        // Add v6-design.css if not present
        if (!content.includes('v6-design.css')) {
            content = content.replace(
                '<link rel="stylesheet" href="styles.css">',
                '<link rel="stylesheet" href="styles.css">\n    <link rel="stylesheet" href="v6-design.css?v=206">'
            );
            // In case it's /styles.css
            content = content.replace(
                '<link rel="stylesheet" href="/styles.css">',
                '<link rel="stylesheet" href="/styles.css">\n    <link rel="stylesheet" href="v6-design.css?v=206">'
            );
        }

        // Add v6-script.js if not present
        if (!content.includes('v6-script.js')) {
            content = content.replace(
                /<\/body>/,
                '    <script src="v6-script.js"></script>\n</body>'
            );
        }

        // Replace old header
        // Some might start with <header id="main-header"> and end with </header>
        // Or <!-- Header --> \n <header id="main-header">
        content = content.replace(/<!-- Header -->[\s\S]*?<header id="main-header">[\s\S]*?<\/header>/, v6_header);
        content = content.replace(/<header id="main-header">[\s\S]*?<\/header>/, v6_header);
        
        // Also if they still have announcement bar
        content = content.replace(/<div class="announcement-bar">[\s\S]*?<\/div>/, '');

        // Replace old footer
        content = content.replace(/<!-- Footer -->[\s\S]*?<footer id="dynamic-footer">[\s\S]*?<\/footer>/, '<!-- Footer -->\n    ' + v6_footer);
        if (content.includes('<footer id="dynamic-footer">')) {
            content = content.replace(/<footer id="dynamic-footer">[\s\S]*?<\/footer>/, v6_footer);
        }
        
        // Match boxy aesthetics (replace blue buttons, rounded corners)
        content = content.replace(/background: #1b6df9;/g, 'background: #000;');
        content = content.replace(/color: #1b6df9;/g, 'color: #000;');
        content = content.replace(/border-radius: 4px;/g, 'border-radius: 0px;');
        content = content.replace(/border-radius: 8px;/g, 'border-radius: 0px;');
        content = content.replace(/border-radius: 25px;/g, 'border-radius: 0px;');

        fs.writeFileSync(filename, content, 'utf8');
        console.log("Successfully synced " + filename);
    } else {
        console.log(filename + " does not exist.");
    }
});
