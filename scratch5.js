const fs = require('fs');
const https = require('https');

let html = fs.readFileSync('d:/DERİ/index.html', 'utf-8');

const productRegex = /<a href="([^"]+trendyol\.com\/[^"]+)"[^>]*class="v6-product-card"/g;
let match;
let urls = [];
while ((match = productRegex.exec(html)) !== null) {
    urls.push(match[1]);
}

async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const newUrl = res.headers.location.startsWith('http') ? res.headers.location : 'https://www.trendyol.com' + res.headers.location;
                resolve(fetchHtml(newUrl)); return;
            }
            let data = Buffer.alloc(0);
            res.on('data', chunk => data = Buffer.concat([data, chunk]));
            res.on('end', () => resolve(data.toString('utf8')));
        });
        req.on('error', reject);
    });
}

async function run() {
    console.log(`Found ${urls.length} product URLs`);
    
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        console.log(`Fetching ${url}...`);
        try {
            let resHtml = await fetchHtml(url);
            let imagesMatch = resHtml.match(/"images":\[(.*?)\]/);
            if (imagesMatch) {
                let imagesStr = imagesMatch[1];
                let imgUrls = [...imagesStr.matchAll(/"([^"]+)"/g)].map(m => m[1]);
                imgUrls = imgUrls.filter(u => u.includes('cdn.dsmcdn.com'));
                
                if (imgUrls.length >= 1) {
                    let img1 = imgUrls[0];
                    let img2 = imgUrls.length > 1 ? imgUrls[1] : imgUrls[0];
                    let img3 = imgUrls.length > 2 ? imgUrls[2] : img2;

                    let escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    let regexStr = `(<a href="${escapedUrl}"[\\s\\S]*?<div class="v6-product-image-slider">)([\\s\\S]*?)(<\\/div>)`;
                    let regex = new RegExp(regexStr, '');
                    
                    let newSliderContent = `\n                        <img src="https://cdn.dsmcdn.com${img1.replace('https://cdn.dsmcdn.com', '')}" alt="Ürün" class="v6-product-img">\n                        <img src="https://cdn.dsmcdn.com${img2.replace('https://cdn.dsmcdn.com', '')}" alt="Ürün Foto 2" class="v6-product-img" onerror="this.src='https://cdn.dsmcdn.com${img1.replace('https://cdn.dsmcdn.com', '')}'">\n                        <img src="https://cdn.dsmcdn.com${img3.replace('https://cdn.dsmcdn.com', '')}" alt="Ürün Foto 3" class="v6-product-img" onerror="this.src='https://cdn.dsmcdn.com${img1.replace('https://cdn.dsmcdn.com', '')}'">\n                    `;
                    
                    html = html.replace(regex, `$1${newSliderContent}$3`);
                    console.log(`Updated images for product ${i+1}`);
                }
            } else {
                console.log(`No images found for product ${i+1}`);
            }
        } catch(e) {
            console.error(`Error for product ${i+1}`, e);
        }
    }
    
    fs.writeFileSync('d:/DERİ/index.html', html);
    console.log('Done!');
}

run();
