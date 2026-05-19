const fs = require('fs');
let html = fs.readFileSync('checkout.html', 'utf8');

// 1. Remove old kargo block. We saw the exact lines earlier.
const oldKargoStart = html.indexOf('<!-- BÖLÜM 4: KARGO -->');
if (oldKargoStart !== -1) {
    const nextSectionStart = html.indexOf('</div>\r\n\r\n            </div>\r\n\r\n            <!-- Sag: Siparis Ozeti -->', oldKargoStart) || html.indexOf('</div>\n\n            </div>\n\n            <!-- Sag: Siparis Ozeti -->', oldKargoStart);
    // Find the end of the div holding the kargo section. It's basically until `</div>` that closes checkout-section.
    // I'll just use a more robust regex or substring.
    const oldKargoStr = `<!-- BÖLÜM 4: KARGO -->
                <div class="checkout-section">
                    <div class="section-header">
                        <h2 class="section-title">Kargo Secimi</h2>
                    </div>
                    <div class="shipping-list">
                        <div class="shipping-card selected" onclick="selectShipping('standard')">
                            <input type="radio" name="shipping" value="standard" checked>
                            <div class="shipping-info">
                                <span class="shipping-title">Standart Kargo</span>
                                <span class="shipping-desc">Tum Turkiye'ye 2-3 is gunu icinde guvenli teslimat.</span>
                            </div>
                            <div class="shipping-price">+100TL</div>
                        </div>
                        <div class="shipping-card" onclick="selectShipping('door')">
                            <input type="radio" name="shipping" value="door">
                            <div class="shipping-info">
                                <span class="shipping-title">Kapida Odeme</span>
                                <span class="shipping-desc">Teslimat aninda nakit veya kredi karti ile odeme kolayligi.</span>
                            </div>
                            <div class="shipping-price">+50TL</div>
                        </div>
                    </div>
                </div>`;
    html = html.replace(oldKargoStr, '<!-- BÖLÜM 4: KARGO TAŞINDI -->');
}

// 2. Insert new kargo block
const newShippingHtml = `
                <!-- NEW SHIPPING SECTION -->
                <div class="summary-box shipping-box" style="margin-top:20px; padding:15px; background:#fafafa; border:1px solid #ebebeb; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                    <h3 style="font-size:14px; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px; border-bottom:1px solid #e5e5e5; padding-bottom:10px;">
                        <i class="fa-solid fa-box-open" style="color:var(--primary-black);"></i> KARGO SEÇİMİ
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <div class="shipping-mini-card selected" onclick="selectShipping('standard')">
                            <input type="radio" name="shipping" value="standard" checked style="display:none;">
                            <div class="mini-card-icon"><i class="fa-solid fa-truck"></i></div>
                            <div class="mini-card-content">
                                <strong>Standart Kargo</strong>
                                <span>2-3 iş günü</span>
                            </div>
                            <div class="mini-card-price">+100TL</div>
                        </div>
                        <div class="shipping-mini-card" onclick="selectShipping('door')">
                            <input type="radio" name="shipping" value="door" style="display:none;">
                            <div class="mini-card-icon"><i class="fa-solid fa-money-bill-wave"></i></div>
                            <div class="mini-card-content">
                                <strong>Kapıda Ödeme</strong>
                                <span>Teslimatta Öde</span>
                            </div>
                            <div class="mini-card-price">+50TL</div>
                        </div>
                    </div>
                </div>
                <!-- END NEW SHIPPING SECTION -->
`;

const paymentTarget = `<div class="summary-box" style="margin-top:20px; padding:20px; background:#fafafa; border:1px solid #ebebeb; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                    <h3 style="font-size:16px; font-weight:700; margin-bottom:15px; border-bottom:1px solid #e5e5e5; padding-bottom:10px;">ÖDEME YÖNTEMİ</h3>`;

if(html.includes(paymentTarget)) {
    html = html.replace(paymentTarget, newShippingHtml + paymentTarget);
} else {
    console.error("Payment target not found!");
}

// 3. Add CSS
const cssAdditions = `
        .shipping-mini-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            background: #fff;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .shipping-mini-card:hover {
            transform: translateY(-2px);
            border-color: #000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .shipping-mini-card.selected {
            border-color: #000;
            background: #000;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: scale(1.02);
        }
        .shipping-mini-card .mini-card-icon {
            font-size: 18px;
            color: #666;
            transition: color 0.3s;
        }
        .shipping-mini-card.selected .mini-card-icon {
            color: #fff;
        }
        .shipping-mini-card .mini-card-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .shipping-mini-card .mini-card-content strong {
            font-size: 13px;
            margin-bottom: 2px;
        }
        .shipping-mini-card .mini-card-content span {
            font-size: 10px;
            color: #999;
        }
        .shipping-mini-card.selected .mini-card-content span {
            color: #ccc;
        }
        .shipping-mini-card .mini-card-price {
            font-weight: 800;
            font-size: 13px;
        }
`;

if(!html.includes('.shipping-mini-card')) {
    html = html.replace('</style>', cssAdditions + '\n    </style>');
}

fs.writeFileSync('checkout.html', html, 'utf8');
console.log('Moved shipping successfully.');
