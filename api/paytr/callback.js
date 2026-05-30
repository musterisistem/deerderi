// Vercel Serverless Function: /api/paytr/callback
// PayTR ödeme sonuç bildirimi
// PayTR, bu endpoint'e application/x-www-form-urlencoded formatında POST atar
// ve "OK" yanıtı bekler. Canlı moda geçiş için bu yanıt şart.

const crypto = require('crypto');

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'dUyJLqbxBzdy6KF9';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'JG1dH3PSwKdLJ5nY';

// Vercel'de body parsing'i KAPATTIK — raw body'yi kendimiz okuyacağız
// (Vercel varsayılan olarak URL-encoded body'yi parse etmez,
//  bodyParser açık olsa bile sorun çıkabilir)
module.exports.config = {
    api: {
        bodyParser: false,
    },
};

// Raw body'yi okuma yardımcısı
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk.toString(); });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    // Sadece POST kabul et
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        // Raw body'yi oku ve URL-encoded'ı parse et
        const rawBody = await getRawBody(req);
        console.log('PayTR callback raw body:', rawBody);

        const params = {};
        for (const pair of rawBody.split('&')) {
            const [k, v] = pair.split('=');
            if (k) params[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' '));
        }

        const merchant_oid  = params.merchant_oid;
        const status        = params.status;
        const total_amount  = params.total_amount;
        const hash          = params.hash;

        console.log('PayTR callback params:', { merchant_oid, status, total_amount, hash: hash ? '***' : 'MISSING' });

        // Zorunlu parametre kontrolü
        if (!merchant_oid || !status || !total_amount || !hash) {
            console.error('PayTR callback: eksik parametre', { merchant_oid, status, total_amount, hash });
            // PayTR "OK" beklediği için her durumda 200 dönüyoruz
            return res.status(200).send('OK');
        }

        // Hash doğrulama (PayTR dokümantasyonu sırası)
        // https://dev.paytr.com/direkt-api/iyzico-entegrasyon
        const hashSTR = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
        const expectedHash = crypto
            .createHmac('sha256', PAYTR_MERCHANT_KEY)
            .update(hashSTR)
            .digest('base64');

        if (expectedHash !== hash) {
            console.error('PayTR callback: geçersiz hash!', { expected: expectedHash, received: hash });
            return res.status(200).send('OK');
        }

        // Ödeme başarılı mı?
        const isSuccess = status === 'success';
        console.log(`PayTR Callback ✓ - Sipariş: ${merchant_oid}, Durum: ${status}, Başarılı: ${isSuccess}`);

        // PayTR sadece "OK" yanıtı bekler
        return res.status(200).send('OK');

    } catch (err) {
        console.error('PayTR callback işleme hatası:', err);
        // Hata olsa bile "OK" dönmeliyiz ki PayTR tekrar denemesi
        return res.status(200).send('OK');
    }
};
