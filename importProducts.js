const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Load environment variables manually
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) process.env[key.trim()] = value;
            }
        });
    }
}
loadEnvFile();

// Helper: Turkish-aware slug generator (sync with server.js)
function slugify(text) {
    if (!text) return '';
    const map = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o' };
    let result = text.toLowerCase();
    for (const k in map) result = result.replace(new RegExp(k, 'g'), map[k]);
    return result.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

async function importProducts() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI .env dosyasında bulunamadı!');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB bağlandı. Ürün aktarımı başlıyor...');

        const csvPath = path.join(__dirname, 'DeerDeri.csv');
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n');
        const headers = lines[0].split('","').map(h => h.replace(/"/g, ''));

        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            // Basic CSV parsing (splitting by "," with quotes awareness)
            const row = lines[i].split('","').map(v => v.replace(/"/g, ''));
            
            if (row.length < 13) continue;

            const name = row[12]; // Ürün Adı
            const price = parseFloat(row[2]) || 0; // Trendyol'da Satılacak Fiyat
            const stock = parseInt(row[3]) || 0; // Ürün Stok Adedi
            const description = row[13]; // Ürün Açıklaması
            const category = row[11]; // Kategori İsmi
            
            const images = [];
            for (let j = 18; j <= 25; j++) { // Görsel 1-8
                if (row[j] && row[j].trim() && row[j].startsWith('http')) {
                    images.push({ url: row[j].trim(), order: j - 18 });
                }
            }

            const mainImage = images.length > 0 ? images[0].url : '';
            const slug = slugify(name);

            await Product.findOneAndUpdate(
                { slug },
                {
                    name,
                    slug,
                    description,
                    price,
                    stock,
                    category,
                    images,
                    mainImage,
                    isActive: true,
                    isFeatured: i < 10 // İlk 10 ürünü öne çıkar
                },
                { upsert: true, new: true }
            );

            importedCount++;
            process.stdout.write(`\rAktarılan: ${importedCount}`);
        }

        console.log(`\n✅ Toplam ${importedCount} ürün başarıyla aktarıldı/güncellendi.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err);
        process.exit(1);
    }
}

importProducts();
