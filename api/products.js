// Vercel Serverless Function: /api/products
// data.js dosyasındaki ürünleri okuyup döndürür

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // data.js'i oku ve products dizisini çıkar
        const dataPath = path.join(process.cwd(), 'data.js');
        const raw = fs.readFileSync(dataPath, 'utf8');

        // "const products = [...];" satırından products array'ini al
        const match = raw.match(/const products\s*=\s*(\[[\s\S]*?\]);?\s*(?:if|module|$)/);
        if (!match) {
            return res.status(500).json({ success: false, error: 'products parse error' });
        }
        const products = JSON.parse(match[1]);

        // Query params
        const { category, limit, slug, id } = req.query;

        // Tek ürün sorgusu
        if (slug) {
            const product = products.find(p => {
                const productSlug = p.slug || slugify(p.name);
                return productSlug === slug;
            });
            if (!product) return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
            product.slug = product.slug || slugify(product.name);
            return res.status(200).json({ success: true, data: product });
        }

        if (id) {
            const product = products.find(p => String(p.id) === String(id));
            if (!product) return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
            product.slug = product.slug || slugify(product.name);
            return res.status(200).json({ success: true, data: product });
        }

        // Kategori filtresi
        let filtered = products;
        if (category) {
            filtered = products.filter(p =>
                p.category && p.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Slug ekle (yoksa üret)
        filtered = filtered.map(p => ({
            ...p,
            slug: p.slug || slugify(p.name)
        }));

        // Limit
        const lim = parseInt(limit) || filtered.length;
        const data = filtered.slice(0, lim);

        res.status(200).json({ success: true, data, total: filtered.length });

    } catch (err) {
        console.error('Products API error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

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
