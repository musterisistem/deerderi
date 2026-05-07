const fs = require('fs');

// Read the backup (UTF-16 LE)
let backup = fs.readFileSync('checkout_backup.html');
let html = backup.toString('utf16le');

// Remove BOM if present
html = html.replace(/^\uFEFF/, '');

// 1. Fix the <head> - replace the old style block with a clean one
const newStyleBlock = `    <style>
        :root {
            --primary-black: #000000;
            --soft-grey: #f8f8f8;
            --border-color: #e5e5e5;
            --text-muted: #666666;
            --success-green: #2e7d32;
        }

        body { overflow-x: hidden; }

        /* FULL-WIDTH CHECKOUT */
        .checkout-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 30px 60px 0 60px !important;
            box-sizing: border-box !important;
        }

        /* Main Layout */
        .checkout-grid {
            display: grid;
            grid-template-columns: 1.7fr 1fr;
            gap: 40px;
            align-items: start;
        }

        .checkout-section {
            background: #fff;
            border: 1px solid var(--border-color);
            padding: 20px 25px;
            margin-bottom: 15px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e5e5;
        }

        .section-title {
            font-family: var(--v6-font, 'Inter', sans-serif);
            font-size: 14px;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
        }

        /* Forms */
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }

        .form-group {
            margin-bottom: 12px;
        }

        .form-group label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            margin-bottom: 6px;
            color: var(--primary-black);
        }

        .form-control {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 0;
            font-size: 13px;
            background: #fafafa;
            transition: border-color 0.2s;
            font-family: var(--v6-font, 'Inter', sans-serif);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary-black);
            background: #fff;
        }

        input.input-error, select.input-error, textarea.input-error {
            border-color: #e00 !important;
        }

        /* Sidebar */
        .checkout-sidebar {
            position: sticky;
            top: 100px;
            height: fit-content;
        }

        /* Shipping */
        .shipping-list { display: flex; flex-direction: column; gap: 10px; }

        .shipping-card {
            border: 1px solid var(--border-color);
            padding: 14px 18px;
            display: flex;
            align-items: center;
            gap: 15px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .shipping-card:hover { border-color: #000; }
        .shipping-card.selected { border: 2px solid #000; }

        .shipping-card input[type="radio"] {
            width: 18px; height: 18px; accent-color: #000; cursor: pointer;
        }

        .shipping-info { flex: 1; }
        .shipping-title { font-weight: 800; font-size: 14px; display: block; }
        .shipping-desc { font-size: 12px; color: #666; }
        .shipping-price { font-weight: 800; font-size: 15px; }

        /* Saved Addresses */
        .saved-address-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .saved-address-card {
            border: 1px solid var(--border-color);
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .saved-address-card:hover { border-color: #000; }
        .saved-address-card.selected { border: 2px solid #000; }
        .addr-title { font-weight: 700; font-size: 13px; text-transform: uppercase; }
        .addr-body { font-size: 12px; color: #444; line-height: 1.5; margin-top: 8px; }

        .add-new-addr-link {
            display: inline-flex; align-items: center; gap: 8px;
            color: #000; font-weight: 700; font-size: 12px;
            border-bottom: 1.5px solid #000; padding-bottom: 2px;
        }

        .btn-addr-type {
            flex: 1; padding: 10px; border: 1px solid var(--border-color);
            background: #fff; cursor: pointer; font-size: 11px; font-weight: 700;
        }
        .btn-addr-type.active { background: #000; color: #fff; border-color: #000; }

        /* Modals */
        .overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 9999;
            display: none; justify-content: center; align-items: center;
        }

        .success-box { background: #fff; padding: 40px; text-align: center; max-width: 500px; width: 90%; }

        #address-confirm-modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 11000;
            justify-content: center; align-items: center;
        }

        .confirm-content {
            background: #fff; padding: 40px; text-align: center;
            max-width: 400px; width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        #checkout-login-modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 12000;
            justify-content: center; align-items: center; backdrop-filter: blur(5px);
        }

        .login-modal-content {
            background: #fff; padding: 40px; width: 100%; max-width: 420px;
            position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .close-modal {
            position: absolute; top: 20px; right: 20px;
            font-size: 24px; cursor: pointer; color: #999;
        }

        .close-modal:hover { color: #000; }
        .modal-title { font-size: 24px; font-weight: 800; margin-bottom: 25px; text-align: center; }
        .confirm-icon { font-size: 50px; color: var(--success-green); margin-bottom: 15px; }
        .confirm-title { font-size: 18px; font-weight: 800; margin-bottom: 10px; }

        @keyframes modalPop {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 992px) {
            .checkout-container { padding: 20px 24px 0 24px !important; }
            .checkout-grid { grid-template-columns: 1fr; }
            .checkout-sidebar { position: static; order: -1; }
        }

        @media (max-width: 600px) {
            .checkout-container { padding: 15px 16px 0 16px !important; }
            .form-row { grid-template-columns: 1fr; }
        }
    </style>`;

// Find the <style> block and replace it
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>') + '</style>'.length;
if (styleStart > -1 && styleEnd > -1) {
    html = html.substring(0, styleStart) + newStyleBlock + html.substring(styleEnd);
    console.log('✅ Replaced style block');
} else {
    console.log('❌ Could not find style block');
}

// 2. Now update the checkout-container and checkout-grid inline styles in the body
html = html.replace(
    /class="checkout-container"[^>]*>/,
    'class="checkout-container">'
);

html = html.replace(
    /class="checkout-grid" style="[^"]*"/,
    'class="checkout-grid"'
);

// 3. Ensure header is injected after <body> (it might already be there)
// Check for global header
if (!html.includes('V6 GLOBAL HEADER')) {
    const headerHTML = `
    <!-- V6 GLOBAL HEADER (auto-injected) -->
    <div class="v6-top-bar">
        <div class="v6-top-bar-container v6-marquee-container">
            <div class="v6-marquee">
                <span class="v6-marquee-item"><i class="fa-solid fa-gift" style="color: #e83e8c;"></i> ANNELER GÜNÜ KOLEKSİYONU YAYINDA!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-tags" style="color: #fd7e14;"></i> SEZON SONU İNDİRİM FIRSATLARI!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-truck-fast" style="color: #28a745;"></i> 2000₺ VE ÜZERİ ÜCRETSİZ KARGO!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-star" style="color: #ffc107;"></i> YENİ SEZON ÜRÜNLERİ KEŞFEDİN!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-gift" style="color: #e83e8c;"></i> ANNELER GÜNÜ KOLEKSİYONU YAYINDA!</span>
                <span class="v6-marquee-dot">•</span>
                <span class="v6-marquee-item"><i class="fa-solid fa-tags" style="color: #fd7e14;"></i> SEZON SONU İNDİRİM FIRSATLARI!</span>
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
                        <span class="cart-badge" style="display:none; position:absolute; top:-8px; right:-8px; background:#000; color:#fff; border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:900; line-height:18px; text-align:center;">0</span>
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
            <a href="#">KEMERLER</a>
            <a href="#">AKSESUAR</a>
            <a href="#" style="color: red;">İNDİRİM FIRSATI! 🔥</a>
            <a href="contact.html">İLETİŞİM</a>
        </nav>
    </div>`;
    html = html.replace('<body>', '<body>' + headerHTML);
}

fs.writeFileSync('checkout.html', html, 'utf8');
console.log('✅ checkout.html fixed and saved as UTF-8');
console.log('First 10 lines:');
html.split('\n').slice(0,10).forEach((l,i)=>console.log(i+1, l.substring(0,80)));
