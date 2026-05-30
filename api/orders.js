// Vercel Serverless Function: /api/orders
// POST: Sipariş oluştur + PayTR iFrame token al

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || '630378';
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || 'dUyJLqbxBzdy6KF9';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || 'JG1dH3PSwKdLJ5nY';

function loadProducts() {
    try {
        const dataPath = path.join(process.cwd(), 'data.js');
        const raw = fs.readFileSync(dataPath, 'utf8');
        const match = raw.match(/const products\s*=\s*(\[[\s\S]*?\]);?\s*(?:if|module|\/\/|$)/m) ||
                      raw.match(/const products\s*=\s*(\[[\s\S]*\]);?\s*$/m);
        if (!match) return [];
        return JSON.parse(match[1]);
    } catch (e) {
        return [];
    }
}

function saveOrder(orderData) {
    try {
        const filePath = path.join('/tmp', 'orders.json');
        let orders = [];
        if (fs.existsSync(filePath)) {
            orders = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        orders.push(orderData);
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
    } catch (e) {
        console.error('Order save error:', e);
    }
}

function paytrGetToken(postData) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.paytr.com',
            path: '/odeme/api/get-token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'success') resolve(json.token);
                    else reject(new Error('PayTR: ' + json.reason));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    // GET: sipariş sorgula
    if (req.method === 'GET') {
        try {
            const filePath = path.join('/tmp', 'orders.json');
            const orders = fs.existsSync(filePath)
                ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
                : [];

            const orderNumber = req.query.orderNumber || req.query.id;

            // Belirli sipariş sorgusu
            if (orderNumber) {
                const order = orders.find(o => o.orderNumber === orderNumber);
                if (!order) return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
                return res.status(200).json({ success: true, data: order });
            }

            // Tüm siparişleri döndür (admin için)
            return res.status(200).json({ success: true, data: orders, count: orders.length });

        } catch (e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // POST: Sipariş oluştur
    try {
        const body = req.body;

        if (!body || !body.customer || !body.customer.name || !body.customer.email) {
            return res.status(400).json({ error: 'Müşteri adı ve e-posta zorunludur' });
        }
        if (!body.shippingAddress) {
            return res.status(400).json({ error: 'Teslimat adresi zorunludur' });
        }
        if (!body.items || body.items.length === 0) {
            return res.status(400).json({ error: 'Sepet boş' });
        }

        // Ürün validasyonu (data.js'den fiyat al)
        const products = loadProducts();
        let subtotal = 0;
        const validatedItems = body.items.map(item => {
            const product = products.find(p => String(p.id) === String(item.productId) || p.name === item.name);
            const price = product ? (product.discountPrice || product.price) : item.price;
            subtotal += price * (item.quantity || 1);
            return {
                productId: item.productId || '',
                name: product ? product.name : item.name,
                price,
                quantity: item.quantity || 1,
                image: item.image || '',
                slug: item.slug || ''
            };
        });

        // Kargo hesapla
        let shippingCost = 100;
        if (body.shippingMethod === 'express') shippingCost = 200;
        else if (subtotal >= 2000) shippingCost = 0;

        const total = subtotal + shippingCost;
        const orderNumber = 'DR' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);

        const orderData = {
            orderNumber,
            customer: body.customer,
            shippingAddress: body.shippingAddress,
            billingAddress: body.billingAddress || body.shippingAddress,
            items: validatedItems,
            subtotal,
            shippingCost,
            total,
            paymentMethod: body.paymentMethod || 'creditCard',
            paymentStatus: 'pending',
            shippingMethod: body.shippingMethod || 'standard',
            notes: body.notes || '',
            createdAt: new Date().toISOString()
        };

        saveOrder(orderData);

        const responseData = {
            orderNumber,
            _id: orderNumber,
            total,
            createdAt: orderData.createdAt
        };

        if (orderData.paymentMethod === 'creditCard' || orderData.paymentMethod === 'bankTransfer') {
            let userIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
            if (userIp.includes(',')) userIp = userIp.split(',')[0].trim();
            userIp = userIp.replace(/^::ffff:/, '');

            const ipv4Regex = /^(?!(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.))([0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!ipv4Regex.test(userIp)) {
                userIp = '95.70.196.100'; // fallback test IP
            }

            let email = (body.customer.email || '').trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (!email) {
                    email = 'test@example.com';
                } else if (!email.includes('@')) {
                    email = email + '@example.com';
                } else {
                    const parts = email.split('@');
                    const localPart = parts[0] || 'customer';
                    const domainPart = parts[1] || 'example.com';
                    email = `${localPart}@${domainPart.includes('.') ? domainPart : domainPart + '.com'}`;
                }
            }

            let user_phone = (body.customer.phone || '05000000000').replace(/\D/g, '');
            if (!user_phone || user_phone.length < 10) {
                user_phone = '05000000000';
            }

            const payment_amount = Math.round(total * 100).toString(); // Kuruş
            const currency = 'TL';
            const test_mode = process.env.PAYTR_TEST_MODE || '0'; // '1' = test, '0' = canlı

            const host = req.headers.host || '';
            const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : (req.headers['x-forwarded-proto'] || 'https');

            const shippingAddr = body.shippingAddress || {};
            const addressParts = [
                shippingAddr.line1 || shippingAddr.address || '',
                shippingAddr.district || '',
                shippingAddr.city || ''
            ].filter(Boolean);
            const user_address = addressParts.join(' ') || 'İstanbul';

            let hashSTR = '';
            let postParams = {};

            if (orderData.paymentMethod === 'creditCard') {
                const no_installment = '0';
                const max_installment = '0';
                const user_basket_arr = validatedItems.map(item => [item.name, item.price.toFixed(2), item.quantity]);
                const user_basket = Buffer.from(JSON.stringify(user_basket_arr)).toString('base64');

                // iFrame API hash sırası
                hashSTR = `${PAYTR_MERCHANT_ID}${userIp}${orderNumber}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
                const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY)
                    .update(hashSTR + PAYTR_MERCHANT_SALT)
                    .digest('base64');

                postParams = {
                    merchant_id: PAYTR_MERCHANT_ID,
                    user_ip: userIp,
                    merchant_oid: orderNumber,
                    email: email,
                    payment_amount: payment_amount,
                    paytr_token: paytr_token,
                    user_basket: user_basket,
                    debug_on: '1',
                    no_installment: no_installment,
                    max_installment: max_installment,
                    user_name: body.customer.name || 'Müşteri',
                    user_address: user_address,
                    user_phone: user_phone,
                    merchant_ok_url: `${protocol}://${host}/siparis-tamamlandi?order=${orderNumber}`,
                    merchant_fail_url: `${protocol}://${host}/odeme?error=paytr_failed`,
                    timeout_limit: '30',
                    currency: currency,
                    test_mode: test_mode,
                    lang: 'tr'
                };
            } else {
                const payment_type = 'eft';

                // Havale/EFT API hash sırası
                hashSTR = `${PAYTR_MERCHANT_ID}${userIp}${orderNumber}${email}${payment_amount}${payment_type}`;
                const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY)
                    .update(hashSTR + PAYTR_MERCHANT_SALT)
                    .digest('base64');

                postParams = {
                    merchant_id: PAYTR_MERCHANT_ID,
                    user_ip: userIp,
                    merchant_oid: orderNumber,
                    email: email,
                    payment_amount: payment_amount,
                    payment_type: payment_type,
                    paytr_token: paytr_token,
                    debug_on: '1',
                    user_name: body.customer.name || 'Müşteri',
                    user_address: user_address,
                    user_phone: user_phone,
                    merchant_ok_url: `${protocol}://${host}/siparis-tamamlandi?order=${orderNumber}`,
                    merchant_fail_url: `${protocol}://${host}/odeme?error=paytr_failed`,
                    timeout_limit: '30',
                    currency: currency,
                    test_mode: test_mode,
                    lang: 'tr'
                };
            }

            const postData = new URLSearchParams(postParams).toString();

            try {
                const iframeToken = await paytrGetToken(postData);
                responseData.iframe_token = iframeToken;
            } catch (paytrErr) {
                console.error('PayTR token error:', paytrErr.message);
                return res.status(500).json({ error: 'PayTR bağlantı hatası: ' + paytrErr.message });
            }
        }

        return res.status(201).json({ success: true, data: responseData });

    } catch (err) {
        console.error('POST /api/orders error:', err);
        return res.status(500).json({ error: err.message });
    }
};
