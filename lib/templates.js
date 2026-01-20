module.exports = {
    'welcome': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Hoş Geldiniz</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
        .main-table { background-color: #ffffff; margin: 0 auto; width: 600px; max-width: 600px; border-spacing: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); }
        .logo-img { display: block; margin: 0 auto; width: 140px; height: auto; }
        .hero-section { background-color: #1a1a1a; background-image: linear-gradient(135deg, #111 0%, #2e2e2e 100%); padding: 60px 40px; text-align: center; color: #ffffff; border-bottom: 4px solid #2E7D32; }
        .welcome-title { font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; color: #ffffff; }
        .welcome-subtitle { font-size: 14px; color: #aaaaaa; letter-spacing: 1px; font-weight: 400; }
        .content-section { padding: 50px 40px; text-align: center; color: #444444; }
        .feature-table { width: 100%; border-spacing: 0; margin-top: 30px; }
        .feature-box { text-align: center; padding: 15px; border: 1px solid #eee; background-color: #fafafa; border-radius: 4px; }
        .feature-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; color: #000; text-transform: uppercase; }
        .feature-text { font-size: 12px; color: #666; line-height: 1.4; }
        .cta-button { background-color: #2E7D32; color: #ffffff; padding: 16px 35px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; border-radius: 3px; display: inline-block; margin-top: 30px; }
        .footer { background-color: #eeeeee; padding: 20px; text-align: center; font-size: 11px; color: #888888; }
        a { color: #2E7D32; text-decoration: none; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main-table" width="600">
            <tr><td style="padding: 30px 0; border-bottom: 1px solid #eeeeee;"><img src="https://www.deerderi.com/assets/logo.png" alt="DEER DERİ" class="logo-img" /></td></tr>
            <tr><td class="hero-section"><h1 class="welcome-title">Hoş Geldiniz</h1><div style="width: 50px; height: 1px; background: #2E7D32; margin: 20px auto;"></div><p class="welcome-subtitle">KALİTE VE ZARAFETİN BULUŞMA NOKTASI</p></td></tr>
            <tr>
                <td class="content-section">
                    <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">Sayın <strong style="color:#000;">{{customerName}}</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.8; color: #666;">DEER DERİ ailesine katıldığınız için teşekkür ederiz. Artık el işçiliğinin modern tasarımla buluştuğu koleksiyonlarımıza, sadece üyelere özel fırsatlara ve kampanyalara öncelikli erişim hakkına sahipsiniz.</p>
                    <table class="feature-table">
                        <tr>
                            <td width="33%" style="padding: 5px;"><div class="feature-box"><div style="font-size:24px; color:#2E7D32; margin-bottom:10px;">★</div><div class="feature-title">Özel Fırsatlar</div><div class="feature-text">Üyelere özel indirimler</div></div></td>
                            <td width="33%" style="padding: 5px;"><div class="feature-box"><div style="font-size:24px; color:#2E7D32; margin-bottom:10px;">✈</div><div class="feature-title">Hızlı Kargo</div><div class="feature-text">Öncelikli gönderim</div></div></td>
                            <td width="33%" style="padding: 5px;"><div class="feature-box"><div style="font-size:24px; color:#2E7D32; margin-bottom:10px;">♥</div><div class="feature-title">Favoriler</div><div class="feature-text">İstek listesi oluşturma</div></div></td>
                        </tr>
                    </table>
                    <br /><br />
                    <a href="https://www.deerderi.com/" class="cta-button">KOLEKSİYONU KEŞFET</a>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>DEER DERİ - Kadim Mirasın İzinde</p>
                    <p><a href="https://www.deerderi.com/">Anasayfa</a> &nbsp;|&nbsp; <a href="https://www.deerderi.com/account.html">Hesabım</a> &nbsp;|&nbsp; <a href="https://www.deerderi.com/contact.html">İletişim</a></p>
                    <p>© 2026 Tüm Hakları Saklıdır.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`,
    'order-confirmation': `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Siparişiniz Alındı</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f6f6f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f6f6f6; padding-bottom: 40px; padding-top: 20px; }
        .main-table { background-color: #ffffff; margin: 0 auto; width: 600px; max-width: 600px; border-spacing: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); border-radius: 8px; overflow: hidden; }
        .header { background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .logo-img { width: 120px; height: auto; display: block; margin: 0 auto; }
        .success-banner { background-color: #1B5E20; color: #ffffff; text-align: center; padding: 15px; font-weight: bold; letter-spacing: 1px; font-size: 14px; text-transform: uppercase; }
        .order-info-bg { background-color: #f9f9f9; padding: 25px 40px; border-bottom: 1px dashed #e0e0e0; }
        .order-title { font-size: 22px; color: #111; font-weight: 700; margin: 0 0 5px 0; }
        .order-subtitle { font-size: 14px; color: #666; margin: 0; }
        .product-row { padding: 20px 40px; border-bottom: 1px solid #eeeeee; }
        .product-img-box { width: 80px; height: 80px; border: 1px solid #eee; border-radius: 6px; overflow: hidden; background-color: #fff; display: block; }
        .product-img { width: 100%; height: 100%; object-fit: cover; border: 0; display: block; }
        .product-name { font-size: 16px; font-weight: 600; color: #111; margin-bottom: 4px; display: block; text-decoration: none; }
        .product-meta { font-size: 13px; color: #888; display: block; margin-bottom: 8px; }
        .product-price { font-size: 16px; font-weight: 700; color: #111; }
        .totals-area { background-color: #FAFAFA; padding: 25px 40px; }
        .total-row td { padding: 6px 0; font-size: 14px; color: #555; }
        .final-total td { border-top: 1px solid #ddd; padding-top: 15px; margin-top: 10px; font-size: 18px; font-weight: 700; color: #2E7D32; }
        .address-box { padding: 30px 40px; background-color: #ffffff; border-top: 1px solid #eeeeee; font-size: 14px; line-height: 1.6; color: #444; }
        .address-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 5px; display: inline-block; }
        .btn-green { display: inline-block; background-color: #111; color: #fff; padding: 14px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 14px; }
        .footer { text-align: center; color: #999; font-size: 11px; padding: 30px 40px; background: #f6f6f6; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main-table" width="600">
            <tr><td class="header"><img src="https://www.deerderi.com/assets/logo.png" alt="DEER DERİ" class="logo-img" /></td></tr>
            <tr><td class="success-banner">Siparişiniz Başarıyla Alındı</td></tr>
            <tr>
                <td class="order-info-bg">
                    <table width="100%">
                        <tr>
                            <td align="left"><h2 class="order-title">Teşekkürler, {{customerName}}</h2><p class="order-subtitle">Siparişiniz hazırlanmaya başladı.</p></td>
                            <td align="right" style="vertical-align: top;"><div style="background:#fff; border:1px solid #ddd; padding:8px 12px; border-radius:4px; font-size:13px; font-weight:bold; color:#555;">#{{orderNumber}}</div></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table width="100%" cellspacing="0" cellpadding="0">
                        {{#products}}
                        <tr>
                            <td class="product-row">
                                <table width="100%">
                                    <tr>
                                        <td width="90" valign="top"><div class="product-img-box"><img src="{{image}}" alt="Ürün Görseli" class="product-img" onerror="this.src='https://www.deerderi.com/assets/placeholder_product.jpg'" /></div></td>
                                        <td valign="top" style="padding-left: 15px;"><span class="product-name">{{name}}</span><span class="product-meta">Adet: {{quantity}}</span></td>
                                        <td valign="top" align="right" style="padding-left: 10px;"><span class="product-price">{{price}}₺</span></td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        {{/products}}
                    </table>
                </td>
            </tr>
            <tr>
                <td class="totals-area">
                    <table width="100%">
                        <tr class="total-row"><td align="right">Ara Toplam:</td><td align="right" width="100"><strong>{{subtotal}}₺</strong></td></tr>
                        <tr class="total-row"><td align="right">Kargo:</td><td align="right"><strong>{{shipping}}₺</strong></td></tr>
                        <tr class="total-row final-total"><td align="right">GENEL TOPLAM:</td><td align="right">{{total}}₺</td></tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="address-box">
                    <table width="100%">
                        <tr>
                            <td width="60%" valign="top"><div class="address-title">TESLİMAT ADRESİ</div><div style="margin-top:10px;"><strong>{{deliveryName}}</strong><br />{{deliveryAddress}}<br />{{deliveryDistrict}} / {{deliveryCity}}<br /><span style="color:#777; font-size:12px;">{{deliveryPhone}}</span></div></td>
                            <td width="40%" valign="middle" align="right"><a href="https://www.deerderi.com/account.html" class="btn-green">SİPARİŞİ TAKİP ET</a></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr><td class="footer">DEER DERİ - Eşsiz Deri Deneyimi<br />Bu mail otomatik olarak gönderilmiştir.</td></tr>
        </table>
    </center>
</body>
</html>`,
    'admin-notification': `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Yeni Sipariş Bildirimi</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border-top: 5px solid #000; }
        .header { padding: 25px; text-align: center; border-bottom: 1px solid #eee; }
        .logo { height: 30px; }
        .alert-box { background: #E8F5E9; border-left: 5px solid #2E7D32; padding: 20px; margin: 30px; border-radius: 4px; }
        .alert-title { font-weight: 700; font-size: 18px; color: #1B5E20; margin-bottom: 5px; }
        .content { padding: 0 30px 40px; }
        .section-header { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; letter-spacing: 1px; margin: 25px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; border-bottom: 1px dashed #eee; padding-bottom: 8px; }
        .info-label { color: #666; }
        .info-val { font-weight: 600; color: #000; }
        .p-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .p-table td { padding: 8px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top; font-size: 14px; }
        .btn { display: block; width: 100%; text-align: center; background-color: #000; color: #fff; text-decoration: none; padding: 15px 0; margin-top: 30px; font-weight: 600; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><img src="https://www.deerderi.com/assets/logo.png" alt="DEER DERİ" class="logo"></div>
        <div class="alert-box"><div class="alert-title">🔔 Yeni Sipariş Alındı!</div><div>Sipariş No: <strong>#{{orderNumber}}</strong></div></div>
        <div class="content">
            <div class="section-header">MÜŞTERİ</div>
            <div class="info-row"><span class="info-label">Ad Soyad:</span> <span class="info-val">{{customerName}}</span></div>
            <div class="info-row"><span class="info-label">E-posta:</span> <span class="info-val">{{customerEmail}}</span></div>
            <div class="info-row"><span class="info-label">Telefon:</span> <span class="info-val">{{customerPhone}}</span></div>
            <div class="section-header">SİPARİŞ İÇERİĞİ</div>
            <table class="p-table">
                {{#products}}
                <tr><td><b style="color:#2E7D32;">{{quantity}}x</b> {{name}}</td><td style="text-align:right;">{{price}}₺</td></tr>
                {{/products}}
            </table>
            <div style="text-align:right; font-size:18px; font-weight:700; margin-top:15px;">Toplam: <span style="color:#2E7D32;">{{total}}₺</span></div>
            <a href="https://www.deerderi.com/yonetim" class="btn">ADMİN PANELİNE GİT</a>
        </div>
    </div>
</body>
</html>`
};
