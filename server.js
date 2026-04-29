const http = require('http');
const fs = require('fs');
const path = require('path');

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
    'kayit-ol': 'register.html',
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

    // 5.2 API: Send Email
    if (requestUrl === '/api/send-email' && request.method === 'POST') {
        return handleSendEmail(request, response);
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

// ---- GET /api/products ----
async function handleGetProducts(request, response) {
    if (!dbConnected || !Product) return dbNotReady(response);
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
    if (!dbConnected || !Product) return dbNotReady(response);
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
    if (!dbConnected || !Order || !Product) return dbNotReady(response);
    try {
        const body = await parseBody(request);

        // Basic validation
        if (!body.customer || !body.customer.name || !body.customer.email) {
            return sendJSON(response, 400, { error: 'Müşteri adı ve e-posta zorunludur' });
        }
        if (!body.shippingAddress || !body.shippingAddress.line1 || !body.shippingAddress.city) {
            return sendJSON(response, 400, { error: 'Teslimat adresi zorunludur' });
        }
        if (!body.items || body.items.length === 0) {
            return sendJSON(response, 400, { error: 'Sepet boş' });
        }

        // Validate and get fresh prices from DB
        let subtotal = 0;
        const validatedItems = [];

        for (const item of body.items) {
            const product = await Product.findById(item.productId).catch(() => null);
            if (!product) {
                // Item may not have DB ID if added from data.js, use body price
                validatedItems.push({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    image: item.image || '',
                    slug: item.slug || '',
                });
                subtotal += item.price * (item.quantity || 1);
                continue;
            }
            if (product.stock < item.quantity) {
                return sendJSON(response, 400, { error: `"${product.name}" ürünü yeterli stokta yok` });
            }
            const price = product.discountPrice || product.price;
            validatedItems.push({
                productId: product._id,
                name: product.name,
                price,
                quantity: item.quantity || 1,
                image: product.mainImage || (product.images && product.images[0] ? product.images[0].url : ''),
                slug: product.slug,
            });
            subtotal += price * (item.quantity || 1);
        }

        // Coupon discount
        let discount = 0;
        let couponCode = null;
        if (body.couponCode && Coupon) {
            const coupon = await Coupon.findOne({ code: body.couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
                    if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
                        if (subtotal >= coupon.minCartAmount) {
                            if (coupon.type === 'percent') {
                                discount = Math.round(subtotal * coupon.value / 100);
                            } else {
                                discount = coupon.value;
                            }
                            couponCode = coupon.code;
                            // Increment usage
                            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
                        }
                    }
                }
            }
        }

        // Shipping cost
        let shippingCost = 100; // default standard
        const freeShippingThreshold = 2000;
        if (body.shippingMethod === 'express') {
            shippingCost = 200;
        } else if (subtotal - discount >= freeShippingThreshold) {
            shippingCost = 0;
        }

        // If settings available, use DB values
        if (Settings) {
            const settings = await Settings.findById('main');
            if (settings) {
                if (body.shippingMethod === 'express') {
                    shippingCost = settings.shippingRates.express.price;
                } else {
                    shippingCost = subtotal - discount >= settings.freeShippingThreshold ? 0 : settings.shippingRates.standard.price;
                }
            }
        }

        const total = subtotal - discount + shippingCost;

        // Create order
        const order = new Order({
            customer: body.customer,
            shippingAddress: body.shippingAddress,
            items: validatedItems,
            subtotal,
            couponCode,
            discount,
            shippingCost,
            total,
            paymentMethod: body.paymentMethod || 'creditCard',
            paymentStatus: body.paymentMethod === 'cashOnDelivery' ? 'pending' : 'pending',
            shippingMethod: body.shippingMethod || 'standard',
            notes: body.notes || '',
        });

        await order.save();

        // Decrease stock for products from DB
        for (const item of validatedItems) {
            if (item.productId) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            }
        }

        sendJSON(response, 201, {
            success: true,
            data: {
                orderNumber: order.orderNumber,
                _id: order._id,
                total: order.total,
                createdAt: order.createdAt,
            }
        });
    } catch (err) {
        console.error('POST /api/orders error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- GET /api/orders/:orderNumber ----
async function handleGetOrder(orderNumber, response) {
    if (!dbConnected || !Order) return dbNotReady(response);
    try {
        const order = await Order.findOne({ orderNumber });
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

