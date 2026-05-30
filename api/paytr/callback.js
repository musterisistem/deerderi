// Vercel Serverless Function: /api/paytr/callback (Redeploy trigger to load env variables)
// PayTR ödeme sonuç bildirimi (2. Adım)

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'dUyJLqbxBzdy6KF9';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'JG1dH3PSwKdLJ5nY';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const params = req.body;
        const merchant_oid = params.merchant_oid;
        const status = params.status;
        const total_amount = params.total_amount;
        const hash = params.hash;

        if (!merchant_oid || !status || !total_amount || !hash) {
            return res.status(400).send('PAYTR_INVALID_PARAMS');
        }

        // Hash doğrulama
        const hashSTR = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
        const expectedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY)
            .update(hashSTR)
            .digest('base64');

        if (expectedHash !== hash) {
            console.error('PayTR callback: geçersiz hash!');
            return res.status(200).send('PAYTR_INVALID');
        }

        console.log(`PayTR Callback - Sipariş: ${merchant_oid}, Durum: ${status}`);

        // Siparişi güncelle (tmp dosyasında)
        try {
            const filePath = path.join('/tmp', 'orders.json');
            if (fs.existsSync(filePath)) {
                const orders = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const idx = orders.findIndex(o => o.orderNumber === merchant_oid);
                if (idx !== -1) {
                    orders[idx].paymentStatus = status === 'success' ? 'paid' : 'failed';
                    if (status === 'success') orders[idx].orderStatus = 'processing';
                    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
                }
            }
        } catch (e) {
            console.error('Order update error:', e);
        }

        // PayTR "OK" yanıtı beklediği için
        return res.status(200).send('OK');

    } catch (err) {
        console.error('PayTR callback error:', err);
        return res.status(200).send('OK');
    }
};
