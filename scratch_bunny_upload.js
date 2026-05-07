const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const BUNNY_STORAGE_ZONE = 'deerderi';
const BUNNY_ACCESS_KEY = '308f26f7-7dcd-4a24-9aca0646fd51-77a4-437a';
const BUNNY_PULL_ZONE = 'deerderi.b-cdn.net';
// Endpoint is Frankfurt
const BUNNY_STORAGE_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/`;

const injectContent = fs.readFileSync('inject_products.js', 'utf8');
let dataContent = '';
try {
    dataContent = fs.readFileSync('data.js', 'utf8');
} catch(e) {
    console.log("No data.js found.");
}

const regex = /https:\/\/cdn\.dsmcdn\.com\/[^"'\s]+/g;

let matches = new Set();
let match;
while ((match = regex.exec(injectContent)) !== null) matches.add(match[0]);
if (dataContent) {
    while ((match = regex.exec(dataContent)) !== null) matches.add(match[0]);
}

const urlsToProcess = Array.from(matches);
console.log(`Found ${urlsToProcess.length} unique Trendyol images.`);

async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

async function uploadToBunny(filename, buffer) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'PUT',
            hostname: 'storage.bunnycdn.com',
            path: `/${BUNNY_STORAGE_ZONE}/${filename}`,
            headers: {
                'AccessKey': BUNNY_ACCESS_KEY,
                'Content-Type': 'image/jpeg',
                'Content-Length': buffer.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201 || res.statusCode === 200) {
                    resolve(true);
                } else {
                    console.log(`Bunny Upload Error: ${res.statusCode} ${data}`);
                    resolve(false);
                }
            });
        });

        req.on('error', reject);
        req.write(buffer);
        req.end();
    });
}

async function processItem(oldUrl) {
    try {
        const buffer = await downloadImage(oldUrl);
        const hash = crypto.createHash('md5').update(oldUrl).digest('hex').substring(0, 6);
        const filename = `deer-deri-premium-kilif-${hash}.jpg`;
        const success = await uploadToBunny(filename, buffer);
        if (success) {
            return { oldUrl, newUrl: `https://${BUNNY_PULL_ZONE}/${filename}` };
        }
    } catch(e) {
        console.error(`Failed ${oldUrl}: ${e.message}`);
    }
    return null;
}

async function run() {
    let mapping = {};
    const CONCURRENCY = 20;
    
    for (let i = 0; i < urlsToProcess.length; i += CONCURRENCY) {
        const batch = urlsToProcess.slice(i, i + CONCURRENCY);
        console.log(`Processing batch ${i/CONCURRENCY + 1} of ${Math.ceil(urlsToProcess.length/CONCURRENCY)}...`);
        
        const results = await Promise.all(batch.map(processItem));
        
        results.forEach(res => {
            if (res) {
                mapping[res.oldUrl] = res.newUrl;
            }
        });
    }

    console.log("\nReplacing URLs in files...");
    let newInjectContent = injectContent;
    let newDataContent = dataContent;

    for (const [oldUrl, newUrl] of Object.entries(mapping)) {
        newInjectContent = newInjectContent.split(oldUrl).join(newUrl);
        if (newDataContent) {
            newDataContent = newDataContent.split(oldUrl).join(newUrl);
        }
    }

    fs.writeFileSync('inject_products.js', newInjectContent, 'utf8');
    if (newDataContent) {
        fs.writeFileSync('data.js', newDataContent, 'utf8');
    }
    
    console.log(`Successfully mapped ${Object.keys(mapping).length} images.`);
    console.log("Done! Now run: node inject_products.js");
}

run();
