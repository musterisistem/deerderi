const fs = require('fs');
const path = require('path');

const dir = 'd:\\DERİ';

// 1. Rename register.html to kayit.html
const oldPath = path.join(dir, 'register.html');
const newPath = path.join(dir, 'kayit.html');

if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Renamed register.html to kayit.html');
}

// 2. Update references in specific files
const filesToUpdate = [
    'v6-script.js',
    'checkout.html',
    'server.js',
    'scratch_global_sync.js'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/\/register\.html/g, '/kayit.html');
        content = content.replace(/'register\.html'/g, "'kayit.html'");
        content = content.replace(/"register\.html"/g, '"kayit.html"');
        content = content.replace(/register\.html/g, 'kayit.html');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated references in ${file}`);
    }
});

console.log('Update script completed.');
