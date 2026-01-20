const http = require('http');
const fs = require('fs');
const path = require('path');

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
    'siparis-tamamlandi': 'order-complete.html'
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

    // 8. Assume it's a product slug - serve product.html
    // The product.html page will read the slug from URL and find the product
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

