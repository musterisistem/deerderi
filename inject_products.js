const fs = require('fs');

// The 8 Trendyol products we added to data.js
const trendyolProducts = [
    {
        name: "Juno İphone Hakiki Deri Koruyucu Kılıf Iphone 15 Pro",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-e51b8f.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-d1b223.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-519f76.jpg"
        ],
        rating: 4.8,
        reviews: 145
    },
    {
        name: "Juno İphone Hakiki Deri Koruyucu Kılıf Iphone 12/12 Pro Uyumlu",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-25ef21.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-d9454d.jpg"
        ],
        rating: 4.6,
        reviews: 89
    },
    {
        name: "Juno İphone Hakiki Deri Koruyucu Kılıf Iphone 12/12 Pro Uyumlu",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-fe7a93.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-5d1f1f.jpg"
        ],
        rating: 4.8,
        reviews: 210
    },
    {
        name: "Juno İphone Hakiki Deri Koruyucu Kılıf Iphone 12/12 Pro uyumlu",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-99a01f.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-58bd66.jpg"
        ],
        rating: 4.5,
        reviews: 45
    },
    {
        name: "Juno İphone Hakiki Deri Koruyucu Kılıf Iphone 12/12 Pro Uyumlu",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-568950.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-4bacae.jpg"
        ],
        rating: 4.7,
        reviews: 112
    },
    {
        name: "Juno Iphone 11 Hakiki Deri Koruyucu Kılıf",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-cd8cf0.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-ecb2fc.jpg"
        ],
        rating: 4.6,
        reviews: 88
    },
    {
        name: "Juno Iphone 11 Hakiki Deri Koruyucu Kılıf",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-88b18b.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-169d77.jpg"
        ],
        rating: 4.4,
        reviews: 56
    },
    {
        name: "Juno Iphone 11 Hakiki Deri Koruyucu Kılıf",
        price: "499,90",
        oldPrice: "799,90",
        images: [
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-f9b9da.jpg",
            "https://deerderi.b-cdn.net/deer-deri-premium-kilif-5c37aa.jpg"
        ],
        rating: 4.0,
        reviews: 24
    }
];

function slugifyText(text) {
    if (!text) return '';
    const trMap = {
        'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
    };
    let result = text.toLowerCase();
    for (let key in trMap) {
        result = result.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return result
        .replace(/[^-a-zA-Z0-9\s]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

let html = '';
trendyolProducts.forEach((p, idx) => {
    let imagesHtml = '';
    p.images.forEach((img, i) => {
        let errHandler = i > 0 ? ` onerror="this.src='${p.images[0]}'"` : '';
        imagesHtml += `<img src="${img}" alt="Ürün Foto ${i+1}" class="v6-product-img"${errHandler}>\n`;
    });

    html += `
            <!-- Product ${idx + 1} -->
            <a href="/urun-${slugifyText(p.name)}" class="v6-product-card" style="text-decoration: none; color: inherit;">
                <div class="v6-product-badges">
                    <span class="v6-badge-discount">YENİ</span>
                </div>
                <div class="v6-product-image-container">
                    <div class="v6-product-image-slider">
                        ${imagesHtml.trim()}
                    </div>
                    <div class="v6-product-rating-overlay">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star-half-stroke"></i>
                        <span>(${p.reviews} Yorum)</span>
                    </div>
                </div>
                <div class="v6-product-info">
                    <div class="v6-product-brand">DEER DERİ</div>
                    <h3 class="v6-product-name">${p.name}</h3>
                    <div class="v6-product-price">
                        <span class="old-price">₺${p.oldPrice}</span>
                        <span class="new-price">₺${p.price}</span>
                    </div>
                </div>
            </a>
`;
});

let indexContent = fs.readFileSync('./index.html', 'utf-8');
// replace everything between <div class="v6-products-grid"> and </div> </section>
const startToken = '<div class="v6-products-grid">';
const endToken = '</div>\n    </section>';
const startIdx = indexContent.indexOf(startToken);
const endIdx = indexContent.indexOf(endToken, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = indexContent.substring(0, startIdx + startToken.length) + '\n' + html + indexContent.substring(endIdx);
    fs.writeFileSync('./index.html', newContent, 'utf-8');
    console.log("Updated index.html!");
} else {
    console.log("Could not find the grid boundaries.");
}
