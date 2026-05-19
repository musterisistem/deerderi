const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// Replace all occurrences of goToStep(X) with nothing or comments
code = code.replace(/setTimeout\(\(\)\s*=>\s*goToStep\(\d+\),\s*\d+\);/g, '// goToStep removed');
code = code.replace(/goToStep\(\d+\);/g, '// goToStep removed');

// There's a specific check: `if (window.location.pathname.includes('checkout.html') && typeof goToStep === 'function')`
// Let's replace that block if it's there
code = code.replace(/if\s*\(window\.location\.pathname\.includes\('checkout\.html'\)\s*&&\s*typeof\s*goToStep\s*===\s*'function'\)\s*\{[\s\S]*?\}/g, 
`if (window.location.pathname.includes('checkout.html')) {
    // Single page checkout now, just reload to apply user state
    window.location.reload();
}`);

fs.writeFileSync('script.js', code, 'utf8');
console.log('goToStep references removed');
