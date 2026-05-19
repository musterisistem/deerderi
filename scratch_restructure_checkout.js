const fs = require('fs');

let html = fs.readFileSync('checkout.html', 'utf8');

// The goal is to:
// 1. Re-design Personal Info with tabs
// 2. Modernize Shipping Address 
// 3. Move Payment to Sidebar

// 1. Personal Info Replacement
const personalInfoOld = `<div class="checkout-section">
                    <div class="section-header">
                        <h2 class="section-title">Kişisel Bilgiler <span style="font-size:12px; font-weight:400; color:#666;">(Misafir)</span></h2>
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
                </div>`;

const personalInfoNew = `<div class="checkout-section" style="padding:0; overflow:hidden;">
                    <!-- Auth Mode Selector -->
                    <div id="auth-mode-selector" style="display:flex; border-bottom:1px solid var(--border-color); background:#fafafa;">
                        <button type="button" id="btn-mode-guest" onclick="setCheckoutMode('guest')" class="btn-addr-type active" style="flex:1; border:none; border-radius:0; padding:15px; font-size:13px; font-weight:800; border-right:1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; gap:5px; background:#fff;">
                            <i class="fa-solid fa-user-secret" style="font-size:18px;"></i>
                            MİSAFİR ALIŞVERİŞİ
                            <span style="font-size:10px; color:#666; font-weight:500;">Hızlı ve Üyeliksiz</span>
                        </button>
                        <button type="button" id="btn-mode-register" onclick="setCheckoutMode('register')" class="btn-addr-type" style="flex:1; border:none; border-radius:0; padding:15px; font-size:13px; font-weight:800; display:flex; flex-direction:column; align-items:center; gap:5px; background:transparent;">
                            <i class="fa-solid fa-user-plus" style="font-size:18px;"></i>
                            ÜYELİK OLUŞTUR
                            <span style="font-size:10px; color:#666; font-weight:500;">Kolay Takip ve Fırsatlar</span>
                        </button>
                    </div>

                    <div style="padding:20px;">
                        <div class="section-header" style="margin-bottom:15px; border:none; padding:0;">
                            <h2 class="section-title">Kişisel Bilgiler</h2>
                            <div id="checkout-auth-links">
                                <a href="javascript:void(0)" onclick="openCheckoutLogin()" style="font-size:12px; font-weight:700; color:var(--primary-black); text-decoration:underline;"><i class="fa-solid fa-right-to-bracket"></i> GİRİŞ YAPIN</a>
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
                            
                            <div id="register-fields" style="display:none; margin-top:15px; padding-top:15px; border-top:1px dashed #e5e5e5;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>ŞİFRE BELİRLE *</label>
                                        <input type="password" id="guest-password" class="form-control" placeholder="••••••••">
                                    </div>
                                    <div class="form-group">
                                        <label>ŞİFRE TEKRAR *</label>
                                        <input type="password" id="guest-password-confirm" class="form-control" placeholder="••••••••">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="logged-in-user-container" style="display:none; padding:15px; background:#f9f9f9; border:1px solid #eee; border-radius:4px;">
                            <i class="fa-solid fa-user-check" style="color:#2e7d32; margin-right:10px;"></i>
                            <strong id="logged-in-user-name"></strong> olarak giriş yapıldı.
                            (<a href="#" onclick="logoutUser(); return false;" style="color:#D32F2F; text-decoration:underline; font-size:12px;">Çıkış Yap</a>)
                        </div>
                    </div>
                </div>`;

// 2. Shipping Address Modernization
const addressOld = `<div id="checkout-address-form">
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
                            <textarea id="addr-text-input" class="form-control" rows="2" placeholder="Mahalle, sokak, bina ve daire no..."></textarea>
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
                    </div>`;

const addressNew = `<div id="checkout-address-form">
                        <div class="form-group" style="margin-bottom:15px;">
                            <label>ADRES BAŞLIĞI *</label>
                            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                                <div class="addr-type-card active" onclick="setAddressTypeCard('Ev', this)">
                                    <i class="fa-solid fa-house"></i> EV
                                </div>
                                <div class="addr-type-card" onclick="setAddressTypeCard('İş', this)">
                                    <i class="fa-solid fa-building"></i> İŞ
                                </div>
                                <div class="addr-type-card" onclick="setAddressTypeCard('Diğer', this)">
                                    <i class="fa-solid fa-location-dot"></i> DİĞER
                                </div>
                            </div>
                            <input type="hidden" id="addr-title-input" value="Ev">
                        </div>
                        <div class="form-row" style="margin-bottom:10px;">
                            <div class="form-group floating-group">
                                <label>ŞEHİR *</label>
                                <select id="city-select" class="form-control" onchange="loadDistricts()">
                                    <option value="">Seçiniz</option>
                                </select>
                            </div>
                            <div class="form-group floating-group">
                                <label>İLÇE *</label>
                                <select id="district-select" class="form-control" disabled>
                                    <option value="">Önce Şehir Seçiniz</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group floating-group">
                            <label>TAM ADRES *</label>
                            <textarea id="addr-text-input" class="form-control" rows="2" placeholder="Mahalle, sokak, bina ve daire no..."></textarea>
                        </div>
                    </div>`;

// 3. Move Payment to Sidebar
const paymentOld = `<!-- BÖLÜM 5: ÖDEME -->
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
                </div>`;

const sidebarPaymentHtml = `<div class="summary-box" style="margin-top:20px; padding:20px; background:#fff; border:1px solid var(--border-color); border-radius:4px;">
                    <h3 style="font-size:16px; font-weight:700; margin-bottom:15px; border-bottom:1px solid #e5e5e5; padding-bottom:10px;">ÖDEME YÖNTEMİ</h3>
                    
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <button type="button" id="btn-pay-cc" onclick="setPaymentMethod('credit_card')" class="btn-addr-type active" style="flex:1; padding:10px; font-size:11px;">KREDİ KARTI</button>
                        <button type="button" id="btn-pay-transfer" onclick="setPaymentMethod('bank_transfer')" class="btn-addr-type" style="flex:1; padding:10px; font-size:11px;">HAVALE / EFT</button>
                    </div>

                    <div id="payment-card-form">
                        <div class="form-group">
                            <label style="font-size:10px;">KART ÜZERİNDEKİ İSİM *</label>
                            <input type="text" id="card-name" class="form-control" placeholder="AD SOYAD" style="padding:8px; font-size:12px;">
                        </div>
                        <div class="form-group">
                            <label style="font-size:10px;">KART NUMARASI *</label>
                            <input type="text" id="card-number" class="form-control" placeholder="0000 0000 0000 0000" style="padding:8px; font-size:12px;">
                        </div>
                        <div class="form-row" style="gap:10px;">
                            <div class="form-group">
                                <label style="font-size:10px;">AY/YIL *</label>
                                <input type="text" id="card-expiry" class="form-control" placeholder="AA/YY" style="padding:8px; font-size:12px;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:10px;">CVV *</label>
                                <input type="text" id="card-cvv" class="form-control" placeholder="000" style="padding:8px; font-size:12px;">
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <img src="/assets/logo.png" style="height:20px; filter:grayscale(1); opacity:0.5;">
                        </div>
                    </div>

                    <div id="payment-transfer-form" style="display:none; padding:15px; background:#f9f9f9; border-radius:4px; font-size:12px; line-height:1.6;">
                        <i class="fa-solid fa-building-columns" style="font-size:24px; color:var(--primary-black); margin-bottom:10px; display:block; text-align:center;"></i>
                        <p style="text-align:center; margin-bottom:15px; font-weight:600;">Aşağıdaki hesaba ödemenizi geçtikten sonra siparişiniz onaylanacaktır.</p>
                        <div style="background:#fff; border:1px solid #e5e5e5; padding:10px; border-radius:4px;">
                            <strong style="color:#000;">Alıcı:</strong> Deer Deri San. ve Tic. Ltd. Şti.<br>
                            <strong style="color:#000;">Banka:</strong> Ziraat Bankası<br>
                            <strong style="color:#000;">IBAN:</strong> TR00 0000 0000 0000 0000 0000 00<br>
                            <span style="font-size:10px; color:#999;">Açıklama kısmına T.C. Kimlik veya Telefon numaranızı yazmayı unutmayın.</span>
                        </div>
                    </div>

                    <div id="payment-cod-msg" style="display:none; padding:15px; background:#f9f9f9; border-radius:4px; text-align:center; border:1px dashed #e5e5e5;">
                        <i class="fa-solid fa-truck-fast" style="font-size:24px; margin-bottom:10px; color:#000;"></i>
                        <p style="font-weight:700; margin-bottom:5px;">Kapıda Ödeme Seçildi</p>
                        <p style="font-size:11px; color:#666;">Ödemenizi teslimatta yapabilirsiniz.</p>
                    </div>
                </div>`;

// Adding required CSS for addr-type-card
const cssAdditions = `
        .addr-type-card {
            border: 1px solid var(--border-color);
            background: #fff;
            padding: 15px 10px;
            text-align: center;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 700;
            transition: all 0.2s;
            color: var(--text-muted);
        }
        .addr-type-card i {
            display: block;
            font-size: 16px;
            margin-bottom: 5px;
            color: inherit;
        }
        .addr-type-card:hover {
            border-color: var(--primary-black);
            color: var(--primary-black);
        }
        .addr-type-card.active {
            border-color: var(--primary-black);
            background: var(--primary-black);
            color: #fff;
        }
        .addr-type-card.active i {
            color: #fff;
        }
`;

html = html.replace(personalInfoOld, personalInfoNew);
html = html.replace(addressOld, addressNew);
html = html.replace(paymentOld, '');

// Insert payment into sidebar right before the SİPARİŞİ TAMAMLA button
const buttonPos = html.indexOf('<button type="button" onclick="processOrder()" class="btn btn-black btn-lg"');
html = html.substring(0, buttonPos) + sidebarPaymentHtml + '\n                ' + html.substring(buttonPos);

// Insert CSS
html = html.replace('</style>', cssAdditions + '\n    </style>');

fs.writeFileSync('checkout.html', html, 'utf8');
console.log('checkout.html HTML changes applied.');
