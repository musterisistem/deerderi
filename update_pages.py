#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to add Google verification meta tag and standardized footer to HTML pages
"""

import re
import os

# Google verification meta tag
GOOGLE_META = '    <meta name="google-site-verification" content="kLmZs2xRHV_V-byOVIHxyP3cAKrClsnj0JUWQRgfgBM" />\n'

# Standard footer HTML
FOOTER_HTML = """    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>DEER DERİ</h4>
                    <p style="color:#ccc; font-size:14px; margin-bottom: 20px;">
                        Kadim mirasın izinde, ustalığın ve doğallığın buluştuğu nokta.
                        Hikayenizin bir parçası olacak ömürlük eşyalar üretiyoruz.
                    </p>
                    <div class="social-icons" style="font-size: 20px; gap: 15px; display: flex;">
                        <a href="#"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#"><i class="fa-brands fa-facebook"></i></a>
                        <a href="#"><i class="fa-brands fa-pinterest"></i></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Katalog</h4>
                    <ul class="footer-links">
                        <li><a href="#">Yeni Gelenler</a></li>
                        <li><a href="#">Çantalar</a></li>
                        <li><a href="#">Cüzdanlar</a></li>
                        <li><a href="#">Aksesuarlar</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Kurumsal</h4>
                    <ul class="footer-links">
                        <li><a href="#">Hakkımızda</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">İletişim</a></li>
                        <li><a href="#">Toptan Satış</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Yardım</h4>
                    <ul class="footer-links">
                        <li><a href="#">Sıkça Sorulan Sorular</a></li>
                        <li><a href="#">Kargo ve İade</a></li>
                        <li><a href="#">Gizlilik Politikası</a></li>
                        <li><a href="#">Mesafeli Satış Sözleşmesi</a></li>
                    </ul>
                </div>
            </div>

            <!-- SEO Content Section -->
            <div class="footer-seo-section" style="margin-top: 40px; padding-top: 50px; border-top: 1px solid #333;">
                <div style="max-width: 900px; margin: 0 auto; text-align: center;">
                    <h3 style="color: #fff; font-size: 18px; margin-bottom: 15px; font-weight: 600;">Hakiki Deri Ürünleri ile Farkı Keşfedin</h3>
                    <p style="color: #999; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
                        DEER DERİ olarak, birinci sınıf hakiki deri <strong>deri çanta</strong>, <strong>deri cüzdan</strong>, <strong>deri kartlık</strong> ve <strong>deri telefon kılıfı</strong> ürünleri ile zarafeti ve kaliteyi bir araya getiriyoruz. 
                        El işçiliği ile özenle üretilen her bir <strong>deri ürünü</strong>, dayanıklılığı ve şıklığı ile ömür boyu yanınızda olacak. 
                        En kaliteli <strong>deri çanta ürünleri</strong>ni keşfetmek ve hayalinizdeki deri ürünü satın almak için koleksiyonumuzu inceleyin.
                    </p>
                    <div class="seo-keywords" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                        <a href="/kategori/canta" class="keyword-btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">Deri Çanta Ürünleri</a>
                        <a href="/kategori/cuzdan" class="keyword-btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">Deri Cüzdan Ürünleri</a>
                        <a href="/kategori/kartlik" class="keyword-btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">Deri Kartlık Ürünleri</a>
                        <a href="/kategori/teknoloji" class="keyword-btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">Deri Telefon Kılıfı Ürünleri</a>
                        <a href="/" class="keyword-btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">Hakiki Deri Ürünleri</a>
                    </div>
                </div>
            </div>

            <div class="bottom-bar">
                <div>&copy; 2026 DEER DERİ. Tüm hakları saklıdır. | Web: <a href="https://bursawebtasarimhizmeti.com.tr/" target="_blank" rel="noopener" style="color: #fff; text-decoration: none; font-weight: 600;">Bursa Web Tasarım</a></div>
                <div class="payment-icons" style="font-size: 24px; gap: 10px; display: flex;">
                    <i class="fa-brands fa-cc-visa"></i>
                    <i class="fa-brands fa-cc-mastercard"></i>
                    <i class="fa-brands fa-cc-amex"></i>
                </div>
            </div>
        </div>
    </footer>
"""

# Files to update (excluding index.html, product.html, category.html which are already updated)
FILES_TO_UPDATE = [
    'checkout.html',
    'cart.html',
    'contact.html',
    'register.html',
    'success.html',
    'account.html'
]

def update_html_file(filepath):
    """Update a single HTML file"""
    if not os.path.exists(filepath):
        print(f"⚠️ File not found: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    updated = False
    
    # 1. Add Google verification meta tag if not present
    if 'google-site-verification' not in content:
        # Find the viewport meta tag and add after it
        content = re.sub(
            r'(<meta name="viewport"[^>]*>)\s*\n',
            r'\1\n' + GOOGLE_META,
            content,
            count=1
        )
        updated = True
        print(f"  ✅ Added Google verification tag")
    
    # 2. Add or replace footer
    # Check if there's already a footer
    if '<footer>' in content:
        # Replace existing footer
        content = re.sub(
            r'<footer>.*?</footer>',
            FOOTER_HTML,
            content,
            flags=re.DOTALL
        )
        print(f"  ✅ Updated footer")
        updated = True
    else:
        # Add footer before </body>
        if '</body>' in content:
            content = content.replace('</body>', FOOTER_HTML + '\n</body>')
            print(f"  ✅ Added footer")
            updated = True
        else:
            print(f"  ⚠️ No </body> tag found, skipping footer")
    
    # Write back
    if updated:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    else:
        print(f"  ℹ️ No changes needed")
        return False

def main():
    """Main function"""
    print("🚀 Starting HTML pages update...\n")
    
    updated_count = 0
    for filename in FILES_TO_UPDATE:
        filepath = os.path.join(os.path.dirname(__file__), filename)
        print(f"📄 Processing: {filename}")
        if update_html_file(filepath):
            updated_count += 1
        print()
    
    print(f"✅ Complete! Updated {updated_count}/{len(FILES_TO_UPDATE)} files")

if __name__ == '__main__':
    main()
