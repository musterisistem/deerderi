const fs = require('fs');

let html = fs.readFileSync('checkout.html', 'utf8');

// 1. Remove the old shipping section
const oldShippingRegex = /<!-- BÖLÜM 4: KARGO -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
html = html.replace(oldShippingRegex, '<!-- BÖLÜM 4: KARGO (Taşındı) -->');

// 2. Create the new shipping HTML
const newShippingHtml = `
                <!-- NEW SHIPPING SECTION -->
                <div class="summary-box shipping-box" style="margin-top:20px; padding:15px; background:#fafafa; border:1px solid #ebebeb; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                    <h3 style="font-size:14px; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
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

// 3. Find the payment section in sidebar and insert newShippingHtml before it.
// The payment section starts with: <div class="summary-box" style="margin-top:20px; padding:20px; background:#fafafa; border:1px solid #ebebeb; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">
// and contains "ÖDEME YÖNTEMİ"
const paymentBoxTarget = '<div class="summary-box" style="margin-top:20px; padding:20px; background:#fafafa; border:1px solid #ebebeb; border-radius:6px; box-shadow:0 4px 15px rgba(0,0,0,0.03);">';
// Wait, we can just search for "ÖDEME YÖNTEMİ" and find its parent div.
const paymentHeaderIdx = html.indexOf('ÖDEME YÖNTEMİ');
if (paymentHeaderIdx !== -1) {
    const paymentBoxStartIdx = html.lastIndexOf('<div class="summary-box"', paymentHeaderIdx);
    html = html.substring(0, paymentBoxStartIdx) + newShippingHtml + html.substring(paymentBoxStartIdx);
} else {
    console.error("Payment box not found!");
}

// 4. Add CSS for .shipping-mini-card
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

html = html.replace('</style>', cssAdditions + '\n    </style>');

// Also update script.js to ensure selectShipping works with the new classes
// We need to write a separate script for script.js if it modifies it.
fs.writeFileSync('checkout.html', html, 'utf8');
console.log('Moved shipping to sidebar.');
