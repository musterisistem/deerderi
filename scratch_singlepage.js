const fs = require('fs');

let html = fs.readFileSync('checkout.html', 'utf8');

// 1. Remove .step-progress
html = html.replace(/<div class="step-progress">[\s\S]*?<\/div>(\s*)<div class="checkout-grid">/, '<div class="checkout-grid">');

// 2. We will replace the entire <div class="checkout-main">...</div> section and the sidebar.
// First, extract everything before <div class="checkout-main">
const mainStart = html.indexOf('<div class="checkout-main">');
const sidebarEnd = html.indexOf('</div>\n    </div>\n\n    <!-- Success Popup'); // Just end of grid container

if (mainStart === -1) {
    console.error("Could not find checkout-main");
    process.exit(1);
}

const beforeMain = html.substring(0, mainStart);

const newMainAndSidebar = `
<div class="checkout-main">
    <!-- HESAP / KİŞİSEL BİLGİLER -->
    <div id="step-1-container" class="checkout-step active" style="display:block;">
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
                <!-- Remove automatic registration inputs to simplify guest checkout -->
            </div>
            
            <div id="logged-in-user-container" style="display:none; padding:15px; background:#f9f9f9; border:1px solid #eee; border-radius:4px;">
                 <i class="fa-solid fa-user-check" style="color:var(--success-green); margin-right:10px;"></i> 
                 <strong id="logged-in-user-name"></strong> olarak giriş yapıldı. (<a href="#" onclick="window.logoutUser(); return false;" style="color:#D32F2F; text-decoration:underline; font-size:12px;">Çıkış Yap</a>)
            </div>
        </div>
    </div>

    <!-- TESLİMAT VE FATURA ADRESİ -->
    <div id="step-2-container" class="checkout-step active" style="display:block;">
        <div class="checkout-section">
            <div class="section-header">
                <h2 class="section-title">Teslimat Adresi</h2>
            </div>

            <!-- Saved Addresses (Member Only) -->
            <div id="checkout-saved-addresses" style="display:none; margin-bottom:20px;">
                <div class="saved-address-grid" id="saved-address-list">
                    <!-- Cards injected by JS -->
                </div>
                <a href="javascript:void(0)" onclick="toggleNewAddressForm()" class="add-new-addr-link">
                    <i class="fa-solid fa-plus"></i> YENİ ADRES EKLE
                </a>
            </div>

            <!-- Address Form -->
            <div id="checkout-address-form">
                <div class="form-group">
                    <label>ADRES BAŞLIĞI *</label>
                    <div style="display:flex; gap:10px;">
                        <button type="button" class="btn-addr-type active" onclick="setAddressType('Ev', this)">EV</button>
                        <button type="button" class="btn-addr-type" onclick="setAddressType('İş', this)">İŞ</button>
                        <button type="button" class="btn-addr-type" onclick="setAddressType('Diğer', this)">DİĞER</button>
                    </div>
                    <input type="hidden" id="addr-title-input" value="Ev">
                </div>

                <div class="form-group">
                    <label>TAM ADRES *</label>
                    <textarea id="addr-text-input" class="form-control" rows="3" placeholder="Mahalle, sokak, bina ve daire no..."></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>ŞEHİR *</label>
                        <select id="city-select" class="form-control" onchange="loadDistricts()">
                            <option value="">Seçiniz</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>İLÇE *</label>
                        <select id="district-select" class="form-control" disabled>
                            <option value="">Önce Şehir Seçiniz</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- FATURA ADRESİ (YENİ) -->
        <div class="checkout-section" style="margin-top:-15px; border-top:none;">
            <div class="form-group" style="margin-bottom:15px; display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="use-same-address" checked style="width:18px; height:18px; accent-color:#000; cursor:pointer;" onchange="toggleBillingAddress()">
                <label for="use-same-address" style="margin:0; font-size:13px; cursor:pointer; text-transform:none; font-weight:600;">Teslimat adresimi fatura adresi olarak kullan</label>
            </div>
            
            <div id="billing-address-container" style="display:none; padding-top:15px; border-top:1px solid #eee;">
                <div class="section-header">
                    <h2 class="section-title">Fatura Adresi</h2>
                </div>
                
                 <div class="form-group">
                    <label>FATURA BAŞLIĞI / FİRMA ADI *</label>
                    <input type="text" id="billing-title" class="form-control" placeholder="Ad Soyad veya Firma Adı">
                </div>
                
                <div class="form-group">
                    <label>TAM ADRES *</label>
                    <textarea id="billing-text-input" class="form-control" rows="2" placeholder="Fatura adres detayları..."></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>ŞEHİR *</label>
                        <input type="text" id="billing-city" class="form-control" placeholder="Şehir">
                    </div>
                    <div class="form-group">
                        <label>İLÇE *</label>
                        <input type="text" id="billing-district" class="form-control" placeholder="İlçe">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="checkout-section">
            <div class="section-header">
                <h2 class="section-title">Kargo Seçimi</h2>
            </div>
            <div class="shipping-list">
                <div class="shipping-card selected" onclick="selectShipping('standard')">
                    <input type="radio" name="shipping" value="standard" checked>
                    <div class="shipping-info">
                        <span class="shipping-title">Standart Kargo</span>
                        <span class="shipping-desc">Tüm Türkiye'ye 2-3 iş günü içinde güvenli teslimat.</span>
                    </div>
                    <div class="shipping-price">+100₺</div>
                </div>
                <div class="shipping-card" onclick="selectShipping('door')">
                    <input type="radio" name="shipping" value="door">
                    <div class="shipping-info">
                        <span class="shipping-title">Kapıda Ödeme</span>
                        <span class="shipping-desc">Teslimat anında nakit veya kredi kartı ile ödeme kolaylığı.</span>
                    </div>
                    <div class="shipping-price">+50₺</div>
                </div>
            </div>
        </div>
    </div>

    <!-- ÖDEME BİLGİLERİ -->
    <div id="step-3-container" class="checkout-step active" style="display:block;">
        <div class="checkout-section">
            <div class="section-header">
                <h2 class="section-title">Ödeme Bilgileri</h2>
            </div>

            <!-- Card Form -->
            <div id="payment-card-form">
                <div class="form-group">
                    <label>KART ÜZERİNDEKİ İSİM *</label>
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

            <!-- COD Message -->
            <div id="payment-cod-msg" style="display:none; padding:20px; background:#f9f9f9; border-radius:8px; text-align:center; border:1px dashed var(--border-color);">
                <i class="fa-solid fa-truck-fast" style="font-size:32px; margin-bottom:15px; color:var(--primary-black);"></i>
                <p style="font-weight:700; margin-bottom:5px;">Kapıda Ödeme Seçildi</p>
                <p style="font-size:13px; color:var(--text-muted);">Ödemenizi ürün teslimatında nakit veya kartla yapabilirsiniz.</p>
            </div>
        </div>
    </div>
</div>

<div class="checkout-sidebar">
    <div class="summary-box">
        <h3 style="font-size:18px; font-weight:700; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:15px;">SİPARİŞ ÖZETİ</h3>

        <div id="checkout-summary-items" style="margin-bottom:20px; max-height:400px; overflow-y:auto;">
            <!-- Items injected by JS -->
        </div>

        <div class="summary-totals" style="border-top:1px solid var(--border-color); padding-top:20px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="color:var(--text-muted);">Ara Toplam</span>
                <span id="summary-subtotal" style="font-weight:700;">0₺</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="color:var(--text-muted);">Kargo Ücreti</span>
                <span id="summary-shipping" style="font-weight:700;">0₺</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:15px; padding-top:15px; border-top:2px solid var(--primary-black); font-size:18px; font-weight:900;">
                <span>TOPLAM</span>
                <span id="summary-total-price">0₺</span>
            </div>
            <p style="font-size:11px; color:var(--text-muted); text-align:right; margin-top:5px;">KDV Dahildir</p>
        </div>
    </div>
    
    <button type="button" onclick="processOrder()" class="btn btn-black btn-lg" style="width:100%; font-weight:800; padding:18px; font-size:16px; margin-top:15px; letter-spacing:1px; text-transform:uppercase;">
        SİPARİŞİ TAMAMLA
    </button>
    
    <div style="margin-top:20px; padding:15px; background:#fff; border:1px solid var(--border-color); border-radius:8px; display:flex; align-items:center; gap:15px;">
        <i class="fa-solid fa-shield-halved" style="font-size:24px; color:#2E7D32;"></i>
        <div style="font-size:12px; line-height:1.4;">
            <strong>Güvenli Alışveriş</strong><br>
            Verileriniz 256-bit SSL ile korunmaktadır.
        </div>
    </div>
</div>
</div>

    <!-- Success Popup -->`;

// We also need to get everything after the sidebarEnd.
// We search for `</div>\n    </div>` which closes `checkout-grid` and `checkout-container`.
const gridEndIndex = html.indexOf('</div>\n    </div>', mainStart);
const afterGrid = html.substring(gridEndIndex + '</div>\n    </div>'.length);

const finalHtml = beforeMain + newMainAndSidebar + afterGrid;

fs.writeFileSync('checkout.html', finalHtml, 'utf8');
console.log('checkout.html updated successfully.');
