const fs = require('fs');

let html = fs.readFileSync('d:/DERİ/index.html', 'utf-8');

html = html.replace(/<div class="v6-product-image-slider">[\s\S]*?<img src="(.*?)\/1_org_zoom\.jpg"[\s\S]*?<img src=".*?"[^>]*>\s*<\/div>/g, (match, urlBase) => {
    return `<div class="v6-product-image-slider">
                        <img src="${urlBase}/1_org_zoom.jpg" alt="Ürün" class="v6-product-img">
                        <img src="${urlBase}/2_org_zoom.jpg" alt="Ürün Foto 2" class="v6-product-img" onerror="this.src='${urlBase}/1_org_zoom.jpg'">
                        <img src="${urlBase}/3_org_zoom.jpg" alt="Ürün Foto 3" class="v6-product-img" onerror="this.src='${urlBase}/1_org_zoom.jpg'">
                    </div>`;
});

fs.writeFileSync('d:/DERİ/index.html', html);
console.log('Images updated successfully in index.html!');
