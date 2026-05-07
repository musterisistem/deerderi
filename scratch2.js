const https = require('https');

const urls = [
    'https://www.trendyol.com/pd/deerderi/temple-model-hakiki-deri-kadin-cuzdan-p-1134497362?boutiqueId=61&merchantId=1155143',
    'https://www.trendyol.com/deerderi/6-bolmeli-hakiki-deri-el-iscilikli-mekanizmali-cuzdan-p-1120136743?boutiqueId=61&merchantId=1155143',
    'https://www.trendyol.com/pd/deerderi/grand-model-fermuarli-hakiki-deri-kadin-cuzdani-p-1134795237?boutiqueId=61&merchantId=1155143',
    'https://www.trendyol.com/pd/deerderi/grand-model-fermuarli-hakiki-deri-kadin-cuzdani-p-1134795228?boutiqueId=61&merchantId=1155143'
];

async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
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

async function scrape() {
    for (let i = 0; i < urls.length; i++) {
        const html = await fetchHtml(urls[i]);
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
        let title = titleMatch ? titleMatch[1].split(' - ')[0].replace(/^DEERDER[İI]\s*/,'') : 'Unknown';
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        const img = imageMatch ? imageMatch[1] : '';
        const priceMatch = html.match(/"discountedPrice":\{"text":"([^"]+)"/);
        const price = priceMatch ? priceMatch[1] : '1.749,90 TL';
        const oldPriceMatch = html.match(/"originalPrice":\{"text":"([^"]+)"/);
        const oldPrice = oldPriceMatch ? oldPriceMatch[1] : '2.499,90 TL';
        console.log(`P${i+1}: ${title}`);
        console.log(`  IMG: ${img}`);
        console.log(`  PRICE: ${oldPrice} -> ${price}`);
        console.log('---');
    }
}
scrape();
