// === SEO HELPER FUNCTIONS ===
// Generate SEO-friendly slug from text (Turkish character support)
function slugifyText(text) {
    if (!text) return '';
    const trMap = {
        'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
    };
    let result = text.toLowerCase();
    for (let key in trMap) {
        result = result.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return result
        .replace(/[^-a-zA-Z0-9\s]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Get product URL - using legacy format for compatibility
function getProductUrl(product) {
    if (!product) return '/';
    // If we have a server route for slug, use it
    const slug = product.slug || slugifyText(product.name);
    return '/urun-' + slug;
}

// Make functions available globally
window.slugifyText = slugifyText;
window.getProductUrl = getProductUrl;

document.addEventListener('DOMContentLoaded', function () {

    // --- GLOBAL PAGE LOADER ---
    const loaderHTML = `
        <div id="global-loader">
            <div class="loader-spinner"></div>
            <div style="font-family: var(--font-heading); font-size: 14px; letter-spacing: 2px; color: var(--primary-color);">DEER DERİ</div>
        </div>
    `;
    if (!document.getElementById('global-loader')) {
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    window.showLoader = () => {
        const l = document.getElementById('global-loader');
        if (l) l.classList.remove('hidden');
    };

    window.hideLoader = () => {
        const l = document.getElementById('global-loader');
        if (l) {
            setTimeout(() => {
                l.classList.add('hidden');
            }, 300);
        }
    };

    // Auto-hide loader on window load (EXCEPT on product pages which handle it manually)
    const isProductPage = window.location.pathname.includes('product.html') || window.location.pathname.includes('/urun-');
    if (!isProductPage) {
        window.addEventListener('load', window.hideLoader);
        // Fallback safety
        setTimeout(window.hideLoader, 3000);
    }

    // --- SEED DATA IF MISSING ---
    // Ensure we have categories and products in localStorage for the site to work off-the-bat
    if (!localStorage.getItem('deerDeriCategories')) {
        // Seed from data.js 'products' if available
        if (typeof products !== 'undefined') {
            const uniqueCats = Array.from(new Set(products.map(p => p.category))).map(name => ({
                id: name, // slug-like id from data.js (e.g. 'canta', 'cuzdan')
                name: name.charAt(0).toUpperCase() + name.slice(1) // Capitalize
            }));
            localStorage.setItem('deerDeriCategories', JSON.stringify(uniqueCats));
        }
    }

    // Seed Mosaic Items if missing
    if (!localStorage.getItem('deerDeriMosaicItems')) {
        const defaultMosaic = [
            { id: '1', title: 'ÇANTALAR', subtitle: 'Zamansız Şıklık', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/canta', buttonText: 'KEŞFET' },
            { id: '2', title: 'CÜZDANLAR', subtitle: 'Günlük Lüks', image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/cuzdan', buttonText: 'İNCELE' },
            { id: '3', title: 'AKSESUARLAR', subtitle: 'Tarzını Tamamla', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/aksesuar', buttonText: 'GÖZ AT' }
        ];
        localStorage.setItem('deerDeriMosaicItems', JSON.stringify(defaultMosaic));
    }
    // --- DATA SYNC (CSV IMPORT) ---
    // Force update from data.js to reflect CSV changes
    if (typeof products !== 'undefined') {
        localStorage.setItem('deerDeriProducts', JSON.stringify(products));

        // Also update categories to match new products
        const uniqueCats = Array.from(new Set(products.map(p => p.category))).map(name => ({
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1)
        }));
        localStorage.setItem('deerDeriCategories', JSON.stringify(uniqueCats));
    }

    // --- CUSTOM MENU RENDERING ---
    // Renders custom menu items from admin panel
    renderCustomMenu(); // Call immediately

    function renderCustomMenu() {
        const desktopNav = document.querySelector('.nav-desktop');
        if (!desktopNav) return;

        // Load menu items from localStorage
        let menuItems = [];
        try {
            menuItems = JSON.parse(localStorage.getItem('deerDeriMenuItems')) || [];
        } catch (e) {
            console.error('Error loading menu items', e);
        }

        // Filter active and sort by order
        const activeMenus = menuItems.filter(m => m.active).sort((a, b) => a.order - b.order);

        // Render desktop navigation
        if (activeMenus.length > 0) {
            let html = '';
            activeMenus.forEach(menu => {
                html += `
                <div class="nav-item">
                    <a href="${menu.url}" class="nav-link">${menu.title}</a>
                </div>`;
            });
            desktopNav.innerHTML = html;
        } else {
            // Fallback if no menu items exist
            desktopNav.innerHTML = `
                <div class="nav-item">
                    <a href="/kategori/kartlik" class="nav-link">KARTLIK</a>
                </div>
                <div class="nav-item">
                    <a href="/kategori/cuzdan" class="nav-link">CÜZDAN</a>
                </div>
                <div class="nav-item">
                    <a href="/kategori/canta" class="nav-link">ÇANTA</a>
                </div>
                <div class="nav-item">
                    <a href="/kategori/teknoloji" class="nav-link">TEKNOLOJİ</a>
                </div>
            `;
        }
    }

    // --- Hero Slider Logic ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 6000;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    if (slides.length > 1) {
        setInterval(nextSlide, slideInterval);
    }

    // --- Sticky Header Logic Removed to prevent layout jumps ---
    // The CSS position: sticky handles the sticking behavior without resizing.

    // --- FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                item.classList.toggle('active');
                // Close others
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherIcon = otherItem.querySelector('.faq-question i');
                        if (otherIcon) {
                            otherIcon.classList.remove('fa-minus');
                            otherIcon.classList.add('fa-plus');
                        }
                    }
                });
                // Toggle Icon
                const icon = question.querySelector('i');
                if (icon) {
                    if (item.classList.contains('active')) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    } else {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                }
            });
        }
    });

    // --- Dynamic Creative Mosaic (Vitrin) ---
    // --- Dynamic Creative Mosaic (Vitrin) ---
    function renderMosaicSection() {
        const mosaicSection = document.getElementById('creative-mosaic');
        if (!mosaicSection) return;

        const mosaicGrid = mosaicSection.querySelector('.mosaic-grid');
        if (!mosaicGrid) return;

        // Get from localStorage or use defaults
        let items = [];
        const localMosaic = localStorage.getItem('deerDeriMosaicItems');

        if (localMosaic) {
            try {
                items = JSON.parse(localMosaic);
            } catch (e) {
                console.error('Error parsing mosaic:', e);
                items = [];
            }
        }

        // If still empty AND local storage was null (meaning not just deleted, but never set)
        if (items.length === 0 && !localMosaic) {
            items = [
                { id: '1', title: 'ÇANTALAR', subtitle: 'Zamansız Şıklık', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/canta', buttonText: 'KEŞFET', titleColor: '#ffffff' },
                { id: '2', title: 'CÜZDANLAR', subtitle: 'Günlük Lüks', image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/cuzdan', buttonText: 'İNCELE', titleColor: '#ffffff' },
                { id: '3', title: 'AKSESUARLAR', subtitle: 'Tarzını Tamamla', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/aksesuar', buttonText: 'GÖZ AT', titleColor: '#ffffff' }
            ];
            // Since script.js shouldn't strictly write unless authoriazed, we might just use defaults for display
            // But to be consistent with admin we can save it:
            localStorage.setItem('deerDeriMosaicItems', JSON.stringify(items));
        }

        // Render items
        let html = '';
        items.forEach((item, index) => {
            // Slight delay for animation effect if updating live
            const delay = index * 0.1;
            html += `
                <a href="${item.url}" class="mosaic-item" style="animation: fadeIn 0.5s ease backwards ${delay}s">
                    <img src="${item.image}" alt="${item.title}" class="mosaic-img">
                    <div class="mosaic-overlay"></div>
                    <div class="mosaic-content">
                        <p class="mosaic-subtitle">${item.subtitle || ''}</p>
                        <h2 class="mosaic-title" style="color: ${item.titleColor || '#ffffff'};">${item.title}</h2>
                        <span class="mosaic-btn">${item.buttonText || 'İNCELE'}</span>
                    </div>
                </a>
            `;
        });
        mosaicGrid.innerHTML = html;
    }

    // Initial render
    renderMosaicSection();

    // Listen for changes from Admin Panel (Cross-tab)
    window.addEventListener('storage', function (e) {
        if (e.key === 'deerDeriMosaicItems') {
            console.log('Mosaic items updated from another tab, re-rendering...');
            renderMosaicSection();
        }
    });

    // --- Product Rendering Logic (Homepage) ---
    // Use products from localStorage if available
    const localProducts = localStorage.getItem('deerDeriProducts');
    const productsData = localProducts ? JSON.parse(localProducts) : (typeof products !== 'undefined' ? products : []);

    if (productsData.length > 0) {

        // 1. Random 8 Items for "KADİM HİSLERLE DOLU"
        const randomGrid = document.getElementById('random-product-grid');
        if (randomGrid) {
            const shuffled = [...productsData].sort(() => 0.5 - Math.random());
            renderSpecificGrid(randomGrid, shuffled.slice(0, 8));
        }

        // 2. Bags 4 Items for "ÇANTA"
        const bagGrid = document.getElementById('bag-product-grid');
        if (bagGrid) {
            const bagProducts = productsData.filter(p => p.category === 'canta');
            renderSpecificGrid(bagGrid, bagProducts.slice(0, 4));
        }

        // 3. Wallets 4 Items for "CÜZDAN"
        const walletGrid = document.getElementById('wallet-product-grid');
        if (walletGrid) {
            const walletProducts = productsData.filter(p => p.category === 'cuzdan');
            renderSpecificGrid(walletGrid, walletProducts.slice(0, 4));
        }

        // 4. Card Holders 4 Items for "KARTLIK"
        const cardGrid = document.getElementById('cardholder-product-grid');
        if (cardGrid) {
            const cardProducts = productsData.filter(p => p.category === 'kartlik');
            renderSpecificGrid(cardGrid, cardProducts.slice(0, 4));
        }

        // 5. Tech 4 Items for "TEKNOLOJİ"
        const techGrid = document.getElementById('tech-product-grid');
        if (techGrid) {
            const techProducts = productsData.filter(p => p.category === 'teknoloji');
            renderSpecificGrid(techGrid, techProducts.slice(0, 4));
        }

        // Shared Click Listener for all Add to Carts
        document.body.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('add-to-cart-listing')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                const product = productsData.find(p => p.id === id);
                if (product) {
                    window.addToCart(product);
                }
            }
        });
    }

    function renderSpecificGrid(container, items) {
        if (!container) return;
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1;">Bu kategoride ürün bulunamadı.</p>';
            return;
        }

        items.forEach(product => {
            let badgeHtml = '';
            if (product.badge) {
                let badgeClass = 'badge-new';
                if (product.badge.includes('İNDİRİM') || product.badge.includes('FIRSAT')) {
                    badgeClass = 'badge-sale';
                }
                badgeHtml = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
            }

            // Generate Star Rating HTML
            let starsHtml = '';
            const rating = product.rating || 5;
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) {
                    starsHtml += '<i class="fa-solid fa-star checked"></i>';
                } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                    starsHtml += '<i class="fa-solid fa-star-half-stroke checked"></i>';
                } else {
                    starsHtml += '<i class="fa-regular fa-star"></i>';
                }
            }

            let priceHtml = '';
            if (product.oldPrice) {
                priceHtml = `
                    <div class="price-container">
                        <span class="price-old">${formatPrice(product.oldPrice)}₺</span>
                        <span class="price-current">${formatPrice(product.price)}₺</span>
                        <span class="vat-text">(KDV Dahil)</span>
                    </div>`;
            } else {
                priceHtml = `
                    <div class="price-container">
                        <span class="price-current">${formatPrice(product.price)}₺</span>
                        <span class="vat-text">(KDV Dahil)</span>
                    </div>`;
            }

            // Image Slider Logic
            let imageList = product.images && product.images.length > 0 ? product.images : [product.image];
            let imagesHtml = '';
            imageList.forEach((imgSrc, index) => {
                const activeClass = index === 0 ? 'active' : '';
                imagesHtml += `<img src="${imgSrc}" class="slide-img ${activeClass}" data-index="${index}" alt="${product.name}">`;
            });

            // Indicators
            let indicatorsHtml = '';
            if (imageList.length > 1) {
                indicatorsHtml = '<div class="slider-indicators">';
                imageList.forEach((_, index) => {
                    const activeClass = index === 0 ? 'active' : '';
                    indicatorsHtml += `<div class="slider-bar ${activeClass}" data-index="${index}"></div>`;
                });
                indicatorsHtml += '</div>';
            }

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const productUrl = getProductUrl(product);
            productCard.innerHTML = `
                <a href="${productUrl}">
                    <div class="product-thumb" data-image-count="${imageList.length}">
                        ${badgeHtml}
                        ${imagesHtml}
                        ${indicatorsHtml}
                    </div>
                </a>
                <div class="product-details">
                    <div class="star-rating">${starsHtml}</div>
                    <h3 class="product-name"><a href="${productUrl}">${product.name}</a></h3>
                    <div class="product-price">${priceHtml}</div>
                    <button class="btn btn-primary btn-sm add-to-cart-listing" data-id="${product.id}" style="width: 100%; margin-top: 10px;">SEPETE EKLE</button>
                </div>
            `;
            container.appendChild(productCard);

            // Add Event Listener for Mouse Move Slider
            const thumb = productCard.querySelector('.product-thumb');
            if (thumb && imageList.length > 1) {
                const images = thumb.querySelectorAll('.slide-img');
                const bars = thumb.querySelectorAll('.slider-bar');

                thumb.addEventListener('mousemove', (e) => {
                    const rect = thumb.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const width = rect.width;
                    const count = imageList.length;
                    let index = Math.floor((x / width) * count);
                    if (index < 0) index = 0;
                    if (index >= count) index = count - 1;

                    images.forEach(img => img.classList.remove('active'));
                    if (images[index]) images[index].classList.add('active');

                    bars.forEach(bar => bar.classList.remove('active'));
                    if (bars[index]) bars[index].classList.add('active');
                });

                thumb.addEventListener('mouseleave', () => {
                    // Reset to first image
                    images.forEach((img, idx) => {
                        if (idx === 0) img.classList.add('active');
                        else img.classList.remove('active');
                    });
                    bars.forEach((bar, idx) => {
                        if (idx === 0) bar.classList.add('active');
                        else bar.classList.remove('active');
                    });
                });
            }
        });
    }

    function formatPrice(price) {
        if (!price) return "0";
        // Ensure price is a number for toLocaleString
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return price;

        // Format with Turkish locale (dots for thousands, comma for decimals)
        // maximumFractionDigits: 2 to handle cents if needed, or 0 if integers usually
        // Based on "799.9", we likely want decimals.
        // Let's stick to standard formatting which usually allows 2 decimals.
        return numPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    }

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navDesktop = document.querySelector('.nav-desktop');

    if (mobileToggle && navDesktop) {
        mobileToggle.addEventListener('click', () => {
            if (navDesktop.style.display === 'flex') {
                navDesktop.style.display = 'none';
            } else {
                navDesktop.style.display = 'flex';
                navDesktop.style.flexDirection = 'column';
                navDesktop.style.position = 'absolute';
                navDesktop.style.top = '100%';
                navDesktop.style.left = '0';
                navDesktop.style.width = '100%';
                navDesktop.style.background = '#fff';
                navDesktop.style.padding = '20px';
                navDesktop.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
            }
        });
    }

    // --- MOBILE SIDEBAR LOGIC ---
    window.toggleSidebar = function (show) {
        const sidebar = document.querySelector('.mobile-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (show) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    };

    window.toggleSubmenu = function (element) {
        const submenu = element.nextElementSibling;
        if (submenu) {
            submenu.classList.toggle('active');
            const icon = element.querySelector('i');
            if (icon) {
                icon.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
            }
        }
    };

    window.toggleMobileSubmenu = function (id) {
        // Close other open submenus
        const allSubmenus = document.querySelectorAll('.mobile-submenu-container');
        allSubmenus.forEach(menu => {
            if (menu.id !== id) {
                menu.classList.remove('active');
            }
        });

        // Toggle target
        const target = document.getElementById(id);
        if (target) {
            target.classList.toggle('active');
        }
    };

    // --- CART LOGIC ---
    window.cart = JSON.parse(localStorage.getItem('deerDeriCart')) || [];

    // Inject Mini Cart HTML if not present
    function injectMiniCart() {
        if (!document.getElementById('mini-cart-drawer')) {
            const cartHtml = `
                <div class="cart-overlay" onclick="toggleCart(false)"></div>
                <div class="mini-cart" id="mini-cart-drawer">
                    <div class="cart-header">
                        <h3>Sepetim (<span id="mini-cart-count">0</span>)</h3>
                        <div class="close-cart" onclick="toggleCart(false)"><i class="fa-solid fa-xmark"></i></div>
                    </div>
                    <div class="cart-body" id="mini-cart-items"></div>
                    <div class="cart-footer">
                        <div class="subtotal">
                            <span>Toplam:</span>
                            <span id="mini-cart-total">0₺</span>
                        </div>
                        <button onclick="toggleCart(false)" class="btn btn-secondary" style="width:100%; margin-bottom:10px;">ALIŞVERİŞE DEVAM ET</button>
                        <a href="/checkout.html" class="btn btn-primary" style="display:block; text-align:center; padding: 12px; width:100%;">ÖDEMEYE GEÇ</a>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', cartHtml);
        }
    }
    injectMiniCart(); // Run immediately

    // Initial renders
    updateCartBadge();

    // --- USP Features Rendering ---
    function renderUSPFeatures() {
        const uspGrid = document.getElementById('usp-grid');
        if (!uspGrid) return;

        let uspFeatures = JSON.parse(localStorage.getItem('deerDeriUSPFeatures'));

        // Default Fallback if empty
        if (!uspFeatures || uspFeatures.length === 0) {
            uspFeatures = [
                { id: 1, icon: 'fa-solid fa-leaf', title: 'Doğaya Saygı', description: 'Geri dönüştürülebilir doğa dostu materyaller.', order: 0, active: true },
                { id: 2, icon: 'fa-solid fa-gift', title: 'Özenli Paketleme', description: 'Her sipariş hediye paketi özeniyle hazırlanır.', order: 1, active: true },
                { id: 3, icon: 'fa-solid fa-star', title: '%100 Memnuniyet', description: 'Müşteri mutluluğu en büyük önceliğimiz.', order: 2, active: true },
                { id: 4, icon: 'fa-solid fa-truck-fast', title: 'Hızlı Kargo', description: 'Güvenli ve hızlı teslimat süreçleri.', order: 3, active: true },
                { id: 5, icon: 'fa-solid fa-headset', title: '7/24 İletişim', description: 'Satış öncesi ve sonrası kesintisiz destek.', order: 4, active: true }
            ];
            // Don't overwrite admin's ability to delete all, but initially seed it
            if (!localStorage.getItem('deerDeriUSPFeatures')) {
                localStorage.setItem('deerDeriUSPFeatures', JSON.stringify(uspFeatures));
            }
        }

        // Filter only active features and sort by order
        const activeFeatures = uspFeatures
            .filter(f => f.active)
            .sort((a, b) => a.order - b.order);

        if (activeFeatures.length === 0) {
            // Optional: Show nothing or a placeholder? User wants it shown, so defaults handle it.
            uspGrid.innerHTML = '';
            return;
        }

        uspGrid.innerHTML = activeFeatures.map(feature => `
            <div class="usp-item">
                <i class="${feature.icon}"></i>
                <div>
                    <div class="usp-title">${feature.title}</div>
                    <div class="usp-desc">${feature.description}</div>
                </div>
            </div>
        `).join('');
    }

    // Render USP features on page load
    renderUSPFeatures();

    // --- FAQ Rendering ---
    function renderFAQItems() {
        const faqAccordion = document.getElementById('faq-accordion');
        if (!faqAccordion) return;

        let faqItems = JSON.parse(localStorage.getItem('deerDeriFAQItems'));

        // Default Fallback if empty
        if (!faqItems || faqItems.length === 0) {
            faqItems = [
                { id: 1, question: 'Ürünüm ne zaman gelir?', answer: 'Siparişleriniz 1-3 iş günü içerisinde kargoya teslim edilmektedir. Yurtiçi Kargo ile gönderim sağlamaktayız.', order: 0, active: true },
                { id: 2, question: 'Ürünler gerçek deri mi?', answer: 'Evet, tüm ürünlerimiz %100 hakiki dana derisinden, geleneksel yöntemlerle el işçiliği kullanılarak üretilmektedir.', order: 1, active: true },
                { id: 3, question: 'İsim baskısı yapıyor musunuz?', answer: 'Evet, seçili cüzdan ve aksesuar ürünlerimizde ücretsiz olarak kişiselleştirme (isim/harf baskısı) hizmeti sunuyoruz.', order: 2, active: true }
            ];
            if (!localStorage.getItem('deerDeriFAQItems')) {
                localStorage.setItem('deerDeriFAQItems', JSON.stringify(faqItems));
            }
        }

        // Filter only active items and sort by order
        const activeItems = faqItems
            .filter(f => f.active)
            .sort((a, b) => a.order - b.order);

        if (activeItems.length === 0) {
            faqAccordion.innerHTML = '<p class="text-center text-muted">Henüz sıkça sorulan soru eklenmemiş.</p>';
            return;
        }

        faqAccordion.innerHTML = activeItems.map(faq => `
            <div class="faq-item">
                <div class="faq-question">
                    ${faq.question} <i class="fa-solid fa-plus"></i>
                </div>
                <div class="faq-answer">
                    ${faq.answer}
                </div>
            </div>
        `).join('');

        // Re-attach event listeners for accordion
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    item.classList.toggle('active');
                    // Close others
                    document.querySelectorAll('.faq-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherIcon = otherItem.querySelector('.faq-question i');
                            if (otherIcon) {
                                otherIcon.classList.remove('fa-minus');
                                otherIcon.classList.add('fa-plus');
                            }
                        }
                    });
                    // Toggle Icon
                    const icon = question.querySelector('i');
                    if (icon) {
                        if (item.classList.contains('active')) {
                            icon.classList.remove('fa-plus');
                            icon.classList.add('fa-minus');
                        } else {
                            icon.classList.remove('fa-minus');
                            icon.classList.add('fa-plus');
                        }
                    }
                });
            }
        });
    }

    // Render FAQ items on page load
    renderFAQItems();
});



// --- HELPER FUNCTIONS FOR PRODUCT PAGE ---
window.toggleEmbossing = function (show) {
    const inputArea = document.getElementById('embossing-input-area');
    const options = document.querySelectorAll('.emboss-opt');
    const input = document.getElementById('custom-name-input');

    if (show) {
        if (inputArea) inputArea.style.display = 'block';
        if (options.length >= 2) {
            options[0].classList.add('selected');
            options[0].style.backgroundColor = '#f9f9f9';
            options[0].style.borderColor = '#000';
            options[0].style.fontWeight = '700';

            options[1].classList.remove('selected');
            options[1].style.backgroundColor = 'transparent';
            options[1].style.borderColor = '#ddd';
            options[1].style.fontWeight = '400';
        }
        if (input) input.focus();
    } else {
        if (inputArea) inputArea.style.display = 'none';
        if (options.length >= 2) {
            options[1].classList.add('selected');
            options[1].style.backgroundColor = '#f9f9f9';
            options[1].style.borderColor = '#000';
            options[1].style.fontWeight = '700';

            options[0].classList.remove('selected');
            options[0].style.backgroundColor = 'transparent';
            options[0].style.borderColor = '#ddd';
            options[0].style.fontWeight = '400';
        }
        if (input) input.value = '';
    }
};

window.scrollToReviews = function () {
    // Switch to reviews tab (index 3)
    // Find the switchTab function - accessed via window if possible, or trigger click
    // Since switchTab is defined in product.html inline script, we might need a global bridge.
    // However, if we put this logic in product.html it's easier. Let's define it globally here to be safe if moved.
    // Actually, `switchTab` is locally scoped in product.html's script tag? No, it's global there.
    if (typeof switchTab === 'function') {
        switchTab(3);
    }
    const tabs = document.querySelector('.product-tabs-wrapper');
    if (tabs) {
        tabs.scrollIntoView({ behavior: 'smooth' });
    }
};

// --- GLOBAL FUNCTIONS (Exposed for HTML onclicks) ---

window.toggleCart = function (show) {
    const overlay = document.querySelector('.cart-overlay');
    const drawer = document.querySelector('.mini-cart');
    if (overlay && drawer) {
        if (show) {
            overlay.classList.add('active');
            drawer.classList.add('active');
            renderMiniCart();
        } else {
            overlay.classList.remove('active');
            drawer.classList.remove('active');
        }
    }
};

window.renderMiniCart = function () {
    const container = document.getElementById('mini-cart-items');
    const countSpan = document.getElementById('mini-cart-count');
    const totalSpan = document.getElementById('mini-cart-total');

    if (!container) return;

    let html = '';
    let total = 0;
    let count = 0;

    if (!window.cart || window.cart.length === 0) {
        html = '<p style="text-align:center; color:#999; margin-top:50px;">Sepetiniz boş.</p>';
    } else {
        window.cart.forEach((item, index) => {
            total += item.price * item.quantity;
            count += item.quantity;
            html += `
                <div class="mini-cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-meta">Renk: ${item.color} | Adet: ${item.quantity} ${item.embossingName ? '<br>Baskı: ' + item.embossingName : ''}</div>
                        <div class="item-price">${formatPriceGlobal(item.price * item.quantity)}₺</div>
                    </div>
                    <div style="cursor:pointer; color:#999;" onclick="window.removeFromCart(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
    if (countSpan) countSpan.textContent = count;
    if (totalSpan) totalSpan.textContent = formatPriceGlobal(total) + '₺';
    updateCartBadge();
};

window.addToCart = function (product, quantity = 1, color = 'Standart', embossingName = null) {
    if (!window.cart) window.cart = [];

    // Determine correct image source
    let mainImage = product.image;
    if (!mainImage && product.images && product.images.length > 0) {
        mainImage = product.images[0];
    }
    // Fallback if still empty
    if (!mainImage) mainImage = 'assets/logo.png';

    // A product is unique in the cart if it has the same ID, color AND same embossing
    const existingItem = window.cart.find(item => item.id === product.id && item.color === color && item.embossing === embossingName);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        window.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: mainImage,
            quantity: quantity,
            color: color,
            embossing: embossingName
        });
    }
    saveCart();
    toggleCart(true);
};

window.removeFromCart = function (index) {
    if (window.cart) {
        window.cart.splice(index, 1);
        saveCart();
        renderMiniCart();
        if (typeof window.renderCartItems === 'function') window.renderCartItems();
        if (typeof window.renderCheckoutSummary === 'function') window.renderCheckoutSummary();
    }
};

window.updateCartQuantity = function (index, change) {
    if (window.cart && window.cart[index]) {
        if (window.cart[index].quantity + change > 0) {
            window.cart[index].quantity += change;
            saveCart();
            renderMiniCart();
            if (typeof window.renderCartItems === 'function') window.renderCartItems();
        }
    }
};

window.saveCart = function () {
    localStorage.setItem('deerDeriCart', JSON.stringify(window.cart));
    updateCartBadge();
};

window.updateCartBadge = function () {
    const badges = document.querySelectorAll('.cart-badge');
    let totalItems = 0;
    if (window.cart) {
        totalItems = window.cart.reduce((total, item) => total + item.quantity, 0);
    }
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });

    // Also update header dropdown
    renderHeaderCart();
};

window.renderHeaderCart = function () {
    const preview = document.querySelectorAll('#header-cart-preview');
    if (!preview.length) return;

    let html = '';
    let total = 0;

    if (!window.cart || window.cart.length === 0) {
        html = '<p style="color:#999; text-align:center; padding:30px 0;">Sepetiniz şu an boş.</p>';
        total = 0;
    } else {
        // Calculate Total
        const fullTotal = window.cart.reduce((t, i) => t + i.price * i.quantity, 0);

        // Free Shipping Logic (Limit 1500 TL)
        const freeShippingLimit = 1500;
        const progress = Math.min((fullTotal / freeShippingLimit) * 100, 100);
        const remaining = freeShippingLimit - fullTotal;

        if (remaining > 0) {
            html += `
                <div class="shipping-progress-container">
                    <div class="shipping-text">Kargo bedava için <strong>${formatPriceGlobal(remaining)}₺</strong> daha ekleyin</div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="shipping-progress-container">
                    <div class="shipping-text"><strong>Tebrikler! Kargo Bedava</strong> 🎉</div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: 100%; background: #2E7D32;"></div>
                    </div>
                </div>
            `;
        }

        html += '<div style="max-height: 250px; overflow-y: auto;">';

        // Show max 3 items
        window.cart.slice(0, 3).forEach((item, index) => {
            html += `
                <div class="preview-item" data-image="${item.image}" data-name="${item.name}" onclick="window.location.href='product.html?id=${item.id}'" style="cursor: pointer;">
                    <img src="${item.image}" alt="">
                    <div class="preview-info">
                        <span class="preview-title" style="font-weight:600; font-size:13px; margin-bottom:2px; display:block;">${item.name}</span>
                        <div style="font-size:11px; color:#666; margin-bottom: 2px;">${item.quantity} adet ${item.color ? '| ' + item.color : ''}</div>
                        ${item.embossing ? `<div style="font-size:10px; color: #2E7D32; font-weight: 600;">Özel Baskı: ${item.embossing}</div>` : ''}
                        <span style="font-size:12px; font-weight: 700;">${formatPriceGlobal(item.price * item.quantity)}₺</span>
                    </div>
                    <div class="delete-btn-header" onclick="event.stopPropagation(); window.removeFromCart(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        if (window.cart.length > 3) {
            html += `<p style="text-align:center; font-size:11px; color:#999; margin-top:10px;">+ ${window.cart.length - 3} diğer ürün</p>`;
        }

        html += `
            <div class="preview-total" style="border-top:1px solid #eee; margin-top:15px; padding-top:15px;">
                <span style="font-size:14px;">ARA TOPLAM</span>
                <span style="font-size:16px;">${formatPriceGlobal(fullTotal)}₺</span>
            </div>
            
            <div class="dropdown-actions">
                 <a href="/cart.html" class="btn-view-cart">SEPETE GİT</a>
                 <a href="/checkout.html" class="btn-checkout">ÖDEME YAP</a>
            </div>
        `;
    }

    preview.forEach(p => {
        p.innerHTML = html;

        // Add hover event listeners to preview items
        setTimeout(() => {
            const previewItems = p.querySelectorAll('.preview-item');
            const imagePreview = document.getElementById('cart-image-preview');

            if (imagePreview) {
                previewItems.forEach(item => {
                    item.addEventListener('mouseenter', function () {
                        const imgSrc = this.getAttribute('data-image');
                        const itemName = this.getAttribute('data-name');
                        if (imgSrc) {
                            imagePreview.innerHTML = `<img src="${imgSrc}" alt="${itemName}">`;
                            imagePreview.classList.add('active');
                        }
                    });

                    item.addEventListener('mouseleave', function () {
                        imagePreview.classList.remove('active');
                        setTimeout(() => {
                            if (!imagePreview.classList.contains('active')) {
                                imagePreview.innerHTML = '';
                            }
                        }, 200);
                    });
                });
            }
        }, 50);
    });

    // Hide the default static button in header if content is loaded dynamicly to avoid duplication if strictly needed,
    // but here we are injecting INTO the preview div which is inside the dropdown. 
    // The original button "SEPETE GİT" is outside this div in index.html. We should probably remove it via JS or CSS if we rely on this HTML.
    // Let's hide the original buttons in CSS or remove them from HTML in next step to be clean.
};

// Popup Logic
window.openSuccessPopup = function () {
    // Popup yerine yeni başarı sayfasına yönlendir
    console.log('🔄 Sipariş başarılı, success.html sayfasına yönlendiriliyor...');
    window.location.href = 'success.html';
};

window.closeSuccessPopup = function () {
    // User wants to go to panel after closing
    window.location.href = 'account.html';
};

// ---------------------------------------------------------
// CHECKOUT SYSTEM REDESIGN
// ---------------------------------------------------------

let currentShippingCost = 100;
let currentShippingType = 'standard';
window.selectedAddressId = null;
window.currentCheckoutAddress = null;

// --- NEW ROBUST CHECKOUT SYSTEM ---

window.initCheckout = function () {
    console.log('🚀 Init Checkout Started');
    try {
        // Load Cart
        window.cart = JSON.parse(localStorage.getItem('deerDeriCart')) || [];

        const user = UserManager.getCurrentUser();
        if (user) {
            goToStep(2);
        } else {
            goToStep(1);
        }

        updateCheckoutSummary();

        if (typeof populateCities === 'function') {
            populateCities();
        }

        // Ensure content is visible if something messed up CSS
        document.body.style.opacity = '1';

    } catch (error) {
        console.error('❌ Checkout Init Error:', error);
        // Emergency Fallback
        const s1 = document.getElementById('step-1-container');
        if (s1) s1.classList.add('active');
    }
};

window.goToStep = function (step) {
    const s1 = document.getElementById('step-1-container');
    const s2 = document.getElementById('step-2-container');
    const s3 = document.getElementById('step-3-container');
    const navs = [document.getElementById('step-nav-1'), document.getElementById('step-nav-2'), document.getElementById('step-nav-3')];

    [s1, s2, s3].forEach(s => s && s.classList.remove('active'));
    navs.forEach(n => n && n.classList.remove('active', 'completed'));

    if (step === 1) {
        if (s1) s1.classList.add('active');
        if (navs[0]) navs[0].classList.add('active');
    } else if (step === 2) {
        if (s2) s2.classList.add('active');
        if (navs[0]) navs[0].classList.add('completed');
        if (navs[1]) navs[1].classList.add('active');

        const user = UserManager.getCurrentUser();
        const savedBox = document.getElementById('checkout-saved-addresses');
        const formBox = document.getElementById('checkout-address-form');
        if (user && user.addresses && user.addresses.length > 0) {
            if (savedBox) savedBox.style.display = 'block';
            if (formBox) formBox.style.display = 'none';
            renderCheckoutAddresses(user.addresses);
        } else {
            if (savedBox) savedBox.style.display = 'none';
            if (formBox) formBox.style.display = 'block';
        }
    } else if (step === 3) {
        if (s3) s3.classList.add('active');
        if (navs[0]) navs[0].classList.add('completed');
        if (navs[1]) navs[1].classList.add('completed');
        if (navs[2]) navs[2].classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.validateFields = function (list) {
    let valid = true;
    list.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            if (el) el.classList.add('input-error');
            valid = false;
        } else {
            if (el) el.classList.remove('input-error');
        }
    });
    return valid;
};

window.goToStep2 = function () {
    const fields = ['guest-name', 'guest-surname', 'guest-email', 'guest-phone', 'guest-password', 'guest-password-confirm'];
    if (!validateFields(fields)) {
        showToast('Lütfen tüm zorunlu alanları doldurun.', 'error');
        return;
    }

    const pass = document.getElementById('guest-password').value;
    if (pass !== document.getElementById('guest-password-confirm').value) {
        showToast('Şifreler eşleşmiyor.', 'error');
        return;
    }

    const userData = {
        firstName: document.getElementById('guest-name').value,
        lastName: document.getElementById('guest-surname').value,
        email: document.getElementById('guest-email').value,
        password: pass,
        phone: document.getElementById('guest-phone').value,
        tc: document.getElementById('guest-tc').value
    };

    if (registerUser(userData)) {
        // Send Welcome Email
        if (typeof window.sendWelcomeEmail === 'function') {
            console.log('📧 Sending welcome email to new user...');
            window.sendWelcomeEmail(userData).catch(e => console.error('Welcome email failed', e));
        }

        goToStep(2);
    } else {
        // Try auto-login if registered
        if (window.loginUser(userData.email, userData.password, false)) {
            console.log('✅ User already exists, logged in automatically.');
            goToStep(2);
        } else {
            showToast('Bu e-posta zaten kayıtlı. Lütfen giriş yapın veya şifrenizi kontrol edin.', 'error');
        }
    }
};

window.goToStep3 = function () {
    const user = UserManager.getCurrentUser();
    const isNew = document.getElementById('checkout-address-form').style.display !== 'none';

    if (isNew) {
        if (!validateFields(['addr-text-input', 'city-select', 'district-select'])) {
            showToast('Lütfen teslimat adresini eksiksiz doldurun.', 'error');
            return;
        }
        window.currentCheckoutAddress = {
            id: 'temp-' + Date.now(),
            title: document.getElementById('addr-title-input').value || 'Yeni Adres',
            address: document.getElementById('addr-text-input').value,
            city: document.getElementById('city-select').value,
            district: document.getElementById('district-select').value
        };
    } else {
        if (!window.selectedAddressId) {
            showToast('Lütfen bir teslimat adresi seçin.', 'error');
            return;
        }
        window.currentCheckoutAddress = user.addresses.find(a => a.id === window.selectedAddressId);
    }

    // Ensure a shipping type is selected (should be by default)
    if (!window.currentShippingType) {
        window.selectShipping('standard');
    }

    goToStep(3);
};

window.processOrder = function () {
    if (window.currentShippingType !== 'door') {
        if (!validateFields(['card-name', 'card-number', 'card-expiry', 'card-cvv'])) {
            showToast('Ödeme bilgilerini girin.', 'error');
            return;
        }
    }

    const user = UserManager.getCurrentUser();
    if (!user) {
        showToast('Oturum zaman aşımına uğradı. Lütfen tekrar giriş yapın.', 'error');
        return;
    }

    let finalAddr = window.currentCheckoutAddress;

    // Requirement: Save address to member panel if it's new
    if (finalAddr && (finalAddr.id && finalAddr.id.toString().startsWith('temp-') || !user.addresses || !user.addresses.find(a => a.address === finalAddr.address))) {
        const isAlreadyInSaved = user.addresses && user.addresses.find(a => a.address === finalAddr.address);

        if (!isAlreadyInSaved) {
            const persistentAddr = {
                ...finalAddr,
                id: Date.now().toString() + Math.floor(Math.random() * 1000)
            };
            user.addresses = user.addresses || [];
            user.addresses.push(persistentAddr);
            finalAddr = persistentAddr; // Use the persistent one for the order record

            // Sync to all user storage
            UserManager.setCurrentUser(user);
            const users = UserManager.getUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx > -1) {
                users[idx].addresses = user.addresses;
                UserManager.saveUsers(users);
            }
        }
    }

    const orderId = saveOrderToHistory(window.cart, calculateTotal(), window.currentShippingType, finalAddr);

    // --- MAIL GONDERIMI ---
    const totalAmount = calculateTotal();
    const shippingCost = (typeof currentShippingCost !== 'undefined' ? currentShippingCost : 0);

    // Create mail data copy before clearing cart
    const mailData = {
        orderNumber: orderId,
        date: new Date().toLocaleDateString('tr-TR'),
        customerName: (user.firstName + ' ' + (user.lastName || '')).trim(),
        customerEmail: user.email,
        customerPhone: user.phone || (finalAddr ? finalAddr.phone : ''),
        paymentMethod: window.currentShippingType === 'door' ? 'Kapıda Ödeme' : 'Kredi Kartı',
        items: JSON.parse(JSON.stringify(window.cart)),
        subtotal: totalAmount - shippingCost,
        shipping: window.currentShippingType,
        total: totalAmount,
        address: finalAddr
    };

    if (typeof window.sendOrderEmails === 'function') {
        console.log('📨 Triggering emails for order: ' + orderId);
        window.sendOrderEmails(mailData);
    }

    // Sepeti temizle
    window.cart = [];
    localStorage.setItem('deerDeriCart', JSON.stringify([]));
    if (typeof updateCartBadge === 'function') updateCartBadge();

    // Sipariş verisi garantilensin diye kısa bir bekleme ve yönlendirme
    console.log('✅ Sipariş oluşturuldu:', orderId);
    setTimeout(() => {
        window.location.href = `success.html?orderid=${orderId}`;
    }, 2000);
};

window.updateCheckoutSummary = function () {
    const cont = document.getElementById('checkout-summary-items');
    if (!cont) return;

    let html = '';
    let subtotal = 0;
    if (window.cart && window.cart.length > 0) {
        window.cart.forEach(item => {
            subtotal += item.price * item.quantity;
            html += `
                <div class="summary-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="summary-item-details">
                        <span class="summary-item-name">${item.name}</span>
                        <div style="font-size:12px; color:#666;">Adet: ${item.quantity} ${item.color ? '| ' + item.color : ''}</div>
                        ${item.embossing ? `<div style="font-size:11px; color: #2E7D32; font-weight: 500;">Özel Baskı: ${item.embossing}</div>` : ''}
                        <div class="summary-item-price">${(item.price * item.quantity).toLocaleString('tr-TR')}₺</div>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p style="text-align:center; padding:20px;">Sepetiniz boş.</p>';
    }
    cont.innerHTML = html;

    const ship = currentShippingCost;
    document.getElementById('summary-subtotal').innerText = subtotal.toLocaleString('tr-TR') + '₺';
    document.getElementById('summary-shipping').innerText = ship.toLocaleString('tr-TR') + '₺';
    document.getElementById('summary-total-price').innerText = '₺' + (subtotal + ship).toLocaleString('tr-TR');
};

window.renderCheckoutAddresses = function (addresses) {
    const list = document.getElementById('saved-address-list');
    if (!list) return;

    let html = '';
    addresses.forEach((addr, index) => {
        const isSelected = window.selectedAddressId === addr.id || (window.selectedAddressId === null && index === 0);
        if (isSelected) window.selectedAddressId = addr.id;

        html += `
            <div class="saved-address-card ${isSelected ? 'selected' : ''}" onclick="selectAddress('${addr.id}', this)">
                <div class="card-header">
                    <span class="addr-title">${addr.title}</span>
                    <i class="${isSelected ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle'}"></i>
                </div>
                <div class="addr-body">
                    ${addr.address}<br>
                    <strong>${addr.district} / ${addr.city}</strong>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
};

window.selectAddress = function (id, el) {
    window.selectedAddressId = id;
    document.querySelectorAll('.saved-address-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('i').className = 'fa-regular fa-circle';
    });
    el.classList.add('selected');
    el.querySelector('i').className = 'fa-solid fa-check-circle';
    document.getElementById('checkout-address-form').style.display = 'none';
};

window.toggleNewAddressForm = function () {
    const form = document.getElementById('checkout-address-form');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        window.selectedAddressId = null;
        document.querySelectorAll('.saved-address-card').forEach(c => {
            c.classList.remove('selected');
            c.querySelector('i').className = 'fa-regular fa-circle';
        });

        // Smooth scroll to form
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            const firstInput = form.querySelector('textarea, input');
            if (firstInput) firstInput.focus();
        }, 500);
    } else {
        form.style.display = 'none';
    }
};

window.selectShipping = function (type) {
    currentShippingType = type;
    currentShippingCost = (type === 'door' ? 50 : 100);

    document.querySelectorAll('.shipping-card').forEach(opt => {
        const radio = opt.querySelector('input[type="radio"]');
        if (radio && radio.value === type) {
            opt.classList.add('selected');
            radio.checked = true;
        } else {
            opt.classList.remove('selected');
            if (radio) radio.checked = false;
        }
    });

    const cardForm = document.getElementById('payment-card-form');
    const codMsg = document.getElementById('payment-cod-msg');

    if (type === 'door') {
        if (cardForm) cardForm.style.display = 'none';
        if (codMsg) codMsg.style.display = 'block';
    } else {
        if (cardForm) cardForm.style.display = 'block';
        if (codMsg) codMsg.style.display = 'none';
    }

    updateCheckoutSummary();
};

window.setAddressType = function (type, btn) {
    document.getElementById('addr-title-input').value = type;
    document.querySelectorAll('.btn-addr-type').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.checkoutSaveAddress = function () {
    const user = UserManager.getCurrentUser();
    if (!user) {
        showToast('Adres kaydetmek için lütfen giriş yapın.', 'error');
        return;
    }

    if (!validateFields(['addr-text-input', 'city-select', 'district-select'])) {
        showToast('Lütfen tüm adres alanlarını doldurun.', 'error');
        return;
    }

    const newAddr = {
        id: Date.now().toString(),
        title: document.getElementById('addr-title-input').value || 'Adres',
        address: document.getElementById('addr-text-input').value,
        city: document.getElementById('city-select').value,
        district: document.getElementById('district-select').value
    };

    // Add to user profile
    user.addresses = user.addresses || [];
    user.addresses.push(newAddr);
    UserManager.setCurrentUser(user);

    // Sync DB
    const users = UserManager.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) {
        users[idx].addresses = user.addresses;
        UserManager.saveUsers(users);
    }

    // Show Confirmation Modal
    const modal = document.getElementById('address-confirm-modal');
    if (modal) modal.style.display = 'flex';

    // Refresh Checkout Addresses List
    renderCheckoutAddresses(user.addresses);

    // Switch to Saved Addresses view
    document.getElementById('checkout-saved-addresses').style.display = 'block';
    document.getElementById('checkout-address-form').style.display = 'none';

    // Select the newly added address
    window.selectedAddressId = newAddr.id;
    setTimeout(() => {
        const cards = document.querySelectorAll('.saved-address-card');
        const lastCard = cards[cards.length - 1];
        if (lastCard) selectAddress(newAddr.id, lastCard);
    }, 100);
};

window.closeAddressModal = function () {
    const modal = document.getElementById('address-confirm-modal');
    if (modal) modal.style.display = 'none';
};

window.populateCities = function () {
    const citySelect = document.getElementById('city-select');
    if (!citySelect || typeof turkeyLocations === 'undefined') return;

    const cities = Object.keys(turkeyLocations).sort((a, b) => a.localeCompare(b, 'tr'));
    citySelect.innerHTML = '<option value="">Seçiniz</option>';
    cities.forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });
};

window.loadDistricts = function () {
    const citySelect = document.getElementById('city-select');
    const distSelect = document.getElementById('district-select');
    if (!citySelect || !distSelect) return;

    const city = citySelect.value;
    if (!city || !turkeyLocations[city]) {
        distSelect.innerHTML = '<option value="">Önce Şehir Seçiniz</option>';
        distSelect.disabled = true;
        return;
    }

    const districts = turkeyLocations[city].sort((a, b) => a.localeCompare(b, 'tr'));
    distSelect.innerHTML = '<option value="">Seçiniz</option>';
    districts.forEach(d => {
        distSelect.innerHTML += `<option value="${d}">${d}</option>`;
    });
    distSelect.disabled = false;
};

// Helper to calc total safely
function calculateTotal() {
    let t = 0;
    if (window.cart) window.cart.forEach(i => t += i.price * i.quantity);
    t += (typeof currentShippingCost !== 'undefined' ? currentShippingCost : 0);
    return t;
}

function formatPriceGlobal(price) {
    if (price === undefined || price === null) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// --- YouTube Video Background Logic ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'i2CkLotShyA',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'loop': 1,
            'fs': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'autohide': 0,
            'playlist': 'i2CkLotShyA', // Required for loop
            'mute': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
}

let checkInterval;
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (checkInterval) clearInterval(checkInterval);
        // Loop check: check time every second
        checkInterval = setInterval(() => {
            if (player && player.getCurrentTime) {
                const currentTime = player.getCurrentTime();
                if (currentTime >= 15) { // Reset at 15 seconds
                    player.seekTo(0);
                }
            }
        }, 1000);
    } else {
        if (checkInterval) clearInterval(checkInterval);
    }
}

// Consolidated Logic Sections End Here


// --- USER MANAGEMENT SYSTEM ---

const UserManager = {
    getUsers: () => JSON.parse(localStorage.getItem('deerDeriUsers')) || [],
    saveUsers: (users) => localStorage.setItem('deerDeriUsers', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('deerDeriCurrentUser')),
    setCurrentUser: (user) => localStorage.setItem('deerDeriCurrentUser', JSON.stringify(user)),
    clearCurrentUser: () => localStorage.removeItem('deerDeriCurrentUser')
};

window.registerUser = function (userData) {
    const users = UserManager.getUsers();
    if (users.find(u => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim())) {
        return false; // User exists
    }

    // Add ID and empty lists
    userData.id = Date.now().toString();
    userData.orders = [];
    userData.addresses = [];

    users.push(userData);
    UserManager.saveUsers(users);

    // Auto login
    UserManager.setCurrentUser(userData);
    return true;
};

window.loginUser = function (email, password, shouldReload = true) {
    const users = UserManager.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        UserManager.setCurrentUser(user);
        if (shouldReload) window.location.reload(); // Refresh to update UI
        return true;
    }
    return false;
};

window.logoutUser = function () {
    UserManager.clearCurrentUser();
    window.location.href = 'index.html';
};

window.addAddress = function (address) {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;

    const users = UserManager.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex > -1) {
        address.id = Date.now().toString();

        // Update local state
        currentUser.addresses.push(address);
        UserManager.setCurrentUser(currentUser);

        // Update DB
        users[userIndex].addresses.push(address);
        UserManager.saveUsers(users);

        // Refresh UI
        if (window.renderAccountPage) window.renderAccountPage();
    }
};

window.saveOrderToHistory = function (cartItems, total, shipping, address) {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return; // Guest order (already auto-logged in by now)

    const users = UserManager.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex > -1) {
        const order = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            date: new Date().toLocaleDateString('tr-TR'),
            items: cartItems,
            total: total,
            shipping: shipping,
            address: address, // Added address
            status: 'İşleniyor'
        };

        // Update DB
        users[userIndex].orders.unshift(order); // Add to top
        UserManager.saveUsers(users);

        // Sync Session
        currentUser.orders.unshift(order);
        UserManager.setCurrentUser(currentUser);

        return order.id; // Return ID for success page
    }
    return null;
};

window.renderAccountPage = function () {
    const user = UserManager.getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Name Displays
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.firstName || 'Kullanıcı');
    const headerName = document.getElementById('header-user-name');
    if (headerName) {
        headerName.textContent = user.firstName + (user.lastName ? ' ' + user.lastName.charAt(0) + '.' : '');
    }

    // Render Orders
    const ordersContainer = document.getElementById('orders-list');
    if (ordersContainer) {
        const orders = user.orders || [];
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p style="color:#666;">Henüz verilmiş bir siparişiniz bulunmuyor.</p>';
        } else {
            let html = `
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Tarih</th>
                            <th>Tutar</th>
                            <th>Durum</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            orders.forEach(order => {
                const itemsList = (order.items || []).map(item => `
                    <div style="font-size:11px; margin-top:5px; padding-top:5px; border-top:1px dashed #eee;">
                        <strong>${item.name}</strong>
                        ${item.embossing ? `<div style="color:#2E7D32; font-weight:600;">Özel Baskı: ${item.embossing}</div>` : ''}
                    </div>
                `).join('');

                html += `
                    <tr>
                        <td style="font-weight:600; vertical-align: top;">#${order.id}</td>
                        <td style="vertical-align: top;">${order.date}</td>
                        <td style="vertical-align: top;">
                            <div style="font-weight:700;">${formatPriceGlobal(order.total)}₺</div>
                            <div style="color:#888; margin-top:5px; font-size:11px;">Ürünler:</div>
                            ${itemsList}
                        </td>
                        <td style="vertical-align: top;"><span class="order-status status-processing">${order.status || 'İşleniyor'}</span></td>
                        <td style="vertical-align: top;">
                            <button class="btn-track-cargo" onclick="window.showOrderTracking('${order.id}')">
                                <i class="fa-solid fa-truck-fast"></i> Kargom Nerede
                            </button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
            ordersContainer.innerHTML = html;
        }
    }

    // Render Addresses
    const addrContainer = document.getElementById('address-list');
    if (addrContainer) {
        const addBtn = addrContainer.querySelector('.add-address-btn');
        addrContainer.innerHTML = '';
        if (addBtn) addrContainer.appendChild(addBtn);

        const addresses = user.addresses || [];
        addresses.forEach(addr => {
            const card = document.createElement('div');
            card.className = 'address-card';
            card.innerHTML = `
                <div class="address-title">
                    <span>${addr.title}</span>
                    <div style="cursor:pointer; color:#999;"><i class="fa-solid fa-trash"></i></div>
                </div>
                <div class="address-text">
                    ${addr.address}<br>
                    <strong>${addr.district} / ${addr.city}</strong>
                </div>
                <div style="font-size:13px; color:#2E7D32; font-weight:500;">Teslimat Adresi</div>
            `;
            if (addBtn) addrContainer.insertBefore(card, addBtn);
            else addrContainer.appendChild(card);
        });
    }
};

// Conflicting Dynamic Nav functions removed


// Ensure toggle function is global for mobile
window.toggleMobileSubmenu = function (id) {
    const submenu = document.getElementById(id);
    if (!submenu) return;

    // Close other submenus at the same level (optional, but cleaner)
    const parent = submenu.closest('.mobile-horizontal-nav');
    if (parent) {
        parent.querySelectorAll('.mobile-submenu-container').forEach(el => {
            if (el.id !== id) el.style.display = 'none';
        });
    }

    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
};

// Initial Call for Dynamic Nav Removed


// --- GLOBAL AUTH CHECK & UI UPDATE ---
window.checkAuth = function () {
    // Seed Admin User if not exists
    const adminEmail = 'admin@deerderi.com';
    const adminPass = '159753Deerderi';
    const users = JSON.parse(localStorage.getItem('deerDeriUsers')) || [];

    if (!users.find(u => u.email === adminEmail)) {
        users.push({
            id: 'admin-001',
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            password: adminPass,
            orders: [],
            addresses: []
        });
        localStorage.setItem('deerDeriUsers', JSON.stringify(users));
    }

    const user = UserManager.getCurrentUser();
    const loginDropdowns = document.querySelectorAll('.login-dropdown');
    const userIcons = document.querySelectorAll('.fa-regular.fa-user');
    const iconLabels = document.querySelectorAll('.icon-group .icon-label');

    // Find the "Giriş Yap" text specifically
    let loginLabel = null;
    iconLabels.forEach(l => {
        if (l.textContent.includes('Giriş Yap') || l.textContent.includes('Hesabım')) loginLabel = l;
    });

    if (user) {
        // LOGGED IN
        if (loginLabel) loginLabel.textContent = `Hoşgeldiniz ${user.firstName}`;

        loginDropdowns.forEach(dd => {
            // Replace login form with simplified menu
            dd.innerHTML = `
                <a href="account.html" style="display:block; padding:10px 0; border-bottom:1px solid #eee;">Hesabım</a>
                <a href="account.html" style="display:block; padding:10px 0; border-bottom:1px solid #eee;">Siparişlerim</a>
                ${user.email === 'admin@deerderi.com' ? '<a href="/yonetim" style="display:block; padding:10px 0; border-bottom:1px solid #eee; color: #EF6C00;"><b>Admin Panel</b></a>' : ''}
                <a href="#" onclick="window.logoutUser(); return false;" style="display:block; padding:10px 0; color:#D32F2F;">Çıkış Yap</a>
             `;
        });
    } else {
        // NOT LOGGED IN - Ensure form exists (restore if needed or rely on static HTML)
        // Since we might have overwritten it in a previous session, static HTML reload handles this.
        // But for consistency:
        if (loginLabel) loginLabel.textContent = 'Giriş Yap';
    }
};

// Override processOrder to save data


// --- TOAST NOTIFICATION SYSTEM ---

// Inject Toast CSS
const toastStyle = document.createElement('style');
toastStyle.innerHTML = `
    #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .toast {
        min-width: 250px;
        background: #fff;
        border-left: 4px solid #333;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        padding: 15px 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 15px;
        transform: translateX(100%);
        animation: slideIn 0.3s forwards, fadeOut 0.3s forwards 3s;
        font-size: 14px;
        font-weight: 500;
    }
    
    .toast.success { border-left-color: #2E7D32; }
    .toast.success i { color: #2E7D32; }
    
    .toast.error { border-left-color: #D32F2F; }
    .toast.error i { color: #D32F2F; }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);

// Create Container
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

window.showToast = function (message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    document.getElementById('toast-container').appendChild(toast);

    // Auto Remove
    setTimeout(() => {
        toast.remove();
    }, 3500);
};

// --- UPDATED AUTH HANDLERS WITH TOASTS ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Login Form Listener (Global)
    document.querySelectorAll('.login-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const inputs = this.querySelectorAll('input');
            const email = inputs[0].value;
            const pass = inputs[1].value;

            if (loginUser(email, pass)) {
                showToast('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');

                // --- SPECIAL CHECKOUT AUTO-STEP ---
                if (window.location.pathname.includes('checkout.html') && typeof goToStep === 'function') {
                    // Close dropdown if mobile
                    const dropdown = this.closest('.login-dropdown');
                    if (dropdown) dropdown.classList.remove('show-mobile');

                    // Transition to step 2 automatically
                    setTimeout(() => goToStep(2), 500);
                }
            } else {
                showToast('E-posta veya şifre hatalı!', 'error');
            }
        });
    });

    // Checkout Step 1 Login Trigger
    const checkoutLoginTrigger = document.getElementById('trigger-checkout-login');
    if (checkoutLoginTrigger) {
        checkoutLoginTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to top and open login dropdown
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const loginIcon = document.querySelector('.fa-regular.fa-user');
            if (loginIcon) {
                // Focus and show
                const dropdown = document.querySelector('.login-dropdown');
                if (dropdown) {
                    dropdown.classList.add('show-mobile'); // For mobile consistency
                    // Also scroll into view if needed
                    dropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const firstInput = dropdown.querySelector('input');
                    if (firstInput) setTimeout(() => firstInput.focus(), 600);
                }
            }
        });
    }

    // Checkout Login Modal Logic
    window.openCheckoutLogin = function () {
        const modal = document.getElementById('checkout-login-modal');
        if (modal) {
            modal.style.display = 'flex';
            const firstInput = document.getElementById('modal-login-email');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
        }
    };

    window.closeCheckoutModal = function () {
        const modal = document.getElementById('checkout-login-modal');
        if (modal) modal.style.display = 'none';
    };

    const modalLoginForm = document.getElementById('checkout-login-form');
    if (modalLoginForm) {
        modalLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('modal-login-email').value;
            const pass = document.getElementById('modal-login-pass').value;

            // Login without reload to stay on checkout page
            if (loginUser(email, pass, false)) {
                showToast('Giriş başarılı! Bilgileriniz yükleniyor...', 'success');
                closeCheckoutModal();

                // Update header/UI
                checkAuth();

                // Refresh Step 2 addresses if they exist
                const user = UserManager.getCurrentUser();
                if (user && user.addresses) {
                    renderCheckoutAddresses(user.addresses);
                }

                // Transition to Step 2 immediately
                setTimeout(() => goToStep(2), 600);
            } else {
                showToast('E-posta veya şifre hatalı!', 'error');
            }
        });
    }

    // Phone Masking Logic
    const guestPhone = document.getElementById('guest-phone');
    if (guestPhone) {
        guestPhone.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);

            if (!x[2] && x[1] === '0') {
                e.target.value = '0';
                return;
            }

            if (x[1] === '0') {
                e.target.value = !x[3] ? x[1] + (x[2] ? '(' + x[2] : '') : x[1] + '(' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
            } else {
                // If they didn't start with 0, maybe they want to start with 5xx
                // We'll normalize to 0(XXX) XXX-XX-XX
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 0 && val[0] !== '0') {
                    val = '0' + val;
                }
                let m = val.match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
                if (m) {
                    e.target.value = !m[3] ? m[1] + (m[2] ? '(' + m[2] : '') : m[1] + '(' + m[2] + ') ' + m[3] + (m[4] ? '-' + m[4] : '') + (m[5] ? '-' + m[5] : '');
                }
            }
        });
    }

    // --- SUCCESS PAGE LOGIC ---
    if (window.location.pathname.includes('success.html')) {
        const urlParams = new URLSearchParams(window.location.search);

        // Update Order Number if provided
        const orderId = urlParams.get('orderid');
        if (orderId && document.getElementById('order-no')) {
            document.getElementById('order-no').textContent = '#' + orderId;
        }
    }

    // --- CHECKOUT INIT SKIP ---
    if (window.location.pathname.includes('checkout.html')) {
        const user = UserManager.getCurrentUser();
        if (user) {
            goToStep(2);
        } else {
            goToStep(1);
        }
    }
});


// --- ORDER TRACKING MODAL ---
window.showOrderTracking = function (orderId) {
    const user = UserManager.getCurrentUser();
    if (!user) return;

    const order = user.orders.find(o => o.id === orderId);
    if (!order) return;

    // Remove existing modal if any
    const existing = document.getElementById('tracking-modal');
    if (existing) existing.remove();

    const statusSteps = ['İşleniyor', 'Hazırlanıyor', 'Paketlendi', 'Kargolandı', 'Teslim Edildi'];
    let currentStepIdx = statusSteps.indexOf(order.status);
    if (currentStepIdx === -1) currentStepIdx = 0; // Default

    // Logic for Iptal
    const isCancelled = order.status === 'İptal Edildi';

    const modal = document.createElement('div');
    modal.id = 'tracking-modal';
    modal.className = 'tracking-modal-overlay';

    // Determine progress bar width
    const progressPercent = isCancelled ? 100 : (currentStepIdx / (statusSteps.length - 1)) * 100;

    modal.innerHTML = `
        <div class="tracking-modal-content">
            <button class="close-tracking-modal" onclick="document.getElementById('tracking-modal').remove()"><i class="fa-solid fa-times"></i></button>
            <div class="tracking-header">
                <h3>Sipariş Takibi</h3>
                <p class="order-ref">Sipariş No: <strong>#${order.id}</strong></p>
                <div class="order-estimated-date">
                    ${isCancelled ? '<span style="color:var(--danger-color)">Sipariş İptal Edildi</span>' :
            'Tahmini Teslimat: <strong>' + getEstimatedDelivery(order.date) + '</strong>'}
                </div>
            </div>

            <div class="tracking-stepper-container ${isCancelled ? 'cancelled-view' : ''}">
                 ${!isCancelled ? `
                <div class="stepper-progress-bar">
                    <div class="stepper-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                
                <div class="stepper-steps">
                    ${statusSteps.map((step, idx) => {
                const icon = getStepIcon(step);
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return `
                        <div class="step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                            <div class="step-icon">
                                <i class="${icon}"></i>
                            </div>
                            <div class="step-label">${step}</div>
                            ${isCurrent ? '<div class="step-pulse"></div>' : ''}
                        </div>
                        `;
            }).join('')}
                </div>
                ` : `
                <div class="cancelled-state">
                    <div class="cancelled-icon"><i class="fa-solid fa-ban"></i></div>
                    <h4>Bu sipariş iptal edilmiştir.</h4>
                    <p>İade işlemleri için destek ekibimizle iletişime geçebilirsiniz.</p>
                </div>
                `}
            </div>

            <div class="tracking-details">
                <div class="tracking-info-row">
                    <div class="tracking-info-item">
                        <label>Alıcı</label>
                        <span>${user.firstName} ${user.lastName}</span>
                    </div>
                    <div class="tracking-info-item">
                        <label>Ödeme Yöntemi</label>
                        <span>${order.paymentMethod || 'Kredi Kartı'}</span>
                    </div>
                    <div class="tracking-info-item">
                        <label>Toplam Tutar</label>
                        <span>${formatPriceGlobal(order.total)}₺</span>
                    </div>
                </div>
            </div>
            
            <div class="tracking-actions">
                <a href="https://wa.me/905555555555" target="_blank" class="btn-whatsapp-support">
                    <i class="fa-brands fa-whatsapp"></i> Canlı Destek
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger animation
    requestAnimationFrame(() => {
        modal.classList.add('visible');
    });
};

function getStepIcon(status) {
    const map = {
        'İşleniyor': 'fa-solid fa-clipboard-check',
        'Hazırlanıyor': 'fa-solid fa-box-open',
        'Paketlendi': 'fa-solid fa-box',
        'Kargolandı': 'fa-solid fa-truck-fast',
        'Teslim Edildi': 'fa-solid fa-house-chimney'
    };
    return map[status] || 'fa-solid fa-circle';
}

function getEstimatedDelivery(orderDateStr) {
    if (!orderDateStr) return '3-5 İş Günü';
    // Simple mock calculation: +3 days
    const parts = orderDateStr.split('.');
    if (parts.length === 3) {
        const d = new Date(parts[2], parts[1] - 1, parts[0]);
        d.setDate(d.getDate() + 3);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        return `${day}.${month}.${d.getFullYear()}`;
    }
    return '3-5 İş Günü';
}

// Initialize Header Navigation
document.addEventListener('DOMContentLoaded', function () {
    if (typeof renderHeaderNav === 'function') {
        renderHeaderNav();
    }
});

// ==================== DYNAMIC FOOTER MANAGEMENT ====================

// Default footer structure
function getDefaultFooterColumns() {
    return [
        {
            id: '1',
            title: 'DEER DERİ',
            description: 'Kadim mirasın izinde, ustalığın ve doğallığın buluştuğu nokta. Hikayenizin bir parçası olacak ömürlük eşyalar üretiyoruz.',
            showSocial: true,
            socialLinks: {
                instagram: '#',
                facebook: '#',
                pinterest: '#'
            },
            links: []
        },
        {
            id: '2',
            title: 'Katalog',
            links: [
                { id: '1', text: 'Yeni Gelenler', url: '#' },
                { id: '2', text: 'Çantalar', url: '/kategori/canta' },
                { id: '3', text: 'Cüzdanlar', url: '/kategori/cuzdan' },
                { id: '4', text: 'Aksesuarlar', url: '/kategori/aksesuar' }
            ]
        },
        {
            id: '3',
            title: 'Kurumsal',
            links: [
                { id: '1', text: 'Hakkımızda', url: '#' },
                { id: '2', text: 'Blog', url: '#' },
                { id: '3', text: 'İletişim', url: '/contact.html' },
                { id: '4', text: 'Toptan Satış', url: '#' }
            ]
        },
        {
            id: '4',
            title: 'Yardım',
            links: [
                { id: '1', text: 'Sıkça Sorulan Sorular', url: '#' },
                { id: '2', text: 'Kargo ve İade', url: '#' },
                { id: '3', text: 'Gizlilik Politikası', url: '#' },
                { id: '4', text: 'Mesafeli Satış Sözleşmesi', url: '#' }
            ]
        }
    ];
}

// Render dynamic footer
function renderFooter() {
    const footerContainer = document.getElementById('dynamic-footer');
    if (!footerContainer) return; // Footer placeholder not found

    // Get footer columns from localStorage or use defaults
    let footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || 'null');
    if (!footerColumns || footerColumns.length === 0) {
        footerColumns = getDefaultFooterColumns();
        localStorage.setItem('deerDeriFooterColumns', JSON.stringify(footerColumns));
    }

    // Build footer HTML
    let columnsHTML = '';
    footerColumns.forEach(column => {
        let columnContent = `<div class="footer-col">
            <h4>${column.title}</h4>`;

        // Special handling for first column (DEER DERİ) with description and social
        if (column.description) {
            columnContent += `<p style="color:#ccc; font-size:14px; margin-bottom: 20px;">
                ${column.description}
            </p>`;
        }

        if (column.showSocial && column.socialLinks) {
            columnContent += `<div class="social-icons" style="font-size: 20px; gap: 15px; display: flex;">
                <a href="${column.socialLinks.instagram || '#'}"><i class="fa-brands fa-instagram"></i></a>
                <a href="${column.socialLinks.facebook || '#'}"><i class="fa-brands fa-facebook"></i></a>
                <a href="${column.socialLinks.pinterest || '#'}"><i class="fa-brands fa-pinterest"></i></a>
            </div>`;
        }

        // Render links
        if (column.links && column.links.length > 0) {
            columnContent += `<ul class="footer-links">`;
            column.links.forEach(link => {
                columnContent += `<li><a href="${link.url}">${link.text}</a></li>`;
            });
            columnContent += `</ul>`;
        }

        columnContent += `</div>`;
        columnsHTML += columnContent;
    });

    // Complete footer HTML with SEO section and bottom bar
    const footerHTML = `
        <div class="container">
            <div class="footer-grid">
                ${columnsHTML}
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
    `;

    footerContainer.innerHTML = footerHTML;
}

// Listen for storage changes (updates from admin panel)
window.addEventListener('storage', function (e) {
    if (e.key === 'deerDeriFooterColumns') {
        renderFooter();
    }
});

// Initialize footer on page load
document.addEventListener('DOMContentLoaded', function () {
    renderFooter();
});

// Make function globally available
window.renderFooter = renderFooter;
