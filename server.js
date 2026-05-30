const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PAYTR_MERCHANT_ID = '630378';
const PAYTR_MERCHANT_KEY = 'dUyJLqbxBzdy6KF9';
const PAYTR_MERCHANT_SALT = 'JG1dH3PSwKdLJ5nY';

// MongoDB / Mongoose
let mongoose = null;
let dbConnected = false;
let Product, Order, Coupon, Settings;

try {
    mongoose = require('mongoose');
} catch (e) {
    console.log('⚠️ Mongoose not available, DB features disabled');
}

// Helper: Turkish-aware slug generator
function slugify(text) {
    if (!text) return '';
    const map = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o' };
    let result = text.toLowerCase();
    for (const k in map) result = result.replace(new RegExp(k, 'g'), map[k]);
    return result.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// Load environment variables from .env file
function loadEnvFile() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').trim();
                    if (key && value) {
                        process.env[key.trim()] = value;
                    }
                }
            });
        }
    } catch (err) {
        console.log('Note: .env file not found or error loading it');
    }
}
loadEnvFile();

// === DATABASE CONNECTION ===
async function connectDB() {
    if (!mongoose || !process.env.MONGODB_URI) {
        console.log('⚠️ MONGODB_URI not set - DB features disabled');
        return;
    }
    if (dbConnected) return;
    try {
        let cached = global.mongooseConn;
        if (!cached) {
            cached = global.mongooseConn = { conn: null, promise: null };
        }
        if (!cached.promise) {
            cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
        }
        cached.conn = await cached.promise;
        dbConnected = true;
        console.log('✅ MongoDB bağlandı');

        // Load models after connection
        Product = require('./models/Product');
        Order = require('./models/Order');
        Coupon = require('./models/Coupon');
        Settings = require('./models/Settings');
    } catch (err) {
        console.error('❌ MongoDB bağlantı hatası:', err.message);
    }
}
connectDB();

// Resend Mail Service (simplified for no npm install scenario)
let resendConfigured = false;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
    resendConfigured = true;
    console.log('✉️ Resend mail service configured');
} else {
    console.log('⚠️ Resend API key not configured - mail features disabled');
}

const PORT = 3000;


const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.woff2': 'font/woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.ico': 'image/x-icon'
};

// Static pages mapping (slug -> file)
const staticPages = {
    'hakkimizda': 'about.html',
    'iletisim': 'contact.html',
    'sepet': 'cart.html',
    'odeme': 'checkout.html',
    'hesabim': 'account.html',
    'kayit-ol': 'kayit.html',
    'siparis-tamamlandi': 'success.html',
    'order-complete': 'success.html',
};

// Reserved paths that should not be treated as product slugs
const reservedPaths = [
    'assets', 'css', 'js', 'images', 'fonts',
    'yonetim', 'api', 'admin',
    ...Object.keys(staticPages)
];

http.createServer(function (request, response) {
    let requestUrl = request.url.split('?')[0].split('#')[0];

    // Remove trailing slash (except for root)
    if (requestUrl !== '/' && requestUrl.endsWith('/')) {
        requestUrl = requestUrl.slice(0, -1);
    }

    console.log('Request:', requestUrl);

    // === ROUTING LOGIC ===

    // 1. Root path
    if (requestUrl === '/') {
        return serveFile('./index.html', 'text/html', response);
    }

    // 2. Admin panel
    if (requestUrl === '/yonetim') {
        return serveFile('./admin.html', 'text/html', response);
    }

    // 3. Check if it's a static file (has extension)
    const extname = path.extname(requestUrl).toLowerCase();
    if (extname) {
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        return serveFile('.' + requestUrl, contentType, response);
    }

    // 4. Static pages (e.g., /hakkimizda, /iletisim)
    const slug = requestUrl.substring(1); // Remove leading slash
    if (staticPages[slug]) {
        return serveFile('./' + staticPages[slug], 'text/html', response);
    }

    // 5. API: Image Upload (MUST BE BEFORE reserved paths check!)
    if (requestUrl === '/api/upload' && request.method === 'POST') {
        return handleImageUpload(request, response);
    }

    // ====== E-COMMERCE API ROUTES ======

    // GET /api/products — list products
    if (requestUrl === '/api/products' && request.method === 'GET') {
        return handleGetProducts(request, response);
    }

    // GET /api/products/:slug — single product
    if (requestUrl.startsWith('/api/products/') && request.method === 'GET') {
        const slug = requestUrl.replace('/api/products/', '').split('?')[0];
        if (slug && !slug.includes('/')) {
            return handleGetProduct(slug, response);
        }
    }

    // POST /api/orders — create order
    if (requestUrl === '/api/orders' && request.method === 'POST') {
        return handleCreateOrder(request, response);
    }

    // GET /api/orders/:orderNumber — get single order
    if (requestUrl.startsWith('/api/orders/') && request.method === 'GET') {
        const orderNumber = requestUrl.replace('/api/orders/', '').split('?')[0];
        if (orderNumber) return handleGetOrder(orderNumber, response);
    }

    // POST /api/coupons/validate — validate coupon
    if (requestUrl === '/api/coupons/validate' && request.method === 'POST') {
        return handleValidateCoupon(request, response);
    }

    // GET /api/settings — public settings (shipping, payment methods)
    if (requestUrl === '/api/settings' && request.method === 'GET') {
        return handleGetSettings(response);
    }

    // GET /api/categories — category list
    if (requestUrl === '/api/categories' && request.method === 'GET') {
        return handleGetCategories(response);
    }

    // ====== ADMIN API ROUTES ======

    // GET /api/admin/orders
    if (requestUrl === '/api/admin/orders' && request.method === 'GET') {
        return handleAdminGetOrders(request, response);
    }

    // PATCH /api/admin/orders/:id/status
    if (requestUrl.match(/^\/api\/admin\/orders\/[^/]+\/status$/) && request.method === 'PATCH') {
        const orderId = requestUrl.split('/')[4];
        return handleAdminUpdateOrderStatus(orderId, request, response);
    }

    // POST /api/admin/products
    if (requestUrl === '/api/admin/products' && request.method === 'POST') {
        return handleAdminCreateProduct(request, response);
    }

    // PUT /api/admin/products/:id
    if (requestUrl.startsWith('/api/admin/products/') && request.method === 'PUT') {
        const productId = requestUrl.split('/')[4];
        return handleAdminUpdateProduct(productId, request, response);
    }

    // DELETE /api/admin/products/:id
    if (requestUrl.startsWith('/api/admin/products/') && request.method === 'DELETE') {
        const productId = requestUrl.split('/')[4];
        return handleAdminDeleteProduct(productId, response);
    }

    // POST /api/admin/coupons
    if (requestUrl === '/api/admin/coupons' && request.method === 'POST') {
        return handleAdminCreateCoupon(request, response);
    }

    // GET /api/admin/coupons
    if (requestUrl === '/api/admin/coupons' && request.method === 'GET') {
        return handleAdminGetCoupons(response);
    }



    // GET /api/menu
    if (requestUrl === '/api/menu' && request.method === 'GET') {
        return handleGetMenu(response);
    }
    // POST /api/admin/menu
    if (requestUrl === '/api/admin/menu' && request.method === 'POST') {
        return handleAdminUpdateMenu(request, response);
    }

    // GET /api/campaigns
    if (requestUrl === '/api/campaigns' && request.method === 'GET') {
        return handleGetCampaigns(response);
    }

    // POST /api/admin/logo
    if (requestUrl === '/api/admin/logo' && request.method === 'POST') {
        return handleAdminUploadLogo(request, response);
    }

    // POST /api/admin/campaigns
    if (requestUrl === '/api/admin/campaigns' && request.method === 'POST') {
        return handleAdminSaveCampaigns(request, response);
    }

    // 5.2 API: Send Email
    if (requestUrl === '/api/send-email' && request.method === 'POST') {
        return handleSendEmail(request, response);
    }

    // POST /api/paytr/callback
    if (requestUrl === '/api/paytr/callback' && request.method === 'POST') {
        return handlePaytrCallback(request, response);
    }

    // 5.5 API: Google Shopping Feed
    if (requestUrl === '/feed.xml' || requestUrl === '/product-feed.xml') {
        return serveProductFeed(response);
    }


    // 6. Check if path is reserved
    const firstSegment = slug.split('/')[0];
    if (reservedPaths.includes(firstSegment)) {
        return serve404(response);
    }

    // 7. Check if it's a category page request (/kategori/slug)
    if (slug.startsWith('kategori/')) {
        const categorySlug = slug.replace('kategori/', '');
        return serveCategoryPage(categorySlug, response);
    }

    // 7.5 Check if it's a product page request (/urun/slug)
    if (slug.startsWith('urun/')) {
        const productSlug = slug.replace('urun/', '');
        return serveProductPage(productSlug, response);
    }

    // 8. Assume it's a direct product slug or page - serve product.html
    return serveProductPage(slug, response);

}).listen(PORT);

function serveFile(filePath, contentType, response) {
    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                serve404(response);
            } else {
                response.writeHead(500);
                response.end('Server Error: ' + error.code);
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}

function serveProductPage(slug, response) {
    // Serve product.html with the slug embedded
    fs.readFile('./product.html', 'utf-8', function (error, content) {
        if (error) {
            serve404(response);
            return;
        }

        // Inject the slug as a JavaScript variable before </head>
        const slugScript = `
        <script>
            window.PRODUCT_SLUG = '${slug}';
        </script>
        `;

        const modifiedContent = content.replace('</head>', slugScript + '</head>');

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(modifiedContent, 'utf-8');
    });
}

function serveCategoryPage(slug, response) {
    // Serve category.html with the slug embedded
    fs.readFile('./category.html', 'utf-8', function (error, content) {
        if (error) {
            // Fallback if category.html doesn't exist yet, for dev simplicity
            console.log('category.html not found, serving 404');
            serve404(response);
            return;
        }

        // Inject the slug as a JavaScript variable before </head>
        const slugScript = `
        <script>
            window.CATEGORY_SLUG = '${slug}';
        </script>
        `;

        const modifiedContent = content.replace('</head>', slugScript + '</head>');

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(modifiedContent, 'utf-8');
    });
}

function serve404(response) {
    fs.readFile('./404.html', function (error, content) {
        if (error) {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end('<h1>404 - Sayfa Bulunamadı</h1>', 'utf-8');
        } else {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
        }
    });
}

console.log(`
╔════════════════════════════════════════════════════╗
║     DEER DERİ - Development Server                 ║
╠════════════════════════════════════════════════════╣
║  🌐 http://localhost:${PORT}                         ║
║  🔧 Admin: http://localhost:${PORT}/yonetim           ║
╠════════════════════════════════════════════════════╣
║  SEO-Friendly URLs:                                ║
║  • Products: /urun-slug                            ║
║  • Pages: /sayfa-ismi                              ║
╚════════════════════════════════════════════════════╝
`);

function handleImageUpload(request, response) {
    let body = '';
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

    request.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_SIZE) {
            response.writeHead(413, { 'Content-Type': 'text/plain' });
            response.end('File too large');
            request.destroy();
        }
    });

    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.image || !data.image.includes('base64')) {
                throw new Error('Invalid image data');
            }

            const base64Data = data.image.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // Extract extension
            let fileExtension = 'jpg';
            if (data.image.startsWith('data:image/')) {
                const mime = data.image.substring(5, data.image.indexOf(';'));
                if (mime === 'image/png') fileExtension = 'png';
                else if (mime === 'image/jpeg') fileExtension = 'jpg';
                else if (mime === 'image/gif') fileExtension = 'gif';
                else if (mime === 'image/webp') fileExtension = 'webp';
            }

            const filename = 'upload-' + Date.now() + '-' + Math.floor(Math.random() * 1000) + '.' + fileExtension;
            const uploadDir = path.join(__dirname, 'assets', 'uploads');

            // Ensure directory exists
            if (!fs.exists(uploadDir, (exists) => {
                if (!exists) fs.mkdir(uploadDir, { recursive: true }, () => { });
            })); // Async check but we are inside async handler so it is okayish, lets use sync for safety in this simple script
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, filename);
            const publicUrl = '/assets/uploads/' + filename;

            fs.writeFile(filePath, imageBuffer, (err) => {
                if (err) {
                    console.error('Upload Error:', err);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, error: 'Write failed' }));
                    return;
                }
                console.log('File uploaded:', publicUrl);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: true, url: publicUrl }));
            });
        } catch (e) {
            console.error('Parse Error:', e);
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, error: 'Invalid JSON or Request' }));
        }
    });
}

function serveProductFeed(response) {
    // Read data.js to get products (or you could read from a JSON file)
    fs.readFile('./data.js', 'utf-8', (err, data) => {
        if (err) {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Error reading products');
            return;
        }

        // Extract products array from data.js
        // data.js should have: const products = [...]
        const match = data.match(/const\s+products\s*=\s*(\[[\s\S]*?\]);/);

        let products = [];
        if (match && match[1]) {
            try {
                products = eval(match[1]); // Using eval for simplicity, be careful in production
            } catch (e) {
                console.error('Error parsing products:', e);
            }
        }

        // Generate Google Shopping XML Feed (RSS 2.0 format)
        const baseUrl = `http://localhost:${PORT}`;
        const now = new Date().toUTCString();

        let xmlItems = '';
        products.forEach(product => {
            const productUrl = `${baseUrl}/urun-${slugify(product.name)}`;
            const imageUrl = product.images && product.images[0] ? product.images[0] : product.image || '';
            const description = escapeXml(product.description || `${product.name} - El yapımı hakiki deri ürün`);
            const title = escapeXml(product.name);
            const price = `${product.price} TRY`;
            const category = escapeXml(product.category || 'Genel');

            xmlItems += `
        <item>
            <g:id>DR-${product.id}</g:id>
            <g:title>${title}</g:title>
            <g:description>${description}</g:description>
            <g:link>${productUrl}</g:link>
            <g:image_link>${imageUrl}</g:image_link>
            <g:condition>new</g:condition>
            <g:availability>in stock</g:availability>
            <g:price>${price}</g:price>
            <g:brand>DEER DERI</g:brand>
            <g:google_product_category>Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases</g:google_product_category>
            <g:product_type>${category}</g:product_type>
            <g:shipping>
                <g:country>TR</g:country>
                <g:service>Standard</g:service>
                <g:price>0 TRY</g:price>
            </g:shipping>
        </item>`;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
    <channel>
        <title>DEER DERI - Ürün Katalogu</title>
        <link>${baseUrl}</link>
        <description>DEER DERI - Hakiki Deri Çanta, Cüzdan ve Aksesuar Ürünleri</description>
        <lastBuildDate>${now}</lastBuildDate>
        ${xmlItems}
    </channel>
</rss>`;

        response.writeHead(200, {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        });
        response.end(xml);
    });
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function slugify(text) {
    if (!text) return '';
    const trMap = {
        'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
    };
    let result = text.toLowerCase();
    for (let key in trMap) {
        result = result.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return result
        .replace(/[^-a-zA-Z0-9\s]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ===== MAIL SYSTEM =====

// Handle Send Email API
function handleSendEmail(request, response) {
    if (!resendConfigured) {
        response.writeHead(503, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            success: false,
            error: 'Mail service not configured'
        }));
        return;
    }

    let body = '';
    request.on('data', chunk => {
        body += chunk;
    });

    request.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const { type, to, data: templateData } = data;

            if (!type || !to) {
                throw new Error('Missing required fields: type, to');
            }

            // Send email via Resend
            const result = await sendEmail(type, to, templateData);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                success: true,
                messageId: result.id
            }));
        } catch (err) {
            console.error('Send Email Error:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                success: false,
                error: err.message
            }));
        }
    });
}

// Send email using Resend API
async function sendEmail(type, to, templateData) {
    const templates = {
        'welcome': {
            subject: 'Hoş Geldiniz - DEER DERİ',
            template: 'welcome.html'
        },
        'order-confirmation': {
            subject: 'Siparişiniz Alındı #' + (templateData.orderNumber || ''),
            template: 'order-confirmation.html'
        },
        'admin-notification': {
            subject: '🔔 Yeni Sipariş - #' + (templateData.orderNumber || ''),
            template: 'admin-notification.html'
        }
    };

    const emailConfig = templates[type];
    if (!emailConfig) {
        throw new Error('Invalid email type: ' + type);
    }

    // Render HTML template
    console.log(`📧 [MAIL] Template Hazırlanıyor: ${emailConfig.template} -> Alıcı: ${to}`);
    const html = renderEmailTemplate(emailConfig.template, templateData);

    // Send via Resend (using https request since we don't have npm package)
    const emailData = {
        from: `${process.env.RESEND_FROM_NAME || 'DEER DERİ'} <${process.env.RESEND_FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject: emailConfig.subject,
        html: html
    };

    return await callResendAPI(emailData);
}

// Call Resend API without npm package
function callResendAPI(emailData) {
    return new Promise((resolve, reject) => {
        const https = require('https');
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

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({ id: 'unknown' });
                    }
                } else {
                    reject(new Error(`Resend API error: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

// Render email template with data
function renderEmailTemplate(templateName, data) {
    const templatePath = path.join(__dirname, 'email-templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf8');

    // Simple template engine - replace {{variable}} and handle {{#array}} loops
    // Replace simple variables
    html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });

    // Handle product loop for order emails
    if (data.products && Array.isArray(data.products)) {
        const productLoopRegex = /\{\{#products\}\}([\s\S]*?)\{\{\/products\}\}/g;
        html = html.replace(productLoopRegex, (match, template) => {
            return data.products.map(product => {
                let productHtml = template;
                productHtml = productHtml.replace(/\{\{(\w+)\}\}/g, (m, key) => {
                    return product[key] !== undefined ? product[key] : m;
                });
                return productHtml;
            }).join('');
        });
    }

    return html;
}

// ============================================================
// === E-COMMERCE API HANDLER FUNCTIONS =======================
// ============================================================

// Helper: parse JSON body from request
function parseBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Geçersiz JSON'));
            }
        });
        request.on('error', reject);
    });
}

// Helper: send JSON response
function sendJSON(response, statusCode, data) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    response.end(JSON.stringify(data));
}

// Helper: DB not ready response
function dbNotReady(response) {
    sendJSON(response, 503, { error: 'Veritabanı bağlantısı yok. MONGODB_URI .env dosyasında tanımlı olmalıdır.' });
}

// Helper: Get static products from data.js (Fallback)
async function getStaticProductsFromDataJS() {
    return new Promise((resolve) => {
        fs.readFile('./data.js', 'utf-8', (err, data) => {
            if (err) return resolve([]);
            const match = data.match(/const\s+products\s*=\s*(\[[\s\S]*?\]);/);
            let products = [];
            if (match && match[1]) {
                try {
                    products = eval(match[1]);
                    products = products.map(p => ({
                        _id: p.id,
                        name: p.name,
                        slug: slugify(p.name),
                        price: p.oldPrice || p.price,
                        discountPrice: p.oldPrice ? p.price : null,
                        stock: 100,
                        mainImage: p.images && p.images[0] ? p.images[0] : '/assets/no-image.png',
                        images: p.images || [],
                        category: p.category,
                        brand: 'DEER DERİ',
                        isFeatured: true,
                        rating: p.rating || 5,
                        reviewCount: Math.floor(Math.random() * 50) + 10,
                        shortDescription: p.description ? p.description.substring(0, 100) : '',
                        description: p.description
                    }));
                } catch (e) {}
            }
            resolve(products);
        });
    });
}

// ---- GET /api/products ----
async function handleGetProducts(request, response) {
    const reqUrl = new URL('http://localhost' + request.url);
    const reqSlug = reqUrl.searchParams.get('slug');
    if (reqSlug) return handleGetProduct(reqSlug, response);

    if (!dbConnected || !Product) {
        try {
            const url = new URL('http://localhost' + request.url);
            let category = url.searchParams.get('category');
            const limit = parseInt(url.searchParams.get('limit')) || 24;
            
            let staticProducts = await getStaticProductsFromDataJS();
            if (category) {
                // Map frontend categories to data.js categories
                if (category.toLowerCase() === 'cüzdan') category = 'cuzdan';
                if (category.toLowerCase() === 'çanta') category = 'canta';
                if (category.toLowerCase() === 'kartlık') category = 'kartlik';
                
                staticProducts = staticProducts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
            }
            
            return sendJSON(response, 200, {
                success: true,
                data: staticProducts.slice(0, limit),
                pagination: { page: 1, limit, total: staticProducts.length, pages: 1 }
            });
        } catch (e) {
            return dbNotReady(response);
        }
    }
    try {
        const url = new URL('http://localhost' + request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 24;
        const category = url.searchParams.get('category');
        const featured = url.searchParams.get('featured');
        const search = url.searchParams.get('search');
        const sort = url.searchParams.get('sort') || 'newest';

        const query = { isActive: true };
        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { shortDescription: { $regex: search, $options: 'i' } }
        ];

        const sortMap = {
            newest: { createdAt: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating: { rating: -1 }
        };
        const sortObj = sortMap[sort] || { createdAt: -1 };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .select('name slug price discountPrice stock mainImage images category brand isFeatured rating reviewCount shortDescription');

        sendJSON(response, 200, {
            success: true,
            data: products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        console.error('GET /api/products error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- GET /api/products/:slug ----
async function handleGetProduct(slug, response) {
    if (!dbConnected || !Product) {
        try {
            const staticProducts = await getStaticProductsFromDataJS();
            const product = staticProducts.find(p => p.slug === slug || slugify(p.name) === slug);
            if (!product) return sendJSON(response, 404, { error: 'Ürün bulunamadı' });
            return sendJSON(response, 200, { success: true, data: product });
        } catch (e) {
            return dbNotReady(response);
        }
    }
    try {
        const product = await Product.findOne({ slug, isActive: true });
        if (!product) return sendJSON(response, 404, { error: 'Ürün bulunamadı' });
        sendJSON(response, 200, { success: true, data: product });
    } catch (err) {
        console.error('GET /api/products/:slug error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- POST /api/orders ----
async function handleCreateOrder(request, response) {
    try {
        const body = await parseBody(request);

        // Basic validation
        if (!body.customer || !body.customer.name || !body.customer.email) {
            return sendJSON(response, 400, { error: 'Müşteri adı ve e-posta zorunludur' });
        }
        if (!body.shippingAddress) {
            return sendJSON(response, 400, { error: 'Teslimat adresi zorunludur' });
        }
        if (!body.items || body.items.length === 0) {
            return sendJSON(response, 400, { error: 'Sepet boş' });
        }

        let subtotal = 0;
        const validatedItems = [];

        // Validate items
        for (const item of body.items) {
            let price = item.price;
            let product = null;
            if (dbConnected && Product) {
                product = await Product.findById(item.productId).catch(() => null);
                if (product) {
                    if (product.stock < item.quantity) {
                        return sendJSON(response, 400, { error: `"${product.name}" ürünü yeterli stokta yok` });
                    }
                    price = product.discountPrice || product.price;
                }
            }
            validatedItems.push({
                productId: product ? product._id : (item.productId || ''),
                name: product ? product.name : item.name,
                price,
                quantity: item.quantity || 1,
                image: product ? (product.mainImage || (product.images && product.images[0] ? product.images[0].url : '')) : (item.image || ''),
                slug: product ? product.slug : (item.slug || ''),
            });
            subtotal += price * (item.quantity || 1);
        }

        // Shipping cost
        let shippingCost = 100; // default standard
        const freeShippingThreshold = 2000;
        if (body.shippingMethod === 'express') {
            shippingCost = 200;
        } else if (subtotal >= freeShippingThreshold) {
            shippingCost = 0;
        }

        const total = subtotal + shippingCost;
        const orderNumber = 'DR' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

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

        if (dbConnected && Order) {
            const order = new Order(orderData);
            await order.save();
            
            // Decrease stock
            for (const item of validatedItems) {
                if (item.productId && Product) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
                }
            }
        } else {
            // Local fallback
            let localOrders = [];
            if (fs.existsSync('./local_orders.json')) {
                localOrders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
            }
            orderData._id = orderNumber;
            localOrders.push(orderData);
            fs.writeFileSync('./local_orders.json', JSON.stringify(localOrders, null, 2));
        }

        const responseData = {
            orderNumber: orderNumber,
            _id: orderData._id || orderNumber,
            total: total,
            createdAt: orderData.createdAt,
        };

        if (orderData.paymentMethod === 'creditCard' || orderData.paymentMethod === 'bankTransfer') {
            let userIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress || '127.0.0.1';
            if (userIp.includes(',')) userIp = userIp.split(',')[0].trim();
            userIp = userIp.replace(/^::ffff:/, '');

            const ipv4Regex = /^(?!(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.))([0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!ipv4Regex.test(userIp)) {
                userIp = '95.70.196.100'; // fallback test IP
            }

            let email = (orderData.customer.email || '').trim();
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

            let user_phone = (orderData.customer.phone || '05000000000').replace(/\D/g, '');
            if (!user_phone || user_phone.length < 10) {
                user_phone = '05000000000';
            }

            const payment_amount = Math.round(total * 100).toString();
            const currency = 'TL';
            const test_mode = '1'; // Test modda dene, canlıya geçince 0 yap

            const host = request.headers.host || '';
            const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : (request.headers['x-forwarded-proto'] || 'https');

            const shippingAddr = orderData.shippingAddress || {};
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

                // iFrame API hash sırası: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
                hashSTR = `${PAYTR_MERCHANT_ID}${userIp}${orderNumber}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
                const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashSTR + PAYTR_MERCHANT_SALT).digest('base64');

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
                    user_name: orderData.customer.name || 'Müşteri',
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

                // Havale/EFT API hash sırası: merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type
                hashSTR = `${PAYTR_MERCHANT_ID}${userIp}${orderNumber}${email}${payment_amount}${payment_type}`;
                const paytr_token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashSTR + PAYTR_MERCHANT_SALT).digest('base64');

                postParams = {
                    merchant_id: PAYTR_MERCHANT_ID,
                    user_ip: userIp,
                    merchant_oid: orderNumber,
                    email: email,
                    payment_amount: payment_amount,
                    payment_type: payment_type,
                    paytr_token: paytr_token,
                    debug_on: '1',
                    user_name: orderData.customer.name || 'Müşteri',
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

            // PayTR'ye server-side token isteği yap
            console.log('--- PAYTR REQUEST DETAILS ---');
            console.log('postData:', postData);
            console.log('hashSTR:', hashSTR);
            console.log('userIp:', userIp);
            console.log('email:', email);
            console.log('payment_amount:', payment_amount);
            console.log('user_name:', orderData.customer.name);
            console.log('user_address:', user_address);
            console.log('-----------------------------');

            const iframeToken = await new Promise((resolve, reject) => {
                const https = require('https');
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
                        console.log('--- PAYTR RESPONSE ---');
                        console.log('Status:', res.statusCode);
                        console.log('Body:', data);
                        console.log('----------------------');
                        try {
                            const json = JSON.parse(data);
                            if (json.status === 'success') resolve(json.token);
                            else reject(new Error('PayTR token hatası: ' + json.reason));
                        } catch (e) { reject(e); }
                    });
                });
                req.on('error', reject);
                req.write(postData);
                req.end();
            });

            responseData.iframe_token = iframeToken;
        }

        sendJSON(response, 201, {
            success: true,
            data: responseData
        });
    } catch (err) {
        console.error('POST /api/orders error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- GET /api/orders/:orderNumber ----
async function handleGetOrder(orderNumber, response) {
    try {
        let order = null;
        if (dbConnected && Order) {
            order = await Order.findOne({ orderNumber });
        } else {
            if (fs.existsSync('./local_orders.json')) {
                const localOrders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
                order = localOrders.find(o => o.orderNumber === orderNumber);
            }
        }

        if (!order) return sendJSON(response, 404, { error: 'Sipariş bulunamadı' });
        sendJSON(response, 200, { success: true, data: order });
    } catch (err) {
        console.error('GET /api/orders/:id error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- POST /api/coupons/validate ----
async function handleValidateCoupon(request, response) {
    if (!dbConnected || !Coupon) return dbNotReady(response);
    try {
        const body = await parseBody(request);
        const code = (body.code || '').toUpperCase().trim();
        const cartTotal = parseFloat(body.cartTotal) || 0;

        if (!code) return sendJSON(response, 400, { error: 'Kupon kodu gerekli' });

        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) return sendJSON(response, 404, { error: 'Kupon bulunamadı veya aktif değil' });

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return sendJSON(response, 400, { error: 'Kupon süresi dolmuş' });
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return sendJSON(response, 400, { error: 'Kupon kullanım limiti dolmuş' });
        }
        if (cartTotal < coupon.minCartAmount) {
            return sendJSON(response, 400, {
                error: `Bu kupon için minimum sepet tutarı ${coupon.minCartAmount.toLocaleString('tr-TR')}₺`
            });
        }

        const discount = coupon.type === 'percent'
            ? Math.round(cartTotal * coupon.value / 100)
            : coupon.value;

        sendJSON(response, 200, {
            success: true,
            data: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discount,
            }
        });
    } catch (err) {
        console.error('POST /api/coupons/validate error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}



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
                notes: isSuccess ? 'Ödeme PayTR ile tamamlandı.' : `Ödeme başarısız: ${failed_reason_msg || 'Bilinmeyen hata'}`
            };

            if (dbConnected && Order) {
                await Order.findOneAndUpdate({ orderNumber: merchant_oid }, updateData);
            } else if (fs.existsSync('./local_orders.json')) {
                let localOrders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
                const orderIndex = localOrders.findIndex(o => o.orderNumber === merchant_oid);
                if (orderIndex !== -1) {
                    localOrders[orderIndex].paymentStatus = updateData.paymentStatus;
                    localOrders[orderIndex].notes = (localOrders[orderIndex].notes || '') + '\n' + updateData.notes;
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

// ---- GET /api/settings ----
async function handleGetSettings(response) {
    // Return defaults even if not connected
    const defaults = {
        freeShippingThreshold: 2000,
        shippingRates: {
            standard: { price: 100, days: '2-3' },
            express: { price: 200, days: '1' },
        },
        paymentMethods: { creditCard: true, cashOnDelivery: true },
    };

    if (!dbConnected || !Settings) {
        return sendJSON(response, 200, { success: true, data: defaults });
    }
    try {
        const settings = await Settings.findById('main');
        sendJSON(response, 200, { success: true, data: settings || defaults });
    } catch (err) {
        sendJSON(response, 200, { success: true, data: defaults });
    }
}

// ---- GET /api/categories ----
async function handleGetCategories(response) {
    // Return static list if no DB connection
    const staticCategories = [
        { slug: 'cuzdan', name: 'Cüzdan' },
        { slug: 'canta', name: 'Çanta' },
        { slug: 'kartlik', name: 'Kartlık' },
        { slug: 'kemer', name: 'Kemer' },
        { slug: 'aksesuar', name: 'Aksesuar' },
    ];
    sendJSON(response, 200, { success: true, data: staticCategories });
}

// ---- ADMIN: GET /api/admin/orders ----
async function handleAdminGetOrders(request, response) {
    if (!dbConnected || !Order) return dbNotReady(response);
    try {
        const url = new URL('http://localhost' + request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = 20;
        const status = url.searchParams.get('status');
        const search = url.searchParams.get('search');

        const query = {};
        if (status) query.orderStatus = status;
        if (search) query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'customer.name': { $regex: search, $options: 'i' } },
            { 'customer.email': { $regex: search, $options: 'i' } },
        ];

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        sendJSON(response, 200, {
            success: true,
            data: orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- ADMIN: PATCH /api/admin/orders/:id/status ----
async function handleAdminUpdateOrderStatus(orderId, request, response) {
    if (!dbConnected || !Order) return dbNotReady(response);
    try {
        const body = await parseBody(request);
        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: body.status, ...(body.trackingNumber && { trackingNumber: body.trackingNumber }) },
            { new: true }
        );
        if (!order) return sendJSON(response, 404, { error: 'Sipariş bulunamadı' });
        sendJSON(response, 200, { success: true, data: order });
    } catch (err) {
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- ADMIN: POST /api/admin/products ----
async function handleAdminCreateProduct(request, response) {
    if (!dbConnected || !Product) return dbNotReady(response);
    try {
        const body = await parseBody(request);
        if (!body.name || !body.price) {
            return sendJSON(response, 400, { error: 'Ürün adı ve fiyat zorunludur' });
        }
        // Auto-generate slug if not provided
        if (!body.slug) {
            body.slug = slugify(body.name) + '-' + Date.now();
        }
        const product = new Product(body);
        await product.save();
        sendJSON(response, 201, { success: true, data: product });
    } catch (err) {
        if (err.code === 11000) {
            return sendJSON(response, 400, { error: 'Bu slug zaten kullanılıyor' });
        }
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- ADMIN: PUT /api/admin/products/:id ----
async function handleAdminUpdateProduct(productId, request, response) {
    if (!dbConnected || !Product) return dbNotReady(response);
    try {
        const body = await parseBody(request);
        const product = await Product.findByIdAndUpdate(productId, { ...body, updatedAt: new Date() }, { new: true });
        if (!product) return sendJSON(response, 404, { error: 'Ürün bulunamadı' });
        sendJSON(response, 200, { success: true, data: product });
    } catch (err) {
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- ADMIN: DELETE /api/admin/products/:id ----
async function handleAdminDeleteProduct(productId, response) {
    if (!dbConnected || !Product) return dbNotReady(response);
    try {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) return sendJSON(response, 404, { error: 'Ürün bulunamadı' });
        sendJSON(response, 200, { success: true, message: 'Ürün silindi' });
    } catch (err) {
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- ADMIN: POST /api/admin/coupons ----
async function handleAdminCreateCoupon(request, response) {
    if (!dbConnected || !Coupon) return dbNotReady(response);
    try {
        const body = await parseBody(request);
        const coupon = new Coupon({
            code: (body.code || '').toUpperCase(),
            type: body.type || 'percent',
            value: body.value || 10,
            minCartAmount: body.minCartAmount || 0,
            usageLimit: body.usageLimit || null,
            expiresAt: body.expiresAt || null,
            isActive: body.isActive !== false,
        });
        await coupon.save();
        sendJSON(response, 201, { success: true, data: coupon });
    } catch (err) {
        if (err.code === 11000) {
            return sendJSON(response, 400, { error: 'Bu kupon kodu zaten kullanılıyor' });
        }
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- ADMIN: GET /api/admin/coupons ----
async function handleAdminGetCoupons(response) {
    if (!dbConnected || !Coupon) return dbNotReady(response);
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        sendJSON(response, 200, { success: true, data: coupons });
    } catch (err) {
        sendJSON(response, 500, { error: err.message });
    }
}



// CAMPAIGNS API
function handleGetCampaigns(response) {
    const fs = require('fs');
    fs.readFile('./campaigns.json', 'utf8', (err, data) => {
        let campaigns = [];
        if (!err) {
            try { campaigns = JSON.parse(data); } catch(e){}
        } else {
            // Default campaigns if file doesn't exist
            campaigns = [
                { id: 1, text: 'ANNELER GÜNÜ KOLEKSİYONU YAYINDA!', icon: 'gift', color: '#e83e8c', link: '#' },
                { id: 2, text: 'SEZON SONU İNDİRİM FIRSATLARI!', icon: 'tag', color: '#fd7e14', link: '#' },
                { id: 3, text: '2. GÖZLÜKTE NET %50 İNDİRİM!', icon: 'eye', color: '#17a2b8', link: '#' },
                { id: 4, text: '2000₺ VE ÜZERİ ÜCRETSİZ KARGO!', icon: 'truck', color: '#28a745', link: '#' },
                { id: 5, text: 'YENİ SEZON ÜRÜNLERİ KEŞFEDİN!', icon: 'star', color: '#ffc107', link: '#' }
            ];
        }
        sendJSON(response, 200, { success: true, data: campaigns });
    });
}

async function handleAdminSaveCampaigns(request, response) {
    const fs = require('fs');
    try {
        const data = await parseBody(request);
        if (data.campaigns && Array.isArray(data.campaigns)) {
            if(data.campaigns.length > 6) {
                return sendJSON(response, 400, { success: false, error: 'En fazla 6 kampanya eklenebilir.' });
            }
            fs.writeFile('./campaigns.json', JSON.stringify(data.campaigns, null, 2), (err) => {
                if(err) return sendJSON(response, 500, { success: false, error: 'Kaydedilemedi' });
                sendJSON(response, 200, { success: true });
            });
        } else {
            sendJSON(response, 400, { success: false, error: 'Geçersiz veri' });
        }
    } catch(e) {
        sendJSON(response, 500, { success: false, error: e.message });
    }
}


// UPLOAD LOGO API
function handleAdminUploadLogo(request, response) {
    let body = '';
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

    request.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_SIZE) {
            sendJSON(response, 413, { success: false, error: 'File too large' });
            request.destroy();
        }
    });

    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.image || !data.image.includes('base64')) {
                throw new Error('Invalid image data');
            }

            const base64Data = data.image.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            const fs = require('fs');
            fs.writeFileSync('./assets/logo.png', imageBuffer);

            sendJSON(response, 200, { success: true, url: '/assets/logo.png?v=' + Date.now() });
        } catch (error) {
            console.error('Logo upload error:', error);
            sendJSON(response, 500, { success: false, error: error.message });
        }
    });
}


// MENU API
function handleGetMenu(response) {
    try {
        let menuItems = [];
        const fs = require('fs');
        if (fs.existsSync('./menu.json')) {
            menuItems = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));
        } else {
            // Defaults
            menuItems = [
                { id: 1, text: 'ANA SAYFA', url: '/', icon: '', color: '' },
                { id: 2, text: 'CÜZDANLAR', url: '/kategori/cuzdan', icon: '', color: '' },
                { id: 3, text: 'ÇANTALAR', url: '/kategori/canta', icon: '', color: '' },
                { id: 4, text: 'GÖZLÜKLER', url: '/kategori/gozluk', icon: '', color: '' },
                { id: 5, text: 'ŞAPKALAR', url: '/kategori/sapka', icon: '', color: '' },
                { id: 6, text: 'AKSESUAR', url: '/kategori/aksesuar', icon: '', color: '' },
                { id: 7, text: 'KEMER', url: '/kategori/kemer', icon: '', color: '' },
                { id: 8, text: 'İNDİRİM FIRSATI! 🔥', url: '/indirim', icon: 'fire', color: '#ff0000' },
                { id: 9, text: 'İLETİŞİM', url: '/iletisim', icon: '', color: '' }
            ];
            fs.writeFileSync('./menu.json', JSON.stringify(menuItems, null, 2));
        }
        sendJSON(response, 200, { success: true, data: menuItems });
    } catch (e) {
        sendJSON(response, 500, { success: false, error: e.message });
    }
}

function handleAdminUpdateMenu(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk;
    });
    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.menu || !Array.isArray(data.menu)) {
                return sendJSON(response, 400, { success: false, error: 'Invalid menu data' });
            }
            const fs = require('fs');
            fs.writeFileSync('./menu.json', JSON.stringify(data.menu, null, 2));
            sendJSON(response, 200, { success: true });
        } catch (error) {
            sendJSON(response, 500, { success: false, error: error.message });
        }
    });
}

// ---- POST /api/paytr/callback ----
async function handlePaytrCallback(request, response) {
    try {
        const https = require('https');
        let body = '';
        request.on('data', chunk => body += chunk);
        request.on('end', async () => {
            try {
                const params = new URLSearchParams(body);
                const merchant_oid = params.get('merchant_oid');
                const status = params.get('status');
                const total_amount = params.get('total_amount');
                const hash = params.get('hash');

                // Hash doğrulama
                const hashSTR = merchant_oid + PAYTR_MERCHANT_SALT + status + total_amount;
                const expectedHash = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(hashSTR).digest('base64');

                if (expectedHash !== hash) {
                    console.error('PayTR callback: geçersiz hash!');
                    return response.end('PAYTR_INVALID');
                }

                console.log(`PayTR Callback - Sipariş: ${merchant_oid}, Durum: ${status}`);

                if (status === 'success') {
                    // Siparişi onayla
                    if (dbConnected && Order) {
                        await Order.findOneAndUpdate(
                            { orderNumber: merchant_oid },
                            { paymentStatus: 'paid', orderStatus: 'processing' }
                        );
                    } else {
                        // local JSON fallback
                        if (fs.existsSync('./local_orders.json')) {
                            const orders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
                            const idx = orders.findIndex(o => o.orderNumber === merchant_oid);
                            if (idx !== -1) {
                                orders[idx].paymentStatus = 'paid';
                                orders[idx].orderStatus = 'processing';
                                fs.writeFileSync('./local_orders.json', JSON.stringify(orders, null, 2));
                            }
                        }
                    }
                } else {
                    // Ödeme başarısız
                    if (dbConnected && Order) {
                        await Order.findOneAndUpdate(
                            { orderNumber: merchant_oid },
                            { paymentStatus: 'failed' }
                        );
                    }
                }

                response.end('OK');
            } catch (e) {
                console.error('PayTR callback error:', e);
                response.end('OK');
            }
        });
    } catch (err) {
        console.error('handlePaytrCallback error:', err);
        response.end('OK');
    }
}
