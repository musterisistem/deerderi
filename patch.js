import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SERVER_JS = './server.js';
let serverContent = fs.readFileSync(SERVER_JS, 'utf8');

// 1. Add crypto and PayTR keys
if (!serverContent.includes('const PAYTR_MERCHANT_ID')) {
    serverContent = serverContent.replace(
        "const path = require('path');",
        "const path = require('path');\nconst crypto = require('crypto');\n\nconst PAYTR_MERCHANT_ID = '630378';\nconst PAYTR_MERCHANT_KEY = 'dUyJLqbxBzdy6KF9';\nconst PAYTR_MERCHANT_SALT = 'JG1dH3PSwKdLJ5nY';"
    );
}

// 2. Add PayTR Callback Route
if (!serverContent.includes('/api/paytr/callback')) {
    serverContent = serverContent.replace(
        "// 5.5 API: Google Shopping Feed",
        "// POST /api/paytr/callback\n    if (requestUrl === '/api/paytr/callback' && request.method === 'POST') {\n        return handlePaytrCallback(request, response);\n    }\n\n    // 5.5 API: Google Shopping Feed"
    );
}

// 3. Add handlePaytrCallback Function
if (!serverContent.includes('function handlePaytrCallback')) {
    const callbackFunc = `

// ---- POST /api/paytr/callback ----
function handlePaytrCallback(request, response) {
    let bodyStr = '';
    request.on('data', chunk => { bodyStr += chunk; });
    request.on('end', async () => {
        try {
            const params = new URLSearchParams(bodyStr);
            const merchant_oid = params.get('merchant_oid');
            const status = params.get('status');
            const total_amount = params.get('total_amount');
            const hash = params.get('hash');
            const failed_reason_msg = params.get('failed_reason_msg');

            if (!merchant_oid || !status || !hash) {
                response.writeHead(400);
                return response.end('Bad Request');
            }

            const hashStr = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
            const expectedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashStr).digest('base64');

            if (hash !== expectedHash) {
                response.writeHead(400);
                return response.end('Bad Hash');
            }

            const isSuccess = (status === 'success');
            const updateData = {
                paymentStatus: isSuccess ? 'paid' : 'failed',
                notes: isSuccess ? 'Ödeme PayTR ile tamamlandı.' : \`Ödeme başarısız: \${failed_reason_msg || 'Bilinmeyen hata'}\`
            };

            if (dbConnected && Order) {
                await Order.findOneAndUpdate({ orderNumber: merchant_oid }, updateData);
            } else if (fs.existsSync('./local_orders.json')) {
                let localOrders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
                const orderIndex = localOrders.findIndex(o => o.orderNumber === merchant_oid);
                if (orderIndex !== -1) {
                    localOrders[orderIndex].paymentStatus = updateData.paymentStatus;
                    localOrders[orderIndex].notes = (localOrders[orderIndex].notes || '') + '\\n' + updateData.notes;
                    fs.writeFileSync('./local_orders.json', JSON.stringify(localOrders, null, 2));
                }
            }

            response.writeHead(200);
            response.end('OK');
        } catch (e) {
            response.writeHead(500);
            response.end('Internal Server Error');
        }
    });
}
`;
    serverContent = serverContent.replace(
        "// ---- GET /api/settings ----",
        callbackFunc + "\n// ---- GET /api/settings ----"
    );
}

fs.writeFileSync(SERVER_JS, serverContent, 'utf8');
console.log('server.js updated successfully.');
