const fs = require('fs');
let html = fs.readFileSync('checkout.html', 'utf8');

const oldCssRegex = /\.addr-type-card \{[\s\S]*?\.addr-type-card\.active i \{[\s\S]*?\}/;
const newCss = `.addr-type-container {
            display: flex;
            background: #f0f0f0;
            padding: 6px;
            border-radius: 12px;
            gap: 5px;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
        }
        .addr-type-card {
            flex: 1;
            border: none;
            background: transparent;
            padding: 12px 10px;
            text-align: center;
            border-radius: 8px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 800;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            color: #888;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        .addr-type-card i {
            font-size: 18px;
            transition: all 0.3s ease;
        }
        .addr-type-card:hover {
            color: #444;
        }
        .addr-type-card:hover i {
            transform: translateY(-2px) scale(1.1);
        }
        .addr-type-card.active {
            background: #fff;
            color: #000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            animation: gentlePulse 2s infinite ease-in-out;
        }
        .addr-type-card.active i {
            color: #000;
            transform: scale(1.15);
        }`;

if(html.match(oldCssRegex)) {
    html = html.replace(oldCssRegex, newCss);
}

const oldHtml = `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                                <div class="addr-type-card active" onclick="setAddressTypeCard('Ev', this)">
                                    <i class="fa-solid fa-house"></i> EV
                                </div>
                                <div class="addr-type-card" onclick="setAddressTypeCard('İş', this)">
                                    <i class="fa-solid fa-building"></i> İŞ
                                </div>
                                <div class="addr-type-card" onclick="setAddressTypeCard('Diğer', this)">
                                    <i class="fa-solid fa-location-dot"></i> DİĞER
                                </div>
                            </div>`;

const newHtml = `<div class="addr-type-container">
                                <div class="addr-type-card active" onclick="setAddressTypeCard('Ev', this)">
                                    <i class="fa-solid fa-house"></i> EV
                                </div>
                                <div class="addr-type-card" onclick="setAddressTypeCard('İş', this)">
                                    <i class="fa-solid fa-building"></i> İŞ
                                </div>
                                <div class="addr-type-card" onclick="setAddressTypeCard('Diğer', this)">
                                    <i class="fa-solid fa-location-dot"></i> DİĞER
                                </div>
                            </div>`;

if(html.includes(oldHtml)) {
    html = html.replace(oldHtml, newHtml);
} else {
    // maybe whitespace is different
    html = html.replace(/<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">[\s\S]*?<\/div>\s*<\/div>\s*<input type="hidden" id="addr-title-input" value="Ev">/, newHtml + '\n                            <input type="hidden" id="addr-title-input" value="Ev">');
}

fs.writeFileSync('checkout.html', html, 'utf8');
console.log('Addr type animated successfully.');
