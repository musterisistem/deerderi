// Vercel Serverless Function: /api/products
// data.js dosyasındaki ürünleri okuyup döndürür

const fs = require('fs');
const path = require('path');

function slugify(text) {
    if (!text) return '';
    const map = {
        'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
    };
    let result = text.toLowerCase();
    for (const k in map) result = result.replace(new RegExp(k, 'g'), map[k]);
    return result.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function loadProducts() {
    const dataPath = path.join(process.cwd(), 'data.js');
    const raw = fs.readFileSync(dataPath, 'utf8');
    // data.js içindeki products array'ini extract et
    const match = raw.match(/const products\s*=\s*(\[[\s\S]*\]);?\s*$/m) ||
                  raw.match(/const products\s*=\s*(\[[\s\S]*?\]);?\s*(?:if|module|\/\/|$)/m);
    if (!match) throw new Error('products array parse hatası');
    const products = JSON.parse(match[1]);
    // Her ürüne slug ekle
    return products.map(p => ({
        ...p,
        slug: p.slug || slugify(p.name),
        mainImage: p.mainImage || (p.images && p.images[0]) || '/assets/no-image.png'
    }));
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const products = loadProducts();
        const { category, limit, slug, id } = req.query;

        // --- Tek ürün: slug ile ara ---
        if (slug) {
            // Önce exact match, sonra benzer eşleşme
            const product = products.find(p =>
                p.slug === slug ||
                slugify(p.name) === slug ||
                String(p.id) === slug
            );
            if (!product) {
                return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
            }
            return res.status(200).json({ success: true, data: product });
        }

        // --- Tek ürün: id ile ara ---
        if (id) {
            const product = products.find(p => String(p.id) === String(id));
            if (!product) {
                return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
            }
            return res.status(200).json({ success: true, data: product });
        }

        // --- Liste: kategori filtresi ---
        let filtered = products;
        if (category) {
            filtered = products.filter(p =>
                p.category && p.category.toLowerCase() === category.toLowerCase()
            );
        }

        // --- Limit ---
        const lim = parseInt(limit) || filtered.length;
        const data = filtered.slice(0, lim);

        res.status(200).json({ success: true, data, total: filtered.length });

    } catch (err) {
        console.error('Products API error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
