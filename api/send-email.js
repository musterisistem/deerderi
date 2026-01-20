
const https = require('https');
const templates = require('../lib/templates');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method Not Allowed' });
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ success: false, error: 'RESEND_API_KEY is missing' });
    }

    try {
        const { type, to, data: templateData } = req.body;

        if (!type || !to) {
            throw new Error('Missing required fields: type, to');
        }

        // Get template string
        const templateHtml = templates[type];
        if (!templateHtml) {
            throw new Error('Invalid email type: ' + type);
        }

        // Render template
        const html = renderEmailTemplate(templateHtml, templateData);

        const emailData = {
            from: 'DEER DERİ <onboarding@resend.dev>', // Should be updated with verified domain later
            to: Array.isArray(to) ? to : [to],
            // Dynamic Subject map
            subject: getSubject(type, templateData),
            html: html
        };

        // Send Email
        const result = await callResendAPI(emailData);

        res.status(200).json({ success: true, messageId: result.id });

    } catch (error) {
        console.error('Mail Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

function getSubject(type, data) {
    const subjects = {
        'welcome': 'Hoş Geldiniz - DEER DERİ',
        'order-confirmation': 'Siparişiniz Alındı #' + (data.orderNumber || ''),
        'admin-notification': '🔔 Yeni Sipariş - #' + (data.orderNumber || '')
    };
    return subjects[type] || 'Bildirim';
}

function renderEmailTemplate(html, data) {
    // Simple template engine replacement
    let rendered = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });

    // Handle product loop
    if (data.products && Array.isArray(data.products)) {
        const productLoopRegex = /\{\{#products\}\}([\s\S]*?)\{\{\/products\}\}/g;
        rendered = rendered.replace(productLoopRegex, (match, template) => {
            return data.products.map(product => {
                let productHtml = template;
                productHtml = productHtml.replace(/\{\{(\w+)\}\}/g, (m, key) => {
                    return product[key] !== undefined ? product[key] : m;
                });
                return productHtml;
            }).join('');
        });
    }

    return rendered;
}

function callResendAPI(emailData) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(emailData);
        const options = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve({ id: 'unknown' }); }
                } else {
                    reject(new Error(`Resend API error: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}
