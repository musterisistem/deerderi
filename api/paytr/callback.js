// Vercel Serverless Function: /api/paytr/callback
// PayTR ödeme sonuç bildirimi
// PayTR bu endpoint'e application/x-www-form-urlencoded POST atar, "OK" yanıtı bekler.

const crypto = require('crypto');

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'dUyJLqbxBzdy6KF9';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'JG1dH3PSwKdLJ5nY';

// Vercel serverless function handler
async function handler(req, res) {
    // Her durumda OK dönmeye hazırız — PayTR bunu bekliyor
    res.setHeader('Content-Type', 'text/plain');

    if (req.method !== 'POST') {
        return res.status(200).send('OK');
    }

    try {
        let params = {};

        // req.body zaten parse edilmişse kullan
        if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
            params = req.body;
        } else {
            // Raw stream'den oku
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf8');
            console.log('PayTR raw body:', rawBody);

            // URL-encoded parse
            for (const pair of rawBody.split('&')) {
                const eqIdx = pair.indexOf('=');
                if (eqIdx > -1) {
                    const k = decodeURIComponent(pair.slice(0, eqIdx).replace(/\+/g, ' '));
                    const v = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, ' '));
                    params[k] = v;
                }
            }
        }

        const merchant_oid = params.merchant_oid || '';
        const status       = params.status       || '';
        const total_amount = params.total_amount  || '';
        const hash         = params.hash          || '';

        console.log('PayTR callback params:', { merchant_oid, status, total_amount, hasHash: !!hash });

        if (!merchant_oid || !status || !total_amount || !hash) {
            console.warn('PayTR callback: eksik parametre');
            return res.status(200).send('OK');
        }

        // Hash doğrulama (PayTR iFrame API: merchant_oid + SALT + status + total_amount)
        const hashSTR = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
        const expectedHash = crypto
            .createHmac('sha256', PAYTR_MERCHANT_KEY)
            .update(hashSTR)
            .digest('base64');

        if (expectedHash !== hash) {
            console.error('PayTR hash uyuşmadı');
            return res.status(200).send('OK');
        }

        console.log(`PayTR ✓ Sipariş: ${merchant_oid}, Durum: ${status}`);
        return res.status(200).send('OK');

    } catch (err) {
        console.error('PayTR callback hata:', err.message);
        return res.status(200).send('OK');
    }
}

// Config: bodyParser'ı kapat ki raw stream okuyabilelim
handler.config = {
    api: { bodyParser: false }
};

module.exports = handler;
