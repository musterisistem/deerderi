const fs = require('fs');
let html = fs.readFileSync('checkout.html', 'utf8');

const newContent = `        <div class="checkout-grid" style="grid-template-columns: 1.8fr 1fr; gap: 40px; margin-top: 40px;">
            <!-- Left: One-Page Forms -->
            <div class="checkout-main">
                
                <h1 style="font-family: var(--v6-font); font-size: 28px; font-weight: 800; margin-bottom: 30px; letter-spacing: -0.5px;">ÖDEME YAP</h1>

                <!-- SECTION: TESLİMAT ADRESİ -->
                <div class="checkout-section" style="padding: 40px; margin-bottom: 30px; border: 1px solid var(--border-color); background: #fff;">
                    <div class="section-header" style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: baseline;">
                        <h2 class="section-title" style="font-family: var(--v6-font); font-size: 18px; font-weight: 800; text-transform: uppercase;">1. Teslimat Adresi</h2>
                        <a href="javascript:void(0)" onclick="openCheckoutLogin()" id="checkout-login-link" style="font-size:12px; font-weight:700; color:#000; text-decoration:underline;">ZATEN ÜYE MİSİNİZ? GİRİŞ YAPIN</a>
                    </div>

                    <!-- GUEST INFO FORM -->
                    <div id="checkout-guest-info" style="margin-bottom: 25px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">ADINIZ</label>
                                <input type="text" id="guest-name" class="form-control" placeholder="Adınız" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                            </div>
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">SOYADINIZ</label>
                                <input type="text" id="guest-surname" class="form-control" placeholder="Soyadınız" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">E-POSTA</label>
                                <input type="email" id="guest-email" class="form-control" placeholder="E-posta Adresiniz" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                            </div>
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">TELEFON</label>
                                <input type="tel" id="guest-phone" class="form-control" placeholder="05XX XXX XX XX" maxlength="11" oninput="this.value = this.value.replace(/[^0-9]/g, '').substring(0, 11)" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                            </div>
                        </div>
                    </div>

                    <!-- SAVED ADDRESSES (Member Only) -->
                    <div id="checkout-saved-addresses" style="display:none; margin-bottom:30px;">
                        <div class="saved-address-grid" id="saved-address-list">
                            <!-- Cards injected by JS -->
                        </div>
                        <a href="javascript:void(0)" onclick="toggleNewAddressForm()" class="add-new-addr-link" style="font-family: var(--v6-font); font-size: 13px; font-weight: 700;">
                            <i class="fa-solid fa-plus"></i> YENİ ADRES EKLE
                        </a>
                    </div>

                    <!-- ADDRESS FORM -->
                    <div id="checkout-address-form">
                        <div class="form-group">
                            <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">TAM ADRES</label>
                            <textarea id="addr-text-input" class="form-control" rows="3" placeholder="Mahalle, sokak, bina ve daire no..." style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px; resize: vertical;"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">ŞEHİR</label>
                                <select id="city-select" class="form-control" onchange="loadDistricts()" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                                    <option value="">Seçiniz</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">İLÇE</label>
                                <select id="district-select" class="form-control" disabled style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                                    <option value="">Önce Şehir Seçiniz</option>
                                </select>
                            </div>
                        </div>
                        <input type="hidden" id="addr-title-input" value="Teslimat Adresi">
                    </div>
                </div>

                <!-- SECTION: KARGO SEÇİMİ -->
                <div class="checkout-section" style="padding: 40px; margin-bottom: 30px; border: 1px solid var(--border-color); background: #fff;">
                    <div class="section-header" style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
                        <h2 class="section-title" style="font-family: var(--v6-font); font-size: 18px; font-weight: 800; text-transform: uppercase;">2. Kargo Seçimi</h2>
                    </div>
                    <div class="shipping-list">
                        <div class="shipping-card selected" onclick="selectShipping('standard')" style="border: 2px solid #000; padding: 20px;">
                            <input type="radio" name="shipping" value="standard" checked style="accent-color: #000; width: 20px; height: 20px;">
                            <div class="shipping-info" style="margin-left: 15px;">
                                <span class="shipping-title" style="font-family: var(--v6-font); font-weight: 800; font-size: 15px;">Standart Kargo</span>
                                <span class="shipping-desc" style="font-size: 12px; color: #666; display: block;">2-3 iş günü içinde teslimat.</span>
                            </div>
                            <div class="shipping-price" style="font-family: var(--v6-font); font-weight: 800; font-size: 16px;">+100₺</div>
                        </div>
                        <div class="shipping-card" onclick="selectShipping('door')" style="border: 1px solid var(--border-color); padding: 20px;">
                            <input type="radio" name="shipping" value="door" style="accent-color: #000; width: 20px; height: 20px;">
                            <div class="shipping-info" style="margin-left: 15px;">
                                <span class="shipping-title" style="font-family: var(--v6-font); font-weight: 800; font-size: 15px;">Kapıda Ödeme</span>
                                <span class="shipping-desc" style="font-size: 12px; color: #666; display: block;">Teslimat anında nakit/kart ile ödeme.</span>
                            </div>
                            <div class="shipping-price" style="font-family: var(--v6-font); font-weight: 800; font-size: 16px;">+50₺</div>
                        </div>
                    </div>
                </div>

                <!-- SECTION: ÖDEME BİLGİLERİ -->
                <div class="checkout-section" style="padding: 40px; margin-bottom: 30px; border: 1px solid var(--border-color); background: #fff;">
                    <div class="section-header" style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
                        <h2 class="section-title" style="font-family: var(--v6-font); font-size: 18px; font-weight: 800; text-transform: uppercase;">3. Ödeme Bilgileri</h2>
                    </div>

                    <!-- Card Form -->
                    <div id="payment-card-form">
                        <div class="form-group">
                            <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">KART ÜZERİNDEKİ İSİM</label>
                            <input type="text" id="card-name" class="form-control" placeholder="AD SOYAD" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px; letter-spacing: 1px;">
                        </div>
                        <div class="form-group">
                            <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">KART NUMARASI</label>
                            <input type="text" id="card-number" class="form-control" placeholder="0000 0000 0000 0000" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px; letter-spacing: 2px;">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">SON KULLANMA</label>
                                <input type="text" id="card-expiry" class="form-control" placeholder="AA/YY" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                            </div>
                            <div class="form-group">
                                <label style="font-family: var(--v6-font); font-weight: 700; font-size: 11px;">CVV</label>
                                <input type="text" id="card-cvv" class="form-control" placeholder="000" style="border-radius: 0; background: #fafafa; border: 1px solid #e5e5e5; padding: 15px;">
                            </div>
                        </div>
                    </div>

                    <!-- COD Message -->
                    <div id="payment-cod-msg" style="display:none; padding:30px; background:#fafafa; border:1px solid #e5e5e5; text-align:center;">
                        <i class="fa-solid fa-truck-fast" style="font-size:32px; margin-bottom:15px; color:#000;"></i>
                        <p style="font-weight:800; margin-bottom:5px; font-size: 16px;">Kapıda Ödeme Seçildi</p>
                        <p style="font-size:13px; color:#666;">Ödemenizi ürün teslimatında yapacaksınız.</p>
                    </div>
                </div>

                <button type="button" onclick="processOrder()" class="btn btn-black" style="width: 100%; padding: 20px; font-size: 16px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                    SİPARİŞİ ONAYLA VE BİTİR
                </button>
            </div>

            <!-- Right: Order Summary Sidebar -->
            <div class="checkout-sidebar" style="position: sticky; top: 140px; height: fit-content;">
                <div class="summary-box" style="padding: 40px; background: #fafafa; border: 1px solid var(--border-color);">
                    <h3 style="font-family: var(--v6-font); font-size:18px; font-weight:800; margin-bottom:20px; border-bottom:2px solid #000; padding-bottom:15px; text-transform: uppercase;">
                        SİPARİŞ ÖZETİ
                    </h3>

                    <div id="checkout-summary-items" style="margin-bottom:30px; max-height:400px; overflow-y:auto; padding-right: 10px;">
                        <!-- Items injected by JS -->
                    </div>

                    <div class="summary-totals" style="border-top:1px solid #e5e5e5; padding-top:20px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size: 14px;">
                            <span style="color:#666; font-weight: 500;">Ara Toplam</span>
                            <span id="summary-subtotal" style="font-weight:700;">0₺</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size: 14px;">
                            <span style="color:#666; font-weight: 500;">Kargo Ücreti</span>
                            <span id="summary-shipping" style="font-weight:700;">0₺</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:2px solid #000; font-size:20px; font-weight:900;">
                            <span>TOPLAM</span>
                            <span id="summary-total-price">0₺</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top:20px; padding:20px; background:#fff; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;">
                    <i class="fa-solid fa-lock" style="font-size:20px; color:#000;"></i>
                    <div style="font-size:12px; line-height:1.4; color: #666;">
                        <strong style="color: #000;">256-Bit SSL Güvenli Ödeme</strong><br>
                        Bilgileriniz şifrelenerek korunmaktadır.
                    </div>
                </div>
            </div>
        </div>`;

const regex = /<!-- New 3-Step Progress -->[\s\S]*?<!-- Success Popup/;
if(regex.test(html)) {
    html = html.replace(regex, newContent + '\n    <!-- Success Popup');
    fs.writeFileSync('checkout.html', html);
    console.log('Replaced layout successfully.');
} else {
    console.log('Regex did not match.');
}
