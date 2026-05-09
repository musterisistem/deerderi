const fs = require('fs');

const content = fs.readFileSync('checkout.html', 'utf8');
const lines = content.split('\n');

// Find second <html> tag
let secondHtmlIdx = -1;
let count = 0;
for (let i = 0; i < lines.length; i++) {
    if (/^<html/i.test(lines[i].trim())) {
        count++;
        if (count === 2) { secondHtmlIdx = i; break; }
    }
}
console.log('Second <html> at line:', secondHtmlIdx + 1);

// Build the clean base from the second HTML onwards
const cleanLines = lines.slice(secondHtmlIdx);
let cleanHtml = cleanLines.join('\n');

// Find the checkout-grid DIV used in the HTML (not CSS)
// It appears at offset 21449 from start of cleanHtml per our test
// Let's find it precisely with regex
const gridDivPattern = /\s*<!--\s*New 3-Step Progress\s*-->[\s\S]*?<div class="checkout-grid">/;
const gridMatch = gridDivPattern.exec(cleanHtml);

if (!gridMatch) {
    // Try simpler
    const gridIdx = cleanHtml.indexOf('<div class="checkout-grid">');
    // Should find the one after "<!-- New 3-Step Progress -->"
    console.log('Trying simple search... idx:', gridIdx);
    
    // Get all occurrences
    let idx = 0;
    const occurrences = [];
    while (true) {
        const pos = cleanHtml.indexOf('<div class="checkout-grid">', idx);
        if (pos === -1) break;
        occurrences.push(pos);
        idx = pos + 1;
    }
    console.log('All occurrences of checkout-grid div:', occurrences);
}

// Use character-level approach based on our knowledge
// The grid div is at around char 21449 in cleanHtml
// Find the closing of checkout-container div that wraps it
const containerStart = cleanHtml.indexOf('<div class="checkout-container">');
console.log('checkout-container start:', containerStart);

// Find </div> that closes checkout-container - count divs
let depth = 0;
let containerEnd = -1;
let i = containerStart;

// Skip to the opening tag first
while (i < cleanHtml.length && cleanHtml[i] !== '>') i++;
i++; depth = 1;

while (i < cleanHtml.length && depth > 0) {
    if (cleanHtml.substring(i, i+4) === '<div') depth++;
    else if (cleanHtml.substring(i, i+6) === '</div>') {
        depth--;
        if (depth === 0) { containerEnd = i; break; }
    }
    i++;
}

console.log('container end at:', containerEnd);

const newContent = `        <div class="checkout-container">
        <div class="checkout-grid">
            <!-- Sol: Tek Sayfa Form -->
            <div class="checkout-main">

                <!-- BÖLÜM 1: KİŞİSEL BİLGİLER -->
                <div class="checkout-section">
                    <div class="section-header">
                        <h2 class="section-title">Kişisel Bilgiler</h2>
                        <div id="checkout-auth-links">
                            <span style="font-size:13px; color:#666;">Zaten üye misiniz?</span>
                            <a href="javascript:void(0)" onclick="openCheckoutLogin()" style="font-size:13px; font-weight:700; color:var(--primary-black); text-decoration:underline; margin-left:5px;">GİRİŞ YAPIN</a>
                        </div>
                    </div>

                    <div id="guest-form-container">
                        <div class="form-row">
                            <div class="form-group">
                                <label>ADINIZ *</label>
                                <input type="text" id="guest-name" class="form-control" placeholder="Örn: Ahmet" required>
                            </div>
                            <div class="form-group">
                                <label>SOYADINIZ *</label>
                                <input type="text" id="guest-surname" class="form-control" placeholder="Örn: Yılmaz" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>E-POSTA ADRESİNİZ *</label>
                                <input type="email" id="guest-email" class="form-control" placeholder="ahmet@example.com" required>
                            </div>
                            <div class="form-group">
                                <label>TELEFON NUMARANIZ *</label>
                                <input type="tel" id="guest-phone" class="form-control" placeholder="05XX XXX XX XX" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, '').substring(0, 11)" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>T.C. KİMLİK NO (Opsiyonel)</label>
                            <input type="text" id="guest-tc" class="form-control" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, '').substring(0, 11)" placeholder="Fatura için gereklidir">
                        </div>
                    </div>

                    <div id="logged-in-user-container" style="display:none; padding:15px; background:#f9f9f9; border:1px solid #eee; border-radius:4px;">
                        <i class="fa-solid fa-user-check" style="color:#2e7d32; margin-right:10px;"></i>
                        <strong id="logged-in-user-name"></strong> olarak giriş yapıldı.
                        (<a href="#" onclick="logoutUser(); return false;" style="color:#D32F2F; text-decoration:underline; font-size:12px;">Çıkış Yap</a>)
                    </div>
                </div>

                <!-- BÖLÜM 2: TESLİMAT ADRESİ -->
                <div class="checkout-section">
                    <div class="section-header">
                        <h2 class="section-title">Teslimat Adresi</h2>
                    </div>

                    <div id="checkout-saved-addresses" style="display:none; margin-bottom:20px;">
                        <div class="saved-address-grid" id="saved-address-list"></div>
                        <a href="javascript:void(0)" onclick="toggleNewAddressForm()" class="add-new-addr-link">
                            <i class="fa-solid fa-plus"></i> YENİ ADRES EKLE
                        </a>
                    </div>

                    <div id="checkout-address-form">
                        <div class="form-group">
                            <label>ADRES BAŞLIĞI *</label>
                            <div style="display:flex; gap:10px;">
                                <button type="button" class="btn-addr-type active" onclick="setAddressType('Ev', this)">EV</button>
                                <button type="button" class="btn-addr-type" onclick="setAddressType('Is', this)">IS</button>
                                <button type="button" class="btn-addr-type" onclick="setAddressType('Diger', this)">DIGER</button>
                            </div>
                            <input type="hidden" id="addr-title-input" value="Ev">
                        </div>
                        <div class="form-group">
                            <label>TAM ADRES *</label>
                            <textarea id="addr-text-input" class="form-control" rows="3" placeholder="Mahalle, sokak, bina ve daire no..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>SEHIR *</label>
                                <select id="city-select" class="form-control" onchange="loadDistricts()">
                                    <option value="">Secинiz</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>ILCE *</label>
                                <select id="district-select" class="form-control" disabled>
                                    <option value="">Once Sehir Seciniz</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BÖLÜM 3: FATURA ADRESİ -->
                <div class="checkout-section" style="margin-top:-15px; border-top:none;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                        <input type="checkbox" id="use-same-address" checked style="width:18px; height:18px; accent-color:#000; cursor:pointer;" onchange="toggleBillingAddress()">
                        <label for="use-same-address" style="margin:0; font-size:13px; cursor:pointer; font-weight:600;">Teslimat adresimi fatura adresi olarak kullan</label>
                    </div>
                    <div id="billing-address-container" style="display:none; padding-top:15px; border-top:1px solid #eee;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:20px;">Fatura Adresi</h3>
                        <div class="form-group">
                            <label>FATURA BASLIGI / FIRMA ADI *</label>
                            <input type="text" id="billing-title" class="form-control" placeholder="Ad Soyad veya Firma Adi">
                        </div>
                        <div class="form-group">
                            <label>TAM ADRES *</label>
                            <textarea id="billing-text-input" class="form-control" rows="2" placeholder="Fatura adres detaylari..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>SEHIR *</label>
                                <input type="text" id="billing-city" class="form-control" placeholder="Sehir">
                            </div>
                            <div class="form-group">
                                <label>ILCE *</label>
                                <input type="text" id="billing-district" class="form-control" placeholder="Ilce">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BÖLÜM 4: KARGO -->
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
                </div>

                <!-- BÖLÜM 5: ÖDEME -->
                <div class="checkout-section">
                    <div class="section-header">
                        <h2 class="section-title">Odeme Bilgileri</h2>
                    </div>
                    <div id="payment-card-form">
                        <div class="form-group">
                            <label>KART UZERINDEKI ISIM *</label>
                            <input type="text" id="card-name" class="form-control" placeholder="AD SOYAD">
                        </div>
                        <div class="form-group">
                            <label>KART NUMARASI *</label>
                            <input type="text" id="card-number" class="form-control" placeholder="0000 0000 0000 0000">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>SON KULLANMA *</label>
                                <input type="text" id="card-expiry" class="form-control" placeholder="AA/YY">
                            </div>
                            <div class="form-group">
                                <label>CVV *</label>
                                <input type="text" id="card-cvv" class="form-control" placeholder="000">
                            </div>
                        </div>
                    </div>
                    <div id="payment-cod-msg" style="display:none; padding:20px; background:#f9f9f9; border-radius:8px; text-align:center; border:1px dashed #e5e5e5;">
                        <i class="fa-solid fa-truck-fast" style="font-size:32px; margin-bottom:15px; color:#000;"></i>
                        <p style="font-weight:700; margin-bottom:5px;">Kapida Odeme Secildi</p>
                        <p style="font-size:13px; color:#666;">Odemenizi urun teslimatinda nakit veya kartla yapabilirsiniz.</p>
                    </div>
                </div>

            </div>

            <!-- Sag: Siparis Ozeti -->
            <div class="checkout-sidebar">
                <div class="summary-box">
                    <h3 style="font-size:18px; font-weight:700; margin-bottom:20px; border-bottom:1px solid #e5e5e5; padding-bottom:15px;">SIPARIS OZETI</h3>
                    <div id="checkout-summary-items" style="margin-bottom:20px; max-height:400px; overflow-y:auto;"></div>
                    <div style="border-top:1px solid #e5e5e5; padding-top:20px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span style="color:#666;">Ara Toplam</span>
                            <span id="summary-subtotal" style="font-weight:700;">0TL</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span style="color:#666;">Kargo Ucreti</span>
                            <span id="summary-shipping" style="font-weight:700;">0TL</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:15px; padding-top:15px; border-top:2px solid #000; font-size:18px; font-weight:900;">
                            <span>TOPLAM</span>
                            <span id="summary-total-price">0TL</span>
                        </div>
                        <p style="font-size:11px; color:#666; text-align:right; margin-top:5px;">KDV Dahildir</p>
                    </div>
                </div>
                <button type="button" onclick="processOrder()" class="btn btn-black btn-lg" style="width:100%; font-weight:800; padding:18px; font-size:16px; margin-top:15px; letter-spacing:1px; text-transform:uppercase;">
                    SIPARISI TAMAMLA
                </button>
                <div style="margin-top:20px; padding:15px; background:#fff; border:1px solid #e5e5e5; border-radius:8px; display:flex; align-items:center; gap:15px;">
                    <i class="fa-solid fa-shield-halved" style="font-size:24px; color:#2E7D32;"></i>
                    <div style="font-size:12px; line-height:1.4;">
                        <strong>Guvenli Alisveris</strong><br>
                        Verileriniz 256-bit SSL ile korunmaktadir.
                    </div>
                </div>
            </div>
        </div>
    </div>`;

const before = cleanHtml.substring(0, containerStart);
const after = cleanHtml.substring(containerEnd + 6); // 6 = length of </div>

const result = before + newContent + after;
fs.writeFileSync('checkout.html', result, 'utf8');
console.log('Done! Total lines:', result.split('\n').length);
