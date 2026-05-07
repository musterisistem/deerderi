const fs = require('fs');

// =====================================================================
// HELPER: Shared header/footer HTML blocks
// =====================================================================
const headerHTML = `
    <!-- V6 GLOBAL HEADER (auto-injected) -->
    <div class="v6-top-bar">
        <div class="v6-top-bar-container v6-marquee-container">
            <div class="v6-marquee">
                <span class="v6-marquee-item"><i class="fa-solid fa-gift" style="color: #e83e8c;"></i> ANNELER GÜNÜ KOLEKSİYONU YAYINDA!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-tags" style="color: #fd7e14;"></i> SEZON SONU İNDİRİM FIRSATLARI!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-glasses" style="color: #17a2b8;"></i> 2. GÖZLÜKTE NET %50 İNDİRİM!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-truck-fast" style="color: #28a745;"></i> 2000₺ VE ÜZERİ ÜCRETSİZ KARGO!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-star" style="color: #ffc107;"></i> YENİ SEZON ÜRÜNLERİ KEŞFEDİN!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-gift" style="color: #e83e8c;"></i> ANNELER GÜNÜ KOLEKSİYONU YAYINDA!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-tags" style="color: #fd7e14;"></i> SEZON SONU İNDİRİM FIRSATLARI!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-glasses" style="color: #17a2b8;"></i> 2. GÖZLÜKTE NET %50 İNDİRİM!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-truck-fast" style="color: #28a745;"></i> 2000₺ VE ÜZERİ ÜCRETSİZ KARGO!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-star" style="color: #ffc107;"></i> YENİ SEZON ÜRÜNLERİ KEŞFEDİN!</span>
            </div>
        </div>
    </div>
    <header class="v6-main-header">
        <div class="v6-header-container">
            <div class="v6-header-left">
                <i class="fa-solid fa-bars v6-mobile-menu-icon" onclick="document.querySelector('.v6-sidebar').classList.toggle('active'); document.querySelector('.v6-sidebar-overlay').classList.toggle('active');"></i>
                <div class="v6-search-box">
                    <i class="fa-solid fa-search" style="color: #999;"></i>
                    <input type="text" placeholder="Ürünleri ara...">
                </div>
            </div>
            <div class="v6-header-center">
                <a href="index.html" class="v6-logo">
                    <img src="assets/logo.png" alt="DEER DERI" style="height: 40px; transform: scale(1.2);">
                </a>
            </div>
            <div class="v6-header-right">
                <div class="v6-header-actions">
                    <a href="account.html" class="v6-action-item">
                        <i class="fa-regular fa-user"></i>
                        <span>HESABIM</span>
                    </a>
                    <a href="#" class="v6-action-item">
                        <i class="fa-regular fa-heart"></i>
                        <span>FAVORİLERİM</span>
                    </a>
                    <a href="cart.html" class="v6-action-item" onclick="event.preventDefault(); toggleCart(true);" style="position:relative;">
                        <i class="fa-solid fa-gift cart-icon"></i>
                        <span class="cart-badge" style="display:none; position:absolute; top:-8px; right:-8px; background:#000; color:#fff; border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:900; align-items:center; justify-content:center; line-height:18px; text-align:center;">0</span>
                        <span>SEPET</span>
                    </a>
                </div>
            </div>
        </div>
    </header>
    <div class="v6-sidebar-overlay" onclick="document.querySelector('.v6-sidebar').classList.remove('active'); document.querySelector('.v6-sidebar-overlay').classList.remove('active');"></div>
    <div class="v6-sidebar">
        <div class="v6-sidebar-header">
            <i class="fa-solid fa-times v6-sidebar-close" onclick="document.querySelector('.v6-sidebar').classList.remove('active'); document.querySelector('.v6-sidebar-overlay').classList.remove('active');"></i>
        </div>
        <nav class="v6-sidebar-nav">
            <a href="index.html">ANA SAYFA</a>
            <a href="#">CÜZDANLAR <i class="fa-solid fa-chevron-right"></i></a>
            <a href="#">ÇANTALAR <i class="fa-solid fa-chevron-right"></i></a>
            <a href="#">GÖZLÜKLER <i class="fa-solid fa-chevron-right"></i></a>
            <a href="#">ŞAPKALAR <i class="fa-solid fa-chevron-right"></i></a>
            <a href="#">AKSESUAR <i class="fa-solid fa-chevron-right"></i></a>
            <a href="#">KEMER</a>
            <a href="#">OFİS GEREÇLERİ</a>
            <a href="#" style="color: red;">İNDİRİM FIRSATI! 🔥</a>
            <a href="contact.html">İLETİŞİM</a>
        </nav>
    </div>`;

const footerHTML = `
    <!-- V6 GLOBAL FOOTER (auto-injected) -->
    <footer class="v6-footer" style="background:#000; color:#fff; padding: 60px 40px 30px; margin-top: 80px;">
        <div style="max-width:1200px; margin:0 auto;">
            <div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:50px;">
                <div>
                    <img src="assets/logo.png" alt="DEER DERİ" style="height:45px; filter:invert(1); margin-bottom:20px;">
                    <p style="font-size:13px; color:#aaa; line-height:1.8; max-width:280px;">Türkiye'nin en seçkin el yapımı deri aksesuar markası. Her ürün, geleneksel ustalığın modern yorumu.</p>
                    <div style="display:flex; gap:12px; margin-top:20px;">
                        <a href="#" style="color:#fff; font-size:18px;"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" style="color:#fff; font-size:18px;"><i class="fa-brands fa-facebook"></i></a>
                        <a href="#" style="color:#fff; font-size:18px;"><i class="fa-brands fa-tiktok"></i></a>
                    </div>
                </div>
                <div>
                    <h4 style="font-size:11px; letter-spacing:2px; font-weight:800; margin-bottom:20px; color:#fff;">KATEGORİLER</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Cüzdanlar</a>
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Çantalar</a>
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Kemerler</a>
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Gözlükler</a>
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Aksesuar</a>
                    </div>
                </div>
                <div>
                    <h4 style="font-size:11px; letter-spacing:2px; font-weight:800; margin-bottom:20px; color:#fff;">KURUMSAL</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Hakkımızda</a>
                        <a href="contact.html" style="color:#aaa; font-size:13px; text-decoration:none;">İletişim</a>
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">İade Politikası</a>
                        <a href="#" style="color:#aaa; font-size:13px; text-decoration:none;">Gizlilik</a>
                    </div>
                </div>
                <div>
                    <h4 style="font-size:11px; letter-spacing:2px; font-weight:800; margin-bottom:20px; color:#fff;">İLETİŞİM</h4>
                    <div style="display:flex; flex-direction:column; gap:10px; font-size:13px; color:#aaa;">
                        <div><i class="fa-solid fa-location-dot" style="margin-right:8px;"></i>Bursa, Türkiye</div>
                        <div><i class="fa-solid fa-phone" style="margin-right:8px;"></i>+90 (224) XXX XX XX</div>
                        <div><i class="fa-solid fa-envelope" style="margin-right:8px;"></i>info@deerderi.com</div>
                    </div>
                </div>
            </div>
            <div style="border-top:1px solid #333; padding-top:25px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                <p style="font-size:12px; color:#666; margin:0;">© 2024 DEER DERİ. Tüm Hakları Saklıdır.</p>
                <div style="display:flex; gap:15px; align-items:center;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style="height:20px; filter:brightness(0) invert(0.5);">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style="height:24px; filter:brightness(0) invert(0.5);">
                </div>
            </div>
        </div>
    </footer>`;

// =====================================================================
// Pages to update
// =====================================================================
const pages = ['cart.html', 'checkout.html', 'success.html', 'product.html', 'account.html', 'register.html', 'contact.html', 'category.html'];

pages.forEach(page => {
    if (!fs.existsSync(page)) return;
    let html = fs.readFileSync(page, 'utf8');

    // 1. Ensure v6-design.css is in <head>
    if (!html.includes('v6-design.css')) {
        html = html.replace('<link rel="stylesheet" href="styles.css', '<link rel="stylesheet" href="v6-design.css?v=207">\n    <link rel="stylesheet" href="styles.css');
        console.log(`Added v6-design.css to ${page}`);
    }

    // 2. Remove old static header/footer blocks between <body> and first real content
    // Replace the static v6 header block (marquee + header + sidebar) with a placeholder
    const oldHeaderRegex = /<!-- 1\. Top Bar[\s\S]*?<\/div>\s*(?=\n\s*<div class="[\w-]+-container|<div id="checkout|<div class="cart-container|<div class="success|<section|<!-- SUCCESS|<!-- ORDER|<main)/;
    if (oldHeaderRegex.test(html)) {
        html = html.replace(oldHeaderRegex, '<!-- GLOBAL_HEADER_PLACEHOLDER -->\n');
        console.log(`Removed static header from ${page}`);
    }

    // Also remove any orphan </div> before placeholder if there's a broken div
    html = html.replace(/<body>\s*\n\s*<\/div>\s*\n/, '<body>\n');

    // 3. Remove old static footer before dynamic-footer
    const oldFooterRegex = /<!-- (?:V6 GLOBAL FOOTER|Footer)[^\n]*-->\s*<footer[^>]*>[\s\S]*?<\/footer>/g;
    // We'll keep the dynamic-footer id intact but replace its contents

    // 4. Replace dynamic-footer placeholder with actual footer content
    const dynamicFooterPlaceholder = /<footer id="dynamic-footer">[\s\S]*?<\/footer>/;
    if (dynamicFooterPlaceholder.test(html)) {
        html = html.replace(dynamicFooterPlaceholder, footerHTML.trim());
        console.log(`Replaced dynamic footer in ${page}`);
    }

    // 5. Inject header after <body> tag if placeholder exists
    html = html.replace('<!-- GLOBAL_HEADER_PLACEHOLDER -->', headerHTML.trim());

    // 6. Ensure v6-script.js is loaded before </body>
    if (!html.includes('v6-script.js')) {
        html = html.replace('</body>', '<script src="v6-script.js"></script>\n</body>');
        console.log(`Added v6-script.js to ${page}`);
    }

    fs.writeFileSync(page, html);
    console.log(`✅ Updated ${page}`);
});

console.log('\nAll pages updated!');
