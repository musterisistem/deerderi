document.addEventListener('DOMContentLoaded', function () {
    // --- Configuration & State ---
    const state = {
        currentView: 'dashboard',
        products: [],
        orders: [],
        categories: [],
        siteSettings: {
            announcement: {
                text: "1500 TL ve Üzeri Kargo Bizden!",
                active: true
            }
        },
        uspFeatures: [],
        faqItems: [],
        productInfoBoxes: [],
        deliveryInfo: {},
        mosaicItems: [],
        menuItems: []
    };

    // --- Initialization ---
    function init() {
        loadData();
        setupEventListeners();
        renderView('dashboard');
        updateCurrentDate();
    }

    // --- Data Management ---
    function loadData() {
        try {
            // Imported CSV Data - Force Update
            if (typeof products !== 'undefined') {
                state.products = products;
                localStorage.setItem('deerDeriProducts', JSON.stringify(products));
            } else {
                const localProducts = localStorage.getItem('deerDeriProducts');
                state.products = localProducts ? JSON.parse(localProducts) : [];
            }

            // Seed Admin User
            const adminEmail = 'admin@deerderi.com';
            const users = JSON.parse(localStorage.getItem('deerDeriUsers') || '[]');
            if (!users.find(u => u.email === adminEmail)) {
                users.push({
                    id: 'admin-001',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: adminEmail,
                    password: '159753Deerderi',
                    orders: [],
                    addresses: []
                });
                localStorage.setItem('deerDeriUsers', JSON.stringify(users));
            }

            // Load Categories
            const localCats = localStorage.getItem('deerDeriCategories');
            if (!localCats) {
                const initialCats = Array.from(new Set(state.products.map(p => p.category))).map(name => ({
                    id: name,
                    name: name.charAt(0).toUpperCase() + name.slice(1)
                }));
                state.categories = initialCats;
                localStorage.setItem('deerDeriCategories', JSON.stringify(initialCats));
            } else {
                state.categories = JSON.parse(localCats);
            }

            // Load Orders
            const allUsers = JSON.parse(localStorage.getItem('deerDeriUsers') || '[]');
            state.orders = [];
            allUsers.forEach(user => {
                if (user.orders) {
                    user.orders.forEach(order => {
                        state.orders.push({
                            ...order,
                            customerName: `${user.firstName} ${user.lastName}`,
                            userId: user.id
                        });
                    });
                }
            });
            state.orders.sort((a, b) => {
                const dateA = a.date.split('.').reverse().join('-');
                const dateB = b.date.split('.').reverse().join('-');
                return new Date(dateB) - new Date(dateA);
            });

            // Load Settings (USP, FAQ, InfoBoxes, Delivery, Banners)
            state.uspFeatures = JSON.parse(localStorage.getItem('deerDeriUSPFeatures')) || getDefaultUSP();
            state.faqItems = JSON.parse(localStorage.getItem('deerDeriFAQItems')) || getDefaultFAQ();
            state.productInfoBoxes = JSON.parse(localStorage.getItem('deerDeriProductInfoBoxes')) || getDefaultInfoBoxes();
            state.deliveryInfo = JSON.parse(localStorage.getItem('deerDeriDeliveryInfo')) || getDefaultDelivery();

            // Mosaic Items (Vitrin)
            const localMosaic = localStorage.getItem('deerDeriMosaicItems');
            if (!localMosaic) {
                state.mosaicItems = [
                    { id: '1', title: 'ÇANTALAR', subtitle: 'Zamansız Şıklık', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/canta', buttonText: 'KEŞFET', titleColor: '#ffffff' },
                    { id: '2', title: 'CÜZDANLAR', subtitle: 'Günlük Lüks', image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/cuzdan', buttonText: 'İNCELE', titleColor: '#ffffff' },
                    { id: '3', title: 'AKSESUARLAR', subtitle: 'Tarzını Tamamla', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', url: '/kategori/aksesuar', buttonText: 'GÖZ AT', titleColor: '#ffffff' }
                ];
                localStorage.setItem('deerDeriMosaicItems', JSON.stringify(state.mosaicItems));
            } else {
                state.mosaicItems = JSON.parse(localMosaic);
            }

            // Menu Items
            state.menuItems = JSON.parse(localStorage.getItem('deerDeriMenuItems')) || [];
            if (state.menuItems.length === 0) {
                // Default menu items
                state.menuItems = [
                    { id: Date.now() + 1, title: 'KARTLIK', url: '/kategori/kartlik', order: 0, active: true },
                    { id: Date.now() + 2, title: 'CÜZDAN', url: '/kategori/cuzdan', order: 1, active: true },
                    { id: Date.now() + 3, title: 'ÇANTA', url: '/kategori/canta', order: 2, active: true },
                    { id: Date.now() + 4, title: 'TEKNOLOJİ', url: '/kategori/teknoloji', order: 3, active: true },
                    { id: Date.now() + 5, title: 'İLETİŞİM', url: '/iletisim', order: 4, active: true }
                ];
                localStorage.setItem('deerDeriMenuItems', JSON.stringify(state.menuItems));
            }

        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback for critical state
            state.homepageBanners = [];
        }
    }

    // Default Generators to keep loadData clean
    function getDefaultUSP() {
        return [
            { id: 1, icon: 'fa-solid fa-leaf', title: 'Doğaya Saygı', description: 'Geri dönüştürülebilir doğa dostu materyaller.', order: 0, active: true },
            { id: 2, icon: 'fa-solid fa-gift', title: 'Özenli Paketleme', description: 'Her sipariş hediye paketi özeniyle hazırlanır.', order: 1, active: true },
            { id: 3, icon: 'fa-solid fa-star', title: '%100 Memnuniyet', description: 'Müşteri mutluluğu en büyük önceliğimiz.', order: 2, active: true },
            { id: 4, icon: 'fa-solid fa-truck-fast', title: 'Hızlı Kargo', description: 'Güvenli ve hızlı teslimat süreçleri.', order: 3, active: true },
            { id: 5, icon: 'fa-solid fa-headset', title: '7/24 İletişim', description: 'Satış öncesi ve sonrası kesintisiz destek.', order: 4, active: true }
        ];
    }
    function getDefaultFAQ() {
        return [
            { id: 1, question: 'Ürünüm ne zaman gelir?', answer: 'Siparişleriniz 1-3 iş günü içerisinde kargoya teslim edilmektedir. Yurtiçi Kargo ile gönderim sağlamaktayız.', order: 0, active: true },
            { id: 2, question: 'Ürünler gerçek deri mi?', answer: 'Evet, tüm ürünlerimiz %100 hakiki dana derisinden, geleneksel yöntemlerle el işçiliği kullanılarak üretilmektedir.', order: 1, active: true },
            { id: 3, question: 'İsim baskısı yapıyor musunuz?', answer: 'Evet, seçili cüzdan ve aksesuar ürünlerimizde ücretsiz olarak kişiselleştirme (isim/harf baskısı) hizmeti sunuyoruz.', order: 2, active: true }
        ];
    }
    function getDefaultInfoBoxes() {
        return [
            { id: 1, icon: 'fa-solid fa-rotate-left', title: 'İADE GARANTİSİ', description: '14 gün içinde iade garantisi*', order: 0, active: true },
            { id: 2, icon: 'fa-solid fa-earth-americas', title: 'ULUSLARARASI GÖNDERİM', description: '86\'dan fazla ülkeye gönderim', order: 1, active: true },
            { id: 3, icon: 'fa-solid fa-truck-fast', title: 'ÜCRETSİZ KARGO', description: '1500 TL ve üzeri siparişlerde', order: 2, active: true },
            { id: 4, icon: 'fa-solid fa-box-open', title: 'KOLAY İADE', description: '14 gün içinde değişim ve iade', order: 3, active: true }
        ];
    }
    function getDefaultDelivery() {
        return {
            shipping: { title: 'Kargo Bilgileri', icon: 'fa-solid fa-truck', items: [{ label: 'Kargo Süresi', text: 'Siparişiniz 1-3 iş günü içinde kargoya verilir.' }, { label: 'Teslimat Süresi', text: 'Kargoya verildikten sonra 2-5 iş günü içinde adresinize teslim edilir.' }, { label: 'Kargo Firması', text: 'Aras Kargo, MNG Kargo, Yurtiçi Kargo' }] },
            freeShipping: { title: 'Ücretsiz Kargo', icon: 'fa-solid fa-gift', items: [{ label: '', text: '1500 TL ve üzeri alışverişlerinizde kargo ücretsizdir.' }, { label: '', text: 'Türkiye\'nin her yerine ücretsiz kargo imkanı.' }] },
            packaging: { title: 'Paketleme', icon: 'fa-solid fa-box', items: [{ label: '', text: 'Ürünleriniz özel DEER DERİ kutusunda, koruyucu ambalaj ile gönderilir.' }, { label: '', text: 'Her ürün için bakım kılavuzu ve garanti belgesi eklenir.' }] },
            returns: { title: 'İade ve Değişim', icon: 'fa-solid fa-rotate-left', items: [{ label: 'İade Süresi', text: 'Ürünü teslim aldıktan sonra 14 gün içinde iade edebilirsiniz.' }, { label: 'Koşullar', text: 'Ürün kullanılmamış, etiketleri sökülmemiş ve orijinal ambalajında olmalıdır.' }, { label: 'İade Ücreti', text: 'İade kargo ücreti müşteriye aittir.' }] }
        };
    }

    function saveData() {
        localStorage.setItem('deerDeriProducts', JSON.stringify(state.products));
        localStorage.setItem('deerDeriCategories', JSON.stringify(state.categories));
        localStorage.setItem('deerDeriUSPFeatures', JSON.stringify(state.uspFeatures));
        localStorage.setItem('deerDeriFAQItems', JSON.stringify(state.faqItems));
        localStorage.setItem('deerDeriProductInfoBoxes', JSON.stringify(state.productInfoBoxes));
        localStorage.setItem('deerDeriDeliveryInfo', JSON.stringify(state.deliveryInfo));
        localStorage.setItem('deerDeriMosaicItems', JSON.stringify(state.mosaicItems));
        localStorage.setItem('deerDeriMenuItems', JSON.stringify(state.menuItems));
    }

    // --- View Controller ---
    function renderView(viewName, params = null) {
        state.currentView = viewName;
        const contentArea = document.getElementById('content-area');
        const viewTitle = document.getElementById('view-title');
        const addBtn = document.getElementById('add-item-btn');
        const addBtnText = document.getElementById('add-btn-text');

        // Update UI state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-view') === viewName);
        });

        // Update title based on view
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Ürünler',
            'orders': 'Siparişler',
            'categories': 'Kategoriler',
            'settings-usp': 'Site Özellikleri (USP)',
            'settings-faq': 'Sıkça Sorulan Sorular',
            'settings-infoboxes': 'Ürün Bilgi Kutuları',
            'settings-delivery': 'Teslimat Bilgileri',
            'settings-banners': 'Vitrin Yönetimi',
            'settings-menu': 'Menü Yönetimi',
            'settings-email': 'Mail Ayarları',
            'settings-footer': 'Footer Yönetimi',
            'order-detail': 'Sipariş Detayı'
        };
        viewTitle.textContent = titles[viewName] || viewName.charAt(0).toUpperCase() + viewName.slice(1);

        // Handle Add Button visibility
        if (viewName === 'products' || viewName === 'categories') {
            addBtn.style.display = 'inline-flex';
            addBtnText.textContent = viewName === 'products' ? 'Ürün Ekle' : 'Kategori Ekle';
        } else {
            addBtn.style.display = 'none';
        }

        switch (viewName) {
            case 'dashboard':
                renderDashboard(contentArea);
                break;
            case 'products':
                renderProducts(contentArea);
                break;
            case 'orders':
                renderOrders(contentArea);
                break;
            case 'order-detail':
                renderOrderDetail(contentArea, params);
                break;
            case 'categories':
                renderCategories(contentArea);
                break;
            case 'settings-usp':
                renderSettings(contentArea);
                break;
            case 'settings-faq':
                renderFAQSettings(contentArea);
                break;
            case 'settings-infoboxes':
                renderInfoBoxSettings(contentArea);
                break;
            case 'settings-delivery':
                renderDeliverySettings(contentArea);
                break;
            case 'settings-banners':
                renderSettingsBanners(contentArea);
                break;
            case 'settings-menu':
                renderMenuManagement(contentArea);
                break;
            case 'settings-email':
                if (typeof window.renderEmailSettings === 'function') {
                    window.renderEmailSettings(contentArea);
                } else {
                    contentArea.innerHTML = '<div class="card"><div class="card-body"><p>Mail ayarları yükleniyor...</p></div></div>';
                }
                break;
            case 'settings-footer':
                renderFooterManagement(contentArea);
                break;
        }
    }

    // Submenu toggle function
    window.toggleSubmenu = function (event, submenuId) {
        event.preventDefault();
        event.stopPropagation();

        const submenu = document.getElementById(submenuId);
        const parent = event.currentTarget;

        if (submenu) {
            submenu.classList.toggle('active');
            parent.classList.toggle('active');
        }
    };

    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = link.getAttribute('data-view');
                if (view) {
                    e.preventDefault();
                    renderView(view);
                }
            });
        });

        // Add Button
        const addBtn = document.getElementById('add-item-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (state.currentView === 'products') {
                    if (window.showProductModal) window.showProductModal();
                } else if (state.currentView === 'categories') {
                    if (window.showCategoryModal) window.showCategoryModal();
                }
            });
        }

        // Modal Close
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('admin-modal').style.display = 'none';
            });
        }

        // Outside Click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('admin-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // --- View Renderers ---
    function renderDashboard(container) {
        const totalRevenue = state.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = state.orders.length;
        const totalProducts = state.products.length;
        const activeCustomers = new Set(state.orders.map(o => o.userId)).size;
        const recentOrders = state.orders.slice(0, 3);

        // Calculate order statistics
        const deliveredOrders = state.orders.filter(o => o.status === 'Teslim Edildi').length;
        const processingOrders = state.orders.filter(o => o.status === 'İşleniyor' || o.status === 'Hazırlanıyor').length;
        const canceledOrders = state.orders.filter(o => o.status === 'İptal Edildi').length;

        const deliveredPercent = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
        const processingPercent = totalOrders > 0 ? Math.round((processingOrders / totalOrders) * 100) : 0;
        const canceledPercent = totalOrders > 0 ? Math.round((canceledOrders / totalOrders) * 100) : 0;

        // Get top selling products (mock data for now)
        const topProducts = state.products.slice(0, 3);

        // Calculate today's stats
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const todayStr = `${dd}.${mm}.${yyyy}`;

        const todaysOrders = state.orders.filter(o => o.date === todayStr);
        const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const todaysOrderCount = todaysOrders.length;

        container.innerHTML = `
            <!-- Stats Cards -->
            <div class="dashboard-stats-grid">
                <div class="dashboard-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Toplam Sipariş</span>
                        <div class="stat-icon-wrapper blue">
                            <i class="fa-solid fa-shopping-cart"></i>
                        </div>
                    </div>
                    <div class="stat-value">${totalOrders.toLocaleString('tr-TR')}</div>
                    <div class="stat-change positive">+4.5% son 30 gün</div>
                </div>

                <div class="dashboard-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Aktif Müşteriler</span>
                        <div class="stat-icon-wrapper purple">
                            <i class="fa-solid fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value">${activeCustomers.toLocaleString('tr-TR')}</div>
                    <div class="stat-change positive">+8.2% son 30 gün</div>
                </div>

                <div class="dashboard-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Satıcı Performansı</span>
                        <div class="stat-icon-wrapper orange">
                            <i class="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <div class="stat-value">4.3 / 5</div>
                    <div class="stat-change neutral">~0.2 puan</div>
                </div>

                <div class="dashboard-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Zamanında Teslimat</span>
                        <div class="stat-icon-wrapper green">
                            <i class="fa-solid fa-truck-fast"></i>
                        </div>
                    </div>
                    <div class="stat-value">92%</div>
                    <div class="stat-change positive">+2.1% son 30 gün</div>
                </div>

                <div class="dashboard-stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Toplam Gelir</span>
                        <div class="stat-icon-wrapper teal">
                            <i class="fa-solid fa-turkish-lira-sign"></i>
                        </div>
                    </div>
                    <div class="stat-value">${formatPrice(totalRevenue)}₺</div>
                    <div class="stat-change positive">+12.5% son 30 gün</div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Orders Summary with Today's Stats -->
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3>Sipariş Özetii</h3>
                        <select class="dashboard-select">
                            <option>Bugün</option>
                            <option>Bu Hafta</option>
                            <option>Bu Ay</option>
                        </select>
                    </div>
                    <div class="orders-summary">
                        <div class="order-stat-circle">
                            <div class="circle-progress" data-percent="${processingPercent}">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" stroke-width="10"/>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#4CAF50" stroke-width="10" 
                                            stroke-dasharray="${2 * Math.PI * 50}" 
                                            stroke-dashoffset="${2 * Math.PI * 50 * (1 - processingPercent / 100)}"
                                            transform="rotate(-90 60 60)"/>
                                </svg>
                                <div class="circle-text">
                                    <div class="circle-percent">${processingPercent}%</div>
                                    <div class="circle-label">İşlemde</div>
                                </div>
                            </div>
                        </div>
                        <div class="order-stat-circle">
                            <div class="circle-progress" data-percent="${deliveredPercent}">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" stroke-width="10"/>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#2196F3" stroke-width="10" 
                                            stroke-dasharray="${2 * Math.PI * 50}" 
                                            stroke-dashoffset="${2 * Math.PI * 50 * (1 - deliveredPercent / 100)}"
                                            transform="rotate(-90 60 60)"/>
                                </svg>
                                <div class="circle-text">
                                    <div class="circle-percent">${deliveredPercent}%</div>
                                    <div class="circle-label">Teslim Edildi</div>
                                </div>
                            </div>
                        </div>
                        <div class="order-stat-circle">
                            <div class="circle-progress" data-percent="${canceledPercent}">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" stroke-width="10"/>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#FF9800" stroke-width="10" 
                                            stroke-dasharray="${2 * Math.PI * 50}" 
                                            stroke-dashoffset="${2 * Math.PI * 50 * (1 - canceledPercent / 100)}"
                                            transform="rotate(-90 60 60)"/>
                                </svg>
                                <div class="circle-text">
                                    <div class="circle-percent">${canceledPercent}%</div>
                                    <div class="circle-label">İptal</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Today's Summary Box -->
                    <div class="today-orders-summary">
                        <div class="today-stat-item">
                            <div class="today-stat-label">Bugünkü Satışlar</div>
                            <div class="today-stat-value">${formatPrice(todaysRevenue)}₺</div>
                        </div>
                        <div class="today-stat-divider"></div>
                        <div class="today-stat-item">
                            <div class="today-stat-label">Bugünkü Sipariş</div>
                            <div class="today-stat-value">${todaysOrderCount} Adet</div>
                        </div>
                    </div>
                </div>

                <!-- Top Selling Items -->
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3>En Çok Satan Ürünler</h3>
                    </div>
                    <div class="top-products-list">
                        ${topProducts.map((product, index) => `
                            <a href="/urun-${product.slug || product.id}" target="_blank" class="top-product-item" style="text-decoration: none; color: inherit; display: flex; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-color); transition: background-color 0.2s;">
                                <div class="product-rank">${index + 1}</div>
                                <img src="${product.image || product.images?.[0] || 'placeholder.jpg'}" alt="${product.name}" class="product-thumb-small">
                                <div class="product-info-small">
                                    <div class="product-name-small">${product.name}</div>
                                    <div class="product-price-small">${formatPrice(product.price)}₺</div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>

                <!-- Recent Orders Box -->
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3>Son Siparişler</h3>
                        <button class="btn btn-sm btn-primary" onclick="window.renderView('orders')">Tüm Siparişlerim</button>
                    </div>
                    <div class="recent-orders-list-small">
                        ${recentOrders.map(order => `
                            <div class="recent-order-item-small" onclick="window.renderOrderDetail(${order.id})" style="cursor: pointer;">
                                <div class="order-icon-small">
                                    <i class="fa-solid fa-bag-shopping"></i>
                                </div>
                                <div class="order-info-small">
                                    <div class="order-customer-small">${order.customerName}</div>
                                    <div class="order-date-small">${order.date}</div>
                                </div>
                                <div class="order-total-small">${formatPrice(order.total)}₺</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Orders Trends Chart -->
                <div class="dashboard-card dashboard-card-wide">
                    <div class="dashboard-card-header">
                        <h3>Sipariş Trendleri</h3>
                        <select class="dashboard-select">
                            <option>Haftalık</option>
                            <option>Aylık</option>
                            <option>Yıllık</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <div class="bar-chart">
                            ${['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => {
            const height = Math.random() * 60 + 20;
            return `
                                    <div class="bar-wrapper">
                                        <div class="bar" style="height: ${height}%"></div>
                                        <div class="bar-label">${day}</div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Total Revenue Chart -->
                <div class="dashboard-card">
                    <div class="dashboard-card-header">
                        <h3>Toplam Gelir</h3>
                    </div>
                    <div class="revenue-chart">
                        <svg viewBox="0 0 300 150" class="area-chart">
                            <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style="stop-color:#26A69A;stop-opacity:0.3" />
                                    <stop offset="100%" style="stop-color:#26A69A;stop-opacity:0" />
                                </linearGradient>
                            </defs>
                            <path d="M 0 120 L 30 100 L 60 80 L 90 90 L 120 60 L 150 70 L 180 50 L 210 65 L 240 40 L 270 55 L 300 30 L 300 150 L 0 150 Z" 
                                  fill="url(#areaGradient)" stroke="none"/>
                            <path d="M 0 120 L 30 100 L 60 80 L 90 90 L 120 60 L 150 70 L 180 50 L 210 65 L 240 40 L 270 55 L 300 30" 
                                  fill="none" stroke="#26A69A" stroke-width="3"/>
                        </svg>
                        <div class="revenue-value">${formatPrice(totalRevenue)}₺</div>
                    </div>
                </div>
            </div>
        `;
    }

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

    function renderProducts(container) {
        container.innerHTML = `
            <div class="card">
                <div class="admin-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Görsel</th>
                                <th>Ürün Adı</th>
                                <th>Kategori</th>
                                <th>Fiyat</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.products.map(p => `
                                <tr>
                                    <td><img src="${p.images ? p.images[0] : ''}" class="product-img-td"></td>
                                    <td>
                                        <a href="/urun-${p.slug || slugifyText(p.name)}" target="_blank" style="color: inherit; text-decoration: none;">
                                            <strong>${p.name}</strong> <i class="fa-solid fa-external-link-alt" style="font-size: 12px; color: #999; margin-left: 5px;"></i>
                                        </a>
                                    </td>
                                    <td>${p.category}</td>
                                    <td>${formatPrice(p.price)}₺</td>
                                    <td>
                                        <div style="display: flex; gap: 10px;">
                                            <button class="btn btn-sm btn-icon btn-edit" onclick="window.editProduct(${p.id})">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                            <button class="btn btn-sm btn-icon btn-delete" onclick="window.deleteProduct(${p.id})">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderOrders(container) {
        container.innerHTML = `
            <div class="card">
                <div class="admin-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Sipariş No</th>
                                <th>Müşteri</th>
                                <th>Tarih</th>
                                <th>Tutar</th>
                                <th>Durum</th>
                                <th>Giriş</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.orders.map(order => `
                                <tr class="clickable-row" onclick="window.viewOrderDetail('${order.id}')">
                                    <td>#${order.id}</td>
                                    <td>${order.customerName}</td>
                                    <td>${order.date}</td>
                                    <td>${formatPrice(order.total)}₺</td>
                                    <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status || 'İşleniyor'}</span></td>
                                    <td style="text-align: center;"><i class="fa-solid fa-chevron-right" style="color: var(--text-muted);"></i></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderOrderDetail(container, orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) {
            container.innerHTML = '<h2>Sipariş bulunamadı.</h2>';
            return;
        }

        container.innerHTML = `
            <div class="order-detail-header">
                <div>
                    <button class="btn btn-sm" onclick="window.renderView('orders')" style="margin-bottom: 10px;">
                        <i class="fa-solid fa-arrow-left"></i> Siparişlere Dön
                    </button>
                    <h2>Sipariş Detayı #${order.id}</h2>
                    <p class="text-muted">
                        <i class="fa-regular fa-calendar"></i> Tarih: ${order.date} 
                        <span style="margin-left: 10px; border-left: 1px solid #ccc; padding-left: 10px;">
                            <i class="fa-regular fa-clock"></i> Saat: ${order.time || 'Belirtilmemiş'}
                        </span>
                    </p>
                </div>
                <div class="category-actions">
                    <button class="btn btn-outline" onclick="window.printInvoice('${order.id}')">
                        <i class="fa-solid fa-print"></i> Yazdır
                    </button>
                </div>
            </div>

            <div class="order-detail-grid">
                <div class="order-main-content">
                    <div class="card" style="margin-bottom: 25px;">
                        <div class="order-section-title">Sipariş Edilen Ürünler</div>
                        <div class="admin-table-wrapper">
                            <table class="order-items-table">
                                <thead>
                                    <tr>
                                        <th>Ürün</th>
                                        <th>Ad</th>
                                        <th>Fiyat</th>
                                        <th>Adet</th>
                                        <th>Toplam</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(order.items || []).map(item => `
                                        <tr>
                                            <td><img src="${item.image || (state.products.find(p => p.id == item.id)?.images[0])}" alt=""></td>
                                            <td>
                                                <strong>${item.name}</strong>
                                                ${item.embossing ? `<div style="font-size: 11px; color: var(--primary-color); margin-top: 4px;">
                                                    <i class="fa-solid fa-pen-nib"></i> Özel Baskı: <strong>${item.embossing}</strong>
                                                </div>` : ''}
                                            </td>
                                            <td>${formatPrice(item.price)}₺</td>
                                            <td>${item.quantity}</td>
                                            <td>${formatPrice(item.price * item.quantity)}₺</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <div class="order-section-title">Sipariş Durumu</div>
                        <p style="margin-bottom: 15px; color: #666; font-size: 14px;">Sipariş durumunu buradan güncelleyebilirsiniz.</p>
                        
                        <div style="display: flex; gap: 15px; align-items: center; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; font-size: 12px;">Durum Seçin</label>
                                <select id="detail-status-select" class="form-control" style="background: white;">
                                    <option value="Hazırlanıyor" ${order.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                                    <option value="Paketlendi" ${order.status === 'Paketlendi' ? 'selected' : ''}>Paketlendi</option>
                                    <option value="Kargolandı" ${order.status === 'Kargolandı' ? 'selected' : ''}>Kargolandı</option>
                                    <option value="Teslim Edildi" ${order.status === 'Teslim Edildi' ? 'selected' : ''}>Teslim Edildi</option>
                                    <option value="İptal Edildi" ${order.status === 'İptal Edildi' ? 'selected' : ''}>İptal Edildi</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="window.updateOrderStatusFromDetail('${order.id}', '${order.userId}')" style="align-self: flex-end;">
                                <i class="fa-solid fa-check"></i> Güncelle
                            </button>
                        </div>
                    </div>

                    <!-- Customer's Other Orders -->
                    <div class="card" style="margin-top: 25px;">
                        <div class="order-section-title">Müşterinin Diğer Siparişleri</div>
                        ${(() => {
                const pastOrders = state.orders.filter(o => o.userId === order.userId && o.id !== order.id);
                if (pastOrders.length === 0) {
                    return '<p style="color: #999; font-style: italic;">Bu müşterinin başka siparişi bulunmuyor.</p>';
                }
                return `
                                <div class="admin-table-wrapper">
                                    <table class="order-items-table">
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
                                            ${pastOrders.map(po => `
                                                <tr style="cursor: pointer;" onclick="window.viewOrderDetail('${po.id}')">
                                                    <td>#${po.id}</td>
                                                    <td>${po.date}</td>
                                                    <td>${formatPrice(po.total)}₺</td>
                                                    <td><span class="badge ${getStatusBadgeClass(po.status)}">${po.status || 'İşleniyor'}</span></td>
                                                    <td style="text-align: right;"><i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #ccc;"></i></td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `;
            })()}
                    </div>
                </div>

                <div class="order-sidebar">
                    <div class="card info-block">
                        <div class="order-section-title">Müşteri Bilgileri</div>
                        <div class="info-block">
                            <label>Müşteri Adı</label>
                            <p>${order.customerName}</p>
                        </div>
                        <div class="info-block">
                            <label>ID</label>
                            <p>#${order.userId || 'Misafir'}</p>
                        </div>
                    </div>

                    <div class="card info-block">
                        <div class="order-section-title">Teslimat Adresi</div>
                        <p>${order.address ? `
                            ${order.address.address}<br>
                            ${order.address.district} / ${order.address.city}
                        ` : 'Adres bilgisi bulunamadı.'}</p>
                    </div>

                    <div class="card order-summary-box">
                        <div class="order-section-title">Ödeme Özeti</div>
                        <div class="summary-row">
                            <span>Ödeme Yöntemi</span>
                            <strong>${order.paymentMethod || 'Kredi Kartı'}</strong>
                        </div>
                        <div class="summary-row">
                            <span>Ara Toplam</span>
                            <span>${formatPrice(order.total)}₺</span>
                        </div>
                        <div class="summary-row">
                            <span>Kargo</span>
                            <span>0,00₺</span>
                        </div>
                        <div class="summary-row total">
                            <span>Genel Toplam</span>
                            <span>${formatPrice(order.total)}₺</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCategories(container) {
        container.innerHTML = `
            <div class="card category-tree-container">
                <div class="card-header">
                    <h3 class="card-title">Kategori Yapısı (Sürükle & Bırak)</h3>
                    <small>Kategorileri taşımak için tutamacı kullanın. Alt kategori yapmak için içe sürükleyebilirsiniz.</small>
                </div>
                <div id="category-tree" class="category-list">
                    ${renderCategoryItems(state.categories)}
                </div>
                <div class="category-tree-footer">
                    <button class="btn btn-primary" id="save-categories-btn">
                        <i class="fa-solid fa-save"></i> Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        `;

        initSortable();

        document.getElementById('save-categories-btn').onclick = () => {
            const newStructure = serializeCategoryTree(document.getElementById('category-tree'));
            state.categories = newStructure;
            saveData();
            showToast('Kategori yapısı kaydedildi ve siteye yansıtıldı.');

            // Re-render to ensure stability
            renderCategories(container);

            // If the user has it open, sync would be nice but window reload is safer for localStorage sync across contexts
            // window.location.reload(); 
        };
    }

    function renderCategoryItems(categories) {
        if (!categories || categories.length === 0) return '';

        return categories.map(cat => `
            <div class="category-item" data-id="${cat.id}" data-name="${cat.name}" data-url="${cat.url || ''}">
                <div class="category-row">
                    <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                    <div class="category-label">
                        ${cat.name}
                        ${cat.url ? `<span class="category-url-badge" title="${cat.url}"><i class="fa-solid fa-link"></i></span>` : ''}
                    </div>
                    <div class="category-actions">
                        <button class="btn btn-sm btn-icon btn-edit" onclick="window.editCategory('${cat.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-delete" onclick="window.deleteCategory('${cat.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="nested-category-list">
                    ${renderCategoryItems(cat.children || [])}
                </div>
            </div>
        `).join('');
    }

    function initSortable() {
        const lists = document.querySelectorAll('.category-list, .nested-category-list');
        lists.forEach(list => {
            new Sortable(list, {
                group: 'nested',
                animation: 150,
                fallbackOnBody: true,
                swapThreshold: 0.65,
                handle: '.drag-handle',
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag'
            });
        });
    }

    function serializeCategoryTree(container) {
        const items = Array.from(container.children);
        return items.map(item => {
            const id = item.getAttribute('data-id');
            const name = item.getAttribute('data-name');
            const url = item.getAttribute('data-url') || '';
            const nestedList = item.querySelector('.nested-category-list');
            const children = nestedList ? serializeCategoryTree(nestedList) : [];

            return { id, name, url, children };
        });
    }

    function renderSettings(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Site Özellikleri (USP)</h3>
                    <button class="btn btn-primary" id="add-usp-btn">
                        <i class="fa-solid fa-plus"></i> Yeni Özellik Ekle
                    </button>
                </div>
                <div class="usp-features-list" id="usp-features-list">
                    ${renderUSPFeatures()}
                </div>
                <div class="category-tree-footer">
                    <button class="btn btn-primary" id="save-usp-btn">
                        <i class="fa-solid fa-save"></i> Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        `;

        // Initialize sortable
        initUSPSortable();

        // Event listeners
        document.getElementById('add-usp-btn').onclick = () => showUSPModal();
        document.getElementById('save-usp-btn').onclick = () => {
            const newOrder = serializeUSPOrder(document.getElementById('usp-features-list'));
            state.uspFeatures = newOrder;
            saveData();
            showToast('Site özellikleri kaydedildi ve siteye yansıtıldı.');
            renderSettings(container);
        };
    }

    function renderUSPFeatures() {
        if (!state.uspFeatures || state.uspFeatures.length === 0) {
            return '<p style="padding: 20px; text-align: center; color: #999;">Henüz özellik eklenmemiş.</p>';
        }

        return state.uspFeatures
            .sort((a, b) => a.order - b.order)
            .map(feature => `
                <div class="usp-feature-item ${!feature.active ? 'inactive' : ''}" data-id="${feature.id}">
                    <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                    <div class="usp-feature-icon">
                        <i class="${feature.icon}"></i>
                    </div>
                    <div class="usp-feature-content">
                        <div class="usp-feature-title">${feature.title}</div>
                        <div class="usp-feature-desc">${feature.description}</div>
                    </div>
                    <div class="usp-feature-actions">
                        <label class="toggle-switch" title="${feature.active ? 'Aktif' : 'Pasif'}">
                            <input type="checkbox" ${feature.active ? 'checked' : ''} onchange="window.toggleUSPFeature(${feature.id})">
                            <span class="toggle-slider"></span>
                        </label>
                        <button class="btn btn-sm btn-icon btn-edit" onclick="window.editUSPFeature(${feature.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-delete" onclick="window.deleteUSPFeature(${feature.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
    }

    function initUSPSortable() {
        const list = document.getElementById('usp-features-list');
        if (!list) return;

        new Sortable(list, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag'
        });
    }

    function serializeUSPOrder(container) {
        const items = Array.from(container.querySelectorAll('.usp-feature-item'));
        return items.map((item, index) => {
            const id = parseInt(item.getAttribute('data-id'));
            const feature = state.uspFeatures.find(f => f.id === id);
            return { ...feature, order: index };
        });
    }

    window.toggleUSPFeature = function (id) {
        const feature = state.uspFeatures.find(f => f.id === id);
        if (feature) {
            feature.active = !feature.active;
            saveData();
            showToast(`Özellik ${feature.active ? 'aktif' : 'pasif'} edildi.`);
        }
    };

    window.editUSPFeature = function (id) {
        const feature = state.uspFeatures.find(f => f.id === id);
        showUSPModal(feature);
    };

    window.deleteUSPFeature = function (id) {
        if (confirm('Bu özelliği silmek istediğinize emin misiniz?')) {
            state.uspFeatures = state.uspFeatures.filter(f => f.id !== id);
            saveData();
            renderView('settings');
            showToast('Özellik başarıyla silindi.');
        }
    };

    function showUSPModal(feature = null) {
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = feature ? 'Özelliği Düzenle' : 'Yeni Özellik Ekle';

        // FontAwesome icon categories for selection
        const iconCategories = {
            'E-Ticaret': ['fa-solid fa-truck-fast', 'fa-solid fa-box', 'fa-solid fa-gift', 'fa-solid fa-credit-card', 'fa-solid fa-shield-halved', 'fa-solid fa-headset'],
            'Kalite': ['fa-solid fa-star', 'fa-solid fa-award', 'fa-solid fa-certificate', 'fa-solid fa-medal', 'fa-solid fa-crown'],
            'Çevre': ['fa-solid fa-leaf', 'fa-solid fa-recycle', 'fa-solid fa-seedling', 'fa-solid fa-earth-americas'],
            'İletişim': ['fa-solid fa-phone', 'fa-solid fa-envelope', 'fa-solid fa-comments', 'fa-solid fa-message'],
            'Güvenlik': ['fa-solid fa-lock', 'fa-solid fa-user-shield', 'fa-solid fa-check-circle'],
            'Diğer': ['fa-solid fa-heart', 'fa-solid fa-thumbs-up', 'fa-solid fa-handshake', 'fa-solid fa-clock', 'fa-solid fa-calendar']
        };

        formArea.innerHTML = `
            <form id="usp-form">
                <div class="form-group">
                    <label>İkon Seçin</label>
                    <div class="icon-selector" id="icon-selector">
                        ${Object.entries(iconCategories).map(([category, icons]) => `
                            <div class="icon-category">
                                <div class="icon-category-title">${category}</div>
                                <div class="icon-grid">
                                    ${icons.map(icon => `
                                        <div class="icon-option ${feature?.icon === icon ? 'selected' : ''}" data-icon="${icon}">
                                            <i class="${icon}"></i>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <input type="hidden" name="icon" id="usp-icon-input" value="${feature?.icon || 'fa-solid fa-star'}" required>
                </div>
                <div class="form-group">
                    <label>Başlık</label>
                    <input type="text" name="title" class="form-control" value="${feature?.title || ''}" placeholder="Örn: Hızlı Kargo" required>
                </div>
                <div class="form-group">
                    <label>Açıklama</label>
                    <textarea name="description" class="form-control" rows="2" placeholder="Kısa açıklama yazın" required>${feature?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Durum</label>
                    <div class="toggle-switch-wrapper">
                        <span class="toggle-label">Pasif</span>
                        <label class="toggle-switch">
                            <input type="checkbox" name="active" ${feature?.active !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="toggle-label">Aktif</span>
                    </div>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

        // Icon selector functionality
        document.querySelectorAll('.icon-option').forEach(option => {
            option.onclick = function () {
                document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('usp-icon-input').value = this.getAttribute('data-icon');
            };
        });

        document.getElementById('usp-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const uspData = {
                id: feature ? feature.id : Date.now(),
                icon: formData.get('icon'),
                title: formData.get('title'),
                description: formData.get('description'),
                active: formData.get('active') === 'on',
                order: feature ? feature.order : state.uspFeatures.length
            };

            if (feature) {
                const idx = state.uspFeatures.findIndex(f => f.id === feature.id);
                if (idx > -1) state.uspFeatures[idx] = uspData;
            } else {
                state.uspFeatures.push(uspData);
            }

            saveData();
            modal.style.display = 'none';
            renderView('settings');
            showToast('Özellik kaydedildi.');
        };
    }

    // ===== FAQ MANAGEMENT FUNCTIONS =====

    function renderFAQSettings(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Sıkça Sorulan Sorular (FAQ)</h3>
                    <button class="btn btn-primary" id="add-faq-btn">
                        <i class="fa-solid fa-plus"></i> Yeni Soru Ekle
                    </button>
                </div>
                <div class="faq-list" id="faq-list">
                    ${renderFAQList()}
                </div>
                <div class="category-tree-footer">
                    <button class="btn btn-primary" id="save-faq-btn">
                        <i class="fa-solid fa-save"></i> Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        `;

        // Initialize sortable
        initFAQSortable();

        // Event listeners
        document.getElementById('add-faq-btn').onclick = () => showFAQModal();
        document.getElementById('save-faq-btn').onclick = () => {
            const newOrder = serializeFAQOrder(document.getElementById('faq-list'));
            state.faqItems = newOrder;
            saveData();
            showToast('FAQ değişiklikleri kaydedildi ve siteye yansıtıldı.');
            renderFAQSettings(container);
        };
    }

    function renderFAQList() {
        if (!state.faqItems || state.faqItems.length === 0) {
            return '<p style="padding: 20px; text-align: center; color: #999;">Henüz soru eklenmemiş.</p>';
        }

        return state.faqItems
            .sort((a, b) => a.order - b.order)
            .map(faq => `
                <div class="faq-admin-item ${!faq.active ? 'inactive' : ''}" data-id="${faq.id}">
                    <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                    <div class="faq-admin-content">
                        <div class="faq-admin-question">${faq.question}</div>
                        <div class="faq-admin-answer">${faq.answer}</div>
                    </div>
                    <div class="faq-admin-actions">
                        <label class="toggle-switch" title="${faq.active ? 'Aktif' : 'Pasif'}">
                            <input type="checkbox" ${faq.active ? 'checked' : ''} onchange="window.toggleFAQ(${faq.id})">
                            <span class="toggle-slider"></span>
                        </label>
                        <button class="btn btn-sm btn-icon btn-edit" onclick="window.editFAQ(${faq.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-delete" onclick="window.deleteFAQ(${faq.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
    }

    function initFAQSortable() {
        const list = document.getElementById('faq-list');
        if (!list) return;

        new Sortable(list, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag'
        });
    }

    function serializeFAQOrder(container) {
        const items = Array.from(container.querySelectorAll('.faq-admin-item'));
        return items.map((item, index) => {
            const id = parseInt(item.getAttribute('data-id'));
            const faq = state.faqItems.find(f => f.id === id);
            return { ...faq, order: index };
        });
    }

    window.toggleFAQ = function (id) {
        const faq = state.faqItems.find(f => f.id === id);
        if (faq) {
            faq.active = !faq.active;
            saveData();
            showToast(`Soru ${faq.active ? 'aktif' : 'pasif'} edildi.`);
        }
    };

    window.editFAQ = function (id) {
        const faq = state.faqItems.find(f => f.id === id);
        showFAQModal(faq);
    };

    window.deleteFAQ = function (id) {
        if (confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
            state.faqItems = state.faqItems.filter(f => f.id !== id);
            saveData();
            renderView('settings-faq');
            showToast('Soru başarıyla silindi.');
        }
    };

    function showFAQModal(faq = null) {
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = faq ? 'Soruyu Düzenle' : 'Yeni Soru Ekle';

        formArea.innerHTML = `
            <form id="faq-form">
                <div class="form-group">
                    <label>Soru <span class="required">*</span></label>
                    <input type="text" name="question" class="form-control" value="${faq?.question || ''}" placeholder="Örn: Ürünüm ne zaman gelir?" required>
                </div>
                <div class="form-group">
                    <label>Cevap <span class="required">*</span></label>
                    <textarea name="answer" class="form-control" rows="4" placeholder="Sorunun cevabını yazın" required>${faq?.answer || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Durum</label>
                    <div class="toggle-switch-wrapper">
                        <span class="toggle-label">Pasif</span>
                        <label class="toggle-switch">
                            <input type="checkbox" name="active" ${faq?.active !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="toggle-label">Aktif</span>
                    </div>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

        document.getElementById('faq-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const faqData = {
                id: faq ? faq.id : Date.now(),
                question: formData.get('question'),
                answer: formData.get('answer'),
                active: formData.get('active') === 'on',
                order: faq ? faq.order : state.faqItems.length
            };

            if (faq) {
                const idx = state.faqItems.findIndex(f => f.id === faq.id);
                if (idx > -1) state.faqItems[idx] = faqData;
            } else {
                state.faqItems.push(faqData);
            }

            saveData();
            modal.style.display = 'none';
            renderView('settings-faq');
            showToast('Soru kaydedildi.');
        };
    }

    // ===== PRODUCT INFO BOXES MANAGEMENT =====

    function renderInfoBoxSettings(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Ürün Bilgi Kutuları</h3>
                    <button class="btn btn-primary" id="add-infobox-btn">
                        <i class="fa-solid fa-plus"></i> Yeni Kutu Ekle
                    </button>
                </div>
                <div class="infobox-list" id="infobox-list">
                    ${renderInfoBoxList()}
                </div>
                <div class="category-tree-footer">
                    <button class="btn btn-primary" id="save-infobox-btn">
                        <i class="fa-solid fa-save"></i> Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        `;

        // Initialize sortable
        initInfoBoxSortable();

        // Event listeners
        document.getElementById('add-infobox-btn').onclick = () => showInfoBoxModal();
        document.getElementById('save-infobox-btn').onclick = () => {
            const newOrder = serializeInfoBoxOrder(document.getElementById('infobox-list'));
            state.productInfoBoxes = newOrder;
            saveData();
            showToast('Bilgi kutuları kaydedildi ve ürün sayfalarına yansıtıldı.');
            renderInfoBoxSettings(container);
        };
    }

    function renderInfoBoxList() {
        if (!state.productInfoBoxes || state.productInfoBoxes.length === 0) {
            return '<p style="padding: 20px; text-align: center; color: #999;">Henüz bilgi kutusu eklenmemiş.</p>';
        }

        return state.productInfoBoxes
            .sort((a, b) => a.order - b.order)
            .map(box => `
                <div class="infobox-admin-item ${!box.active ? 'inactive' : ''}" data-id="${box.id}">
                    <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                    <div class="infobox-admin-icon">
                        <i class="${box.icon}"></i>
                    </div>
                    <div class="infobox-admin-content">
                        <div class="infobox-admin-title">${box.title}</div>
                        <div class="infobox-admin-desc">${box.description}</div>
                    </div>
                    <div class="infobox-admin-actions">
                        <label class="toggle-switch" title="${box.active ? 'Aktif' : 'Pasif'}">
                            <input type="checkbox" ${box.active ? 'checked' : ''} onchange="window.toggleInfoBox(${box.id})">
                            <span class="toggle-slider"></span>
                        </label>
                        <button class="btn btn-sm btn-icon btn-edit" onclick="window.editInfoBox(${box.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-delete" onclick="window.deleteInfoBox(${box.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
    }

    function initInfoBoxSortable() {
        const list = document.getElementById('infobox-list');
        if (!list) return;

        new Sortable(list, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag'
        });
    }

    function serializeInfoBoxOrder(container) {
        const items = Array.from(container.querySelectorAll('.infobox-admin-item'));
        return items.map((item, index) => {
            const id = parseInt(item.getAttribute('data-id'));
            const box = state.productInfoBoxes.find(b => b.id === id);
            return { ...box, order: index };
        });
    }

    window.toggleInfoBox = function (id) {
        const box = state.productInfoBoxes.find(b => b.id === id);
        if (box) {
            box.active = !box.active;
            saveData();
            showToast(`Bilgi kutusu ${box.active ? 'aktif' : 'pasif'} edildi.`);
        }
    };

    window.editInfoBox = function (id) {
        const box = state.productInfoBoxes.find(b => b.id === id);
        showInfoBoxModal(box);
    };

    window.deleteInfoBox = function (id) {
        if (confirm('Bu bilgi kutusunu silmek istediğinize emin misiniz?')) {
            state.productInfoBoxes = state.productInfoBoxes.filter(b => b.id !== id);
            saveData();
            renderView('settings-infoboxes');
            showToast('Bilgi kutusu başarıyla silindi.');
        }
    };

    function showInfoBoxModal(box = null) {
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = box ? 'Bilgi Kutusunu Düzenle' : 'Yeni Bilgi Kutusu Ekle';

        // Icon categories for info boxes
        const iconCategories = {
            'Kargo & Teslimat': ['fa-solid fa-truck-fast', 'fa-solid fa-truck', 'fa-solid fa-box', 'fa-solid fa-box-open', 'fa-solid fa-dolly'],
            'İade & Garanti': ['fa-solid fa-rotate-left', 'fa-solid fa-shield-halved', 'fa-solid fa-certificate', 'fa-solid fa-medal'],
            'Ödeme & Güvenlik': ['fa-solid fa-credit-card', 'fa-solid fa-lock', 'fa-solid fa-shield', 'fa-solid fa-check-circle'],
            'İletişim & Destek': ['fa-solid fa-headset', 'fa-solid fa-phone', 'fa-solid fa-comments', 'fa-solid fa-envelope'],
            'Uluslararası': ['fa-solid fa-earth-americas', 'fa-solid fa-globe', 'fa-solid fa-plane'],
            'Diğer': ['fa-solid fa-star', 'fa-solid fa-heart', 'fa-solid fa-gift', 'fa-solid fa-award', 'fa-solid fa-clock']
        };

        formArea.innerHTML = `
            <form id="infobox-form">
                <div class="form-group">
                    <label>İkon Seçin</label>
                    <div class="icon-selector" id="icon-selector">
                        ${Object.entries(iconCategories).map(([category, icons]) => `
                            <div class="icon-category">
                                <div class="icon-category-title">${category}</div>
                                <div class="icon-grid">
                                    ${icons.map(icon => `
                                        <div class="icon-option ${box?.icon === icon ? 'selected' : ''}" data-icon="${icon}">
                                            <i class="${icon}"></i>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <input type="hidden" name="icon" id="infobox-icon-input" value="${box?.icon || 'fa-solid fa-box-open'}" required>
                </div>
                <div class="form-group">
                    <label>Başlık <span class="required">*</span></label>
                    <input type="text" name="title" class="form-control" value="${box?.title || ''}" placeholder="Örn: ÜCRETSİZ KARGO" required>
                </div>
                <div class="form-group">
                    <label>Açıklama <span class="required">*</span></label>
                    <input type="text" name="description" class="form-control" value="${box?.description || ''}" placeholder="Kısa açıklama" required>
                </div>
                <div class="form-group">
                    <label>Durum</label>
                    <div class="toggle-switch-wrapper">
                        <span class="toggle-label">Pasif</span>
                        <label class="toggle-switch">
                            <input type="checkbox" name="active" ${box?.active !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="toggle-label">Aktif</span>
                    </div>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

        // Icon selector functionality
        document.querySelectorAll('.icon-option').forEach(option => {
            option.onclick = function () {
                document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('infobox-icon-input').value = this.getAttribute('data-icon');
            };
        });

        document.getElementById('infobox-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const boxData = {
                id: box ? box.id : Date.now(),
                icon: formData.get('icon'),
                title: formData.get('title'),
                description: formData.get('description'),
                active: formData.get('active') === 'on',
                order: box ? box.order : state.productInfoBoxes.length
            };

            if (box) {
                const idx = state.productInfoBoxes.findIndex(b => b.id === box.id);
                if (idx > -1) state.productInfoBoxes[idx] = boxData;
            } else {
                state.productInfoBoxes.push(boxData);
            }

            saveData();
            modal.style.display = 'none';
            renderView('settings-infoboxes');
            showToast('Bilgi kutusu kaydedildi.');
        };
    }

    // ===== DELIVERY INFO MANAGEMENT =====

    function renderDeliverySettings(container) {
        const sections = [
            { key: 'shipping', label: 'Kargo Bilgileri' },
            { key: 'freeShipping', label: 'Ücretsiz Kargo' },
            { key: 'packaging', label: 'Paketleme' },
            { key: 'returns', label: 'İade ve Değişim' }
        ];

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Teslimat Bilgileri</h3>
                    <p style="color: #666; font-size: 13px; margin-top: 8px;">Ürün detay sayfasındaki teslimat tab'ında gösterilecek bilgileri düzenleyin.</p>
                </div>
                <div class="delivery-sections" style="padding: 20px;">
                    ${sections.map(section => {
            const data = state.deliveryInfo[section.key];
            return `
                            <div class="delivery-section-card" style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <i class="${data.icon}" style="font-size: 24px; color: var(--primary-color);"></i>
                                        <h4 style="margin: 0; font-size: 16px;">${data.title}</h4>
                                    </div>
                                    <button class="btn btn-sm btn-primary" onclick="window.editDeliverySection('${section.key}')">
                                        <i class="fa-solid fa-pen"></i> Düzenle
                                    </button>
                                </div>
                                <div style="padding-left: 36px;">
                                    ${data.items.map(item => `
                                        <p style="margin: 8px 0; font-size: 14px; color: #666;">
                                            ${item.label ? `<strong>${item.label}:</strong> ` : ''}${item.text}
                                        </p>
                                    `).join('')}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    window.editDeliverySection = function (sectionKey) {
        const section = state.deliveryInfo[sectionKey];
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = `${section.title} - Düzenle`;

        // Icon options
        const iconOptions = [
            'fa-solid fa-truck', 'fa-solid fa-truck-fast', 'fa-solid fa-box',
            'fa-solid fa-gift', 'fa-solid fa-rotate-left', 'fa-solid fa-shield',
            'fa-solid fa-check-circle', 'fa-solid fa-star'
        ];

        formArea.innerHTML = `
            <form id="delivery-form">
                <div class="form-group">
                    <label>Başlık</label>
                    <input type="text" name="title" class="form-control" value="${section.title}" required>
                </div>
                <div class="form-group">
                    <label>İkon</label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
                        ${iconOptions.map(icon => `
                            <div class="icon-option ${section.icon === icon ? 'selected' : ''}" 
                                 data-icon="${icon}" 
                                 style="width: 50px; height: 50px; border: 2px solid ${section.icon === icon ? 'var(--primary-color)' : '#ddd'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                                <i class="${icon}" style="font-size: 20px;"></i>
                            </div>
                        `).join('')}
                    </div>
                    <input type="hidden" name="icon" id="delivery-icon-input" value="${section.icon}" required>
                </div>
                <div class="form-group">
                    <label>Bilgiler</label>
                    <div id="delivery-items-container">
                        ${section.items.map((item, index) => `
                            <div class="delivery-item-row" style="display: flex; gap: 10px; margin-bottom: 10px;">
                                <input type="text" name="item_label_${index}" class="form-control" placeholder="Etiket (opsiyonel)" value="${item.label}" style="flex: 0 0 150px;">
                                <input type="text" name="item_text_${index}" class="form-control" placeholder="Metin" value="${item.text}" required style="flex: 1;">
                                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="addDeliveryItem()" style="margin-top: 10px;">
                        <i class="fa-solid fa-plus"></i> Satır Ekle
                    </button>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

        // Icon selector
        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.onclick = function () {
                document.querySelectorAll('.icon-option').forEach(o => {
                    o.style.borderColor = '#ddd';
                    o.classList.remove('selected');
                });
                this.style.borderColor = 'var(--primary-color)';
                this.classList.add('selected');
                document.getElementById('delivery-icon-input').value = this.getAttribute('data-icon');
            };
        });

        // Add item function
        window.addDeliveryItem = function () {
            const container = document.getElementById('delivery-items-container');
            const index = container.children.length;
            const newRow = document.createElement('div');
            newRow.className = 'delivery-item-row';
            newRow.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
            newRow.innerHTML = `
                <input type="text" name="item_label_${index}" class="form-control" placeholder="Etiket (opsiyonel)" style="flex: 0 0 150px;">
                <input type="text" name="item_text_${index}" class="form-control" placeholder="Metin" required style="flex: 1;">
                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            container.appendChild(newRow);
        };

        // Form submit
        document.getElementById('delivery-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const items = [];
            const container = document.getElementById('delivery-items-container');
            Array.from(container.children).forEach((row, index) => {
                const label = formData.get(`item_label_${index}`) || '';
                const text = formData.get(`item_text_${index}`);
                if (text) {
                    items.push({ label, text });
                }
            });

            state.deliveryInfo[sectionKey] = {
                title: formData.get('title'),
                icon: formData.get('icon'),
                items: items
            };

            saveData();
            modal.style.display = 'none';
            renderView('settings-delivery');
            showToast('Teslimat bilgileri güncellendi.');
        };
    };

    // ===== MOSAIC (VITRIN) MANAGEMENT - PROFESSIONAL EDITION =====
    // (Duplicate function removed)

    // --- Helpers ---
    function formatPrice(price) {
        if (!price) return "0";
        return price.toLocaleString('tr-TR');
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Teslim Edildi': return 'badge-success';
            case 'Kargoya Verildi': return 'badge-info';
            case 'İptal Edildi': return 'badge-danger';
            default: return 'badge-warning';
        }
    }

    function updateCurrentDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    function renderInfoBoxSettings(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header-actions">
                     <p class="text-muted">Ürün detay sayfasında görünen "İade Garantisi", "Kargo" gibi bilgi kutularını buradan yönetebilirsiniz.</p>
                     <button class="btn btn-primary btn-sm" onclick="window.showInfoBoxModal()">
                        <i class="fa-solid fa-plus"></i> Yeni Ekle
                    </button>
                </div>
                <div class="admin-table-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th width="50">Sıra</th>
                                <th>İkon</th>
                                <th>Başlık</th>
                                <th>Açıklama</th>
                                <th width="100">Durum</th>
                                <th width="120">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="infobox-list">
                            <!-- Populated by renderInfoBoxList -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        renderInfoBoxList();
    }

    // ===== VITRIN (MOSAIC) MANAGEMENT =====
    function renderSettingsBanners(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header-actions">
                     <p class="text-muted">Anasayfadaki geniş "Vitrin" alanını buradan yönetebilirsiniz. Değişiklikler anlık olarak yansır.</p>
                     <button class="btn btn-primary btn-sm" onclick="window.showMosaicModal()">
                        <i class="fa-solid fa-plus"></i> Yeni Ekle
                    </button>
                </div>
                
                <!-- Live Preview Section -->
                <div style="margin: 20px 0; border: 1px solid #eee; padding: 15px; background: #f9f9f9;">
                    <h4 style="margin-bottom: 10px; font-size: 14px;">Canlı Önizleme</h4>
                    <div id="mosaic-live-preview" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <!-- Preview Items -->
                    </div>
                </div>

                <div class="admin-table-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th width="100">Görsel</th>
                                <th>Başlık</th>
                                <th>Alt Başlık</th>
                                <th>Link</th>
                                <th width="120">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="mosaic-list">
                            <!-- Populated by renderMosaicList -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        renderMosaicList();
    }

    function renderMosaicList() {
        const tbody = document.getElementById('mosaic-list');
        const preview = document.getElementById('mosaic-live-preview');

        if (!state.mosaicItems || state.mosaicItems.length === 0) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center">Vitrin öğesi bulunamadı.</td></tr>';
            if (preview) preview.innerHTML = '<p class="text-muted">Önizleme yok</p>';
            return;
        }

        if (tbody) {
            tbody.innerHTML = state.mosaicItems.map((item, index) => `
                <tr>
                    <td><img src="${item.image}" style="height: 50px; object-fit: cover; border-radius: 4px;"></td>
                    <td><span style="color: ${item.titleColor || '#000'}">●</span> ${item.title}</td>
                    <td>${item.subtitle || '-'}</td>
                    <td>${item.url}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-icon btn-edit" onclick="window.editMosaicItem(${index})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-sm btn-icon btn-delete" onclick="window.deleteMosaicItem(${index})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        if (preview) {
            preview.innerHTML = state.mosaicItems.map(item => `
                <div style="position: relative; height: 150px; overflow: hidden; border-radius: 4px;">
                    <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.2); display:flex; flex-direction:column; justify-content:center; align-items:center; color:#fff; text-align:center;">
                        <span style="font-size: 10px; opacity: 0.9;">${item.subtitle || ''}</span>
                        <strong style="font-size: 14px; color: ${item.titleColor || '#fff'};">${item.title}</strong>
                        <span style="font-size: 9px; padding: 3px 8px; border: 1px solid #fff; margin-top: 5px;">${item.buttonText || 'İNCELE'}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    window.editMosaicItem = function (index) {
        window.showMosaicModal(state.mosaicItems[index], index);
    };

    window.deleteMosaicItem = function (index) {
        if (confirm('Bu vitrin öğesini silmek istediğinize emin misiniz?')) {
            state.mosaicItems.splice(index, 1);
            saveData();
            renderMosaicList();
        }
    };

    window.showMosaicModal = function (item = null, index = -1) {
        const modal = document.getElementById('admin-modal');
        const title = document.getElementById('modal-title');
        const formArea = document.getElementById('modal-form-area');

        title.textContent = item ? 'Vitrin Düzenle' : 'Yeni Vitrin Ekle';
        modal.style.display = 'flex';

        formArea.innerHTML = `
            <form id="mosaic-form">
                <div class="form-group">
                    <label>Başlık</label>
                    <input type="text" id="mosaic-title" class="form-control" value="${item ? item.title : ''}" required>
                </div>
                <div class="form-group">
                    <label>Alt Başlık</label>
                    <input type="text" id="mosaic-subtitle" class="form-control" value="${item ? item.subtitle || '' : ''}">
                </div>
                <div class="form-group">
                    <label>Görsel</label>
                    <div style="border: 2px dashed #ddd; padding: 20px; text-align: center; border-radius: 8px; background: #fafafa;" id="drop-area">
                        <input type="file" id="mosaic-file-upload" accept="image/*" style="display: none;" onchange="window.handleImageSelect(this, 'mosaic-image', 'preview-img-box')">
                        <div id="preview-img-box">
                            ${item && item.image ? `<img src="${item.image}" style="max-height: 100px; max-width: 100%; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">` : '<p style="color:#999; margin: 0;">Görsel Yüklemek İçin Tıklayın</p><i class="fa-solid fa-cloud-arrow-up" style="font-size: 30px; color: #ccc; margin-top: 10px;"></i>'}
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary" style="margin-top: 10px;" onclick="document.getElementById('mosaic-file-upload').click()">Bilgisayardan Seç</button>
                    </div>
                    <input type="hidden" id="mosaic-image" value="${item ? item.image : ''}" required>
                </div>
                <div class="form-group">
                    <label>Yönlendirme Linki (URL)</label>
                    <input type="text" id="mosaic-url" class="form-control" value="${item ? item.url : '/kategori/'}">
                </div>
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label>Buton Metni</label>
                            <input type="text" id="mosaic-btn-text" class="form-control" value="${item ? item.buttonText || 'İNCELE' : 'İNCELE'}">
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group">
                            <label>Başlık Rengi</label>
                            <input type="color" id="mosaic-color" class="form-control" value="${item ? item.titleColor || '#ffffff' : '#ffffff'}" style="height: 40px;">
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('admin-modal').style.display='none'">İptal</button>
                    <button type="submit" class="btn btn-primary" id="save-mosaic-btn">Kaydet</button>
                </div>
            </form>
        `;

        const form = document.getElementById('mosaic-form');
        form.onsubmit = function (e) {
            e.preventDefault();
            const imgVal = document.getElementById('mosaic-image').value;
            if (!imgVal) {
                alert('Lütfen bir görsel yükleyin!');
                return;
            }

            const saveBtn = document.getElementById('save-mosaic-btn');
            saveBtn.textContent = 'Kaydediliyor...';
            saveBtn.disabled = true;

            // Check if it is a Base64 string that needs uploading (starts with data:image)
            if (imgVal.startsWith('data:image')) {
                // Upload to server
                fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imgVal })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            finalizeSave(data.url);
                        } else {
                            alert('Görsel yüklenirken hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
                            saveBtn.textContent = 'Kaydet';
                            saveBtn.disabled = false;
                        }
                    })
                    .catch(err => {
                        console.error('Upload Error:', err);
                        alert('Sunucu hatası! Görsel yüklenemedi.');
                        saveBtn.textContent = 'Kaydet';
                        saveBtn.disabled = false;
                    });
            } else {
                // Already a URL (previous image)
                finalizeSave(imgVal);
            }

            function finalizeSave(finalImageUrl) {
                const newItem = {
                    id: item ? item.id : Date.now().toString(),
                    title: document.getElementById('mosaic-title').value,
                    subtitle: document.getElementById('mosaic-subtitle').value,
                    image: finalImageUrl,
                    url: document.getElementById('mosaic-url').value,
                    buttonText: document.getElementById('mosaic-btn-text').value,
                    titleColor: document.getElementById('mosaic-color').value
                };

                if (index > -1) {
                    state.mosaicItems[index] = newItem;
                } else {
                    state.mosaicItems.push(newItem);
                }

                saveData();
                renderMosaicList();
                document.getElementById('admin-modal').style.display = 'none';
                showToast('Vitrin öğesi başarıyla kaydedildi!', 'success');
            }
        };
    };

    // Helper for handling file selection and preview
    window.handleImageSelect = function (input, targetInputId, previewBoxId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Determine file size (limit client side to avoid freeze)
                if (e.total > 5 * 1024 * 1024) { // 5MB
                    alert('Dosya boyutu çok yüksek. Lütfen 5MB altı bir görsel seçin.');
                    return;
                }

                document.getElementById(targetInputId).value = e.target.result; // Temporarily store Base64
                // Update Preview
                const box = document.getElementById(previewBoxId);
                box.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; max-width: 100%; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // ===== MENU MANAGEMENT =====
    function renderMenuManagement(container) {
        if (!state.menuItems) state.menuItems = [];
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Menü Yönetimi</h3>
                    <p style="color: #666; font-size: 13px; margin-top: 8px;">Site header menüsünü buradan yönetin.</p>
                    <button class="btn btn-primary" style="margin-top: 10px;" onclick="window.showMenuItemModal()">
                        <i class="fa-solid fa-plus"></i> Yeni Menü Ekle
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Sıra</th>
                                    <th>Başlık</th>
                                    <th>URL</th>
                                    <th>Aktif</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody id="menu-sortable-list">
                                ${state.menuItems.sort((a, b) => a.order - b.order).map(item => `
                                    <tr data-id="${item.id}">
                                        <td>${item.order + 1}</td>
                                        <td><strong>${item.title}</strong></td>
                                        <td><a href="${item.url}" target="_blank">${item.url}</a></td>
                                        <td>${item.active ? '<span class="badge badge-success">Evet</span>' : '<span class="badge badge-danger">Hayır</span>'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="window.showMenuItemModal('${item.id}')">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="window.deleteMenuItem('${item.id}')">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer" style="margin-top: 20px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
                    <button class="btn btn-success" onclick="window.saveAndRedirect()">
                        <i class="fa-solid fa-check"></i> Sıralamayı Kaydet ve Siteye Git
                    </button>
                </div>
            </div>
        `;

        window.saveAndRedirect = function () {
            saveData();
            showToast('Değişiklikler kaydedildi, siteye yönlendiriliyor...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        };

        const sortableList = document.getElementById('menu-sortable-list');
        if (sortableList) {
            new Sortable(sortableList, {
                animation: 150,
                onEnd: function (evt) {
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;

                    const [movedItem] = state.menuItems.splice(oldIndex, 1);
                    state.menuItems.splice(newIndex, 0, movedItem);

                    state.menuItems.forEach((item, index) => {
                        item.order = index;
                    });

                    saveData();
                    renderView('settings-menu');
                    showToast('Menü sırası güncellendi.');
                },
            });
        }
    }

    window.deleteMenuItem = function (id) {
        if (confirm('Bu menü öğesini silmek istediğinize emin misiniz?')) {
            state.menuItems = state.menuItems.filter(item => item.id != id);
            state.menuItems.forEach((item, index) => {
                item.order = index;
            });
            saveData();
            renderView('settings-menu');
            showToast('Menü öğesi başarıyla silindi.');
        }
    };

    window.showMenuItemModal = function (id = null) {
        const menuItem = id ? state.menuItems.find(m => m.id == id) : null;
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = menuItem ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi Ekle';

        formArea.innerHTML = `
            <form id="menu-form">
                <div class="form-group">
                    <label>Başlık</label>
                    <input type="text" name="title" class="form-control" value="${menuItem ? menuItem.title : ''}" placeholder="Örn: İletişim" required>
                </div>
                <div class="form-group">
                    <label>URL (Link)</label>
                    <input type="text" name="url" class="form-control" value="${menuItem ? menuItem.url : ''}" placeholder="Örn: /iletisim veya https://example.com" required>
                </div>
                <div class="form-group form-check">
                    <input type="checkbox" name="active" class="form-check-input" id="menu-active" ${menuItem && menuItem.active ? 'checked' : ''}>
                    <label class="form-check-label" for="menu-active">Aktif</label>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

        document.getElementById('menu-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const menuData = {
                id: menuItem ? menuItem.id : Date.now(),
                title: formData.get('title'),
                url: formData.get('url'),
                active: formData.get('active') === 'on',
                order: menuItem ? menuItem.order : state.menuItems.length
            };

            if (menuItem) {
                const idx = state.menuItems.findIndex(m => m.id == menuItem.id);
                if (idx > -1) state.menuItems[idx] = menuData;
            } else {
                state.menuItems.push(menuData);
            }

            saveData();
            modal.style.display = 'none';
            renderView('settings-menu');
            showToast('Menü öğesi kaydedildi.');
        };
    };

    function setupEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('.nav-link[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                renderView(link.getAttribute('data-view'));
            });
        });

        // Add Button
        document.getElementById('add-item-btn').addEventListener('click', () => {
            if (state.currentView === 'products') {
                showProductModal();
            } else if (state.currentView === 'categories') {
                showCategoryModal();
            }
        });

        // Modal Close
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('admin-modal').style.display = 'none';
        });

        window.onclick = (event) => {
            if (event.target == document.getElementById('admin-modal')) {
                document.getElementById('admin-modal').style.display = 'none';
            }
        };
    }

    // --- CRUD Actions (Injected to Window for simple HTML access) ---
    window.renderView = renderView;

    window.editProduct = function (id) {
        const product = state.products.find(p => p.id === id);
        showProductModal(product);
    };

    window.deleteProduct = function (id) {
        if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            state.products = state.products.filter(p => p.id !== id);
            saveData();
            renderView('products');
            showToast('Ürün başarıyla silindi.');
        }
    };

    // Helper function to find category recursively in nested tree
    function findCategoryById(list, id) {
        for (let cat of list) {
            if (cat.id === id) return cat;
            if (cat.children) {
                const found = findCategoryById(cat.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    window.editCategory = function (id) {
        const cat = findCategoryById(state.categories, id);
        showCategoryModal(cat);
    };

    window.deleteCategory = function (id) {
        const productCount = state.products.filter(p => p.category === id).length;
        if (productCount > 0) {
            alert(`Bu kategoride ${productCount} ürün bulunuyor. Silmeden önce ürünlerin kategorisini değiştirmelisiniz.`);
            return;
        }
        if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
            // Recursive function to remove category from state.categories tree
            const removeById = (list, idToRemove) => {
                return list.filter(item => {
                    if (item.id === idToRemove) return false;
                    if (item.children) item.children = removeById(item.children, idToRemove);
                    return true;
                });
            };

            state.categories = removeById(state.categories, id);
            saveData();
            renderView('categories');
            showToast('Kategori başarıyla silindi.');
        }
    };

    window.manageOrder = function (orderId) {
        const order = state.orders.find(o => o.id === orderId);
        showOrderModal(order);
    };

    window.viewOrderDetail = function (orderId) {
        renderView('order-detail', orderId);
    };

    window.printInvoice = function (orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        // Create or get print container
        let printContainer = document.getElementById('print-container');
        if (!printContainer) {
            printContainer = document.createElement('div');
            printContainer.id = 'print-container';
            document.body.appendChild(printContainer);
        }

        const itemsHtml = (order.items || []).map(item => `
            <tr>
                <td>
                    ${item.name}
                    ${item.embossing ? `<div style="font-size: 10px; font-weight: 600; margin-top: 2px;">(Özel Baskı: ${item.embossing})</div>` : ''}
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatPrice(item.price)}₺</td>
                <td style="text-align: right;">${formatPrice(item.price * item.quantity)}₺</td>
            </tr>
        `).join('');

        printContainer.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-title">DEER DERİ</div>
                <div style="font-size: 12px;">Premium Deri Ürünleri | deerderi.com</div>
            </div>
            
            <div class="receipt-grid">
                <div>
                    <strong>SİPARİŞ BİLGİLERİ</strong><br>
                    Sipariş No: #${order.id}<br>
                    Tarih: ${order.date}<br>
                    Durum: ${order.status || 'İşleniyor'}
                </div>
                <div>
                    <strong>MÜŞTERİ BİLGİLERİ</strong><br>
                    ${order.customerName}<br>
                    ${order.address ? order.address.address : ''}<br>
                    ${order.address ? `${order.address.district} / ${order.address.city}` : ''}
                </div>
            </div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Ürün Açıklaması</th>
                        <th style="text-align: center;">Adet</th>
                        <th style="text-align: right;">Fiyat</th>
                        <th style="text-align: right;">Toplam</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="receipt-summary">
                <div style="margin-bottom: 5px;">Ara Toplam: ${formatPrice(order.total)}₺</div>
                <div style="margin-bottom: 5px;">Kargo: 0,00₺</div>
                <div style="font-size: 16px; font-weight: 700;">GENEL TOPLAM: ${formatPrice(order.total)}₺</div>
            </div>

            <div class="receipt-footer">
                <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
                <p>Deer Deri - İstanbul, Türkiye</p>
            </div>
        `;

        window.print();
    };

    // --- Modal Forms ---
    // Temp storage for uploaded images
    let tempProductImages = [];
    let autoSaveInterval = null;

    function showProductModal(product = null) {
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        // Add class for full-width modal
        modal.classList.add('product-form-modal');

        title.textContent = product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle';

        // Initialize temp images from product or empty
        tempProductImages = product && product.images ?
            (Array.isArray(product.images[0]) || typeof product.images[0] === 'object' ?
                product.images :
                product.images.map((url, i) => ({ url, isMain: i === 0, isFeatured: false, order: i }))
            ) : [];

        // Generate unique SKU
        const generateSKU = () => 'PRD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const sku = product?.sku || generateSKU();

        // Flatten categories for checkbox list
        const flattenCategories = (cats, prefix = '') => {
            let result = [];
            cats.forEach(cat => {
                result.push({ id: cat.id, name: prefix + cat.name });
                if (cat.children && cat.children.length > 0) {
                    result = result.concat(flattenCategories(cat.children, prefix + '— '));
                }
            });
            return result;
        };
        const flatCats = flattenCategories(state.categories);
        const productCategories = product?.category ? (Array.isArray(product.category) ? product.category : [product.category]) : [];

        formArea.innerHTML = `
            <div class="product-form-container">
                <div class="product-form-main">
                    
                    <!-- SECTION A: Temel Bilgiler -->
                    <div class="form-card">
                        <div class="form-card-header">
                            <i class="fa-solid fa-info-circle"></i>
                            <h4>Temel Bilgiler</h4>
                        </div>
                        <div class="form-card-body">
                            <div class="form-group">
                                <label>Ürün Başlığı <span class="required">*</span></label>
                                <div class="char-counter-wrapper">
                                    <input type="text" id="pf-title" class="form-control" maxlength="200" 
                                        value="${product?.name || ''}" placeholder="Ürün adını girin" required>
                                    <span class="char-counter" id="title-counter">0/200</span>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ürün Kodu (SKU)</label>
                                    <input type="text" id="pf-sku" class="form-control" value="${sku}" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Durum</label>
                                    <div class="toggle-switch-wrapper">
                                        <span class="toggle-label ${product?.status === 'passive' ? 'active' : 'inactive'}">Pasif</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="pf-status" ${product?.status !== 'passive' ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <span class="toggle-label ${product?.status !== 'passive' ? 'active' : 'inactive'}">Aktif</span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Kategoriler</label>
                                <div class="category-checkbox-list" id="pf-categories">
                                    ${flatCats.map(cat => `
                                        <div class="category-checkbox-item">
                                            <input type="checkbox" id="cat-${cat.id}" value="${cat.id}" 
                                                ${productCategories.includes(cat.id) ? 'checked' : ''}>
                                            <label for="cat-${cat.id}">${cat.name}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION B: SEO & İçerik -->
                    <div class="form-card">
                        <div class="form-card-header">
                            <i class="fa-solid fa-search"></i>
                            <h4>SEO & İçerik</h4>
                        </div>
                        <div class="form-card-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>SEO Başlığı</label>
                                    <div class="char-counter-wrapper">
                                        <input type="text" id="pf-seo-title" class="form-control" maxlength="60" 
                                            value="${product?.seoTitle || ''}" placeholder="Meta başlık (60 karakter)">
                                        <span class="char-counter" id="seo-title-counter">0/60</span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>URL Slug</label>
                                    <input type="text" id="pf-slug" class="form-control" 
                                        value="${product?.slug || ''}" placeholder="otomatik-olusturulur">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Meta Açıklama</label>
                                <div class="char-counter-wrapper">
                                    <textarea id="pf-seo-desc" class="form-control" maxlength="160" rows="2"
                                        placeholder="Arama sonuçlarında görünecek açıklama (160 karakter)">${product?.seoDescription || ''}</textarea>
                                    <span class="char-counter" id="seo-desc-counter">0/160</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Anahtar Kelimeler</label>
                                <div class="tag-input-wrapper" id="keywords-wrapper">
                                    ${(product?.keywords || []).map(k => `<span class="tag-item">${k}<span class="remove-tag" onclick="removeKeyword(this)">×</span></span>`).join('')}
                                    <input type="text" class="tag-input" id="pf-keywords-input" placeholder="Kelime yazıp Enter'a basın">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Kısa Açıklama</label>
                                <div class="char-counter-wrapper">
                                    <textarea id="pf-short-desc" class="form-control" maxlength="200" rows="2"
                                        placeholder="Ürün kartlarında görünecek kısa açıklama">${product?.shortDescription || ''}</textarea>
                                    <span class="char-counter" id="short-desc-counter">0/200</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Detaylı Açıklama</label>
                                <div class="rich-text-toolbar">
                                    <button type="button" onclick="execRichCmd('bold')"><i class="fa-solid fa-bold"></i></button>
                                    <button type="button" onclick="execRichCmd('italic')"><i class="fa-solid fa-italic"></i></button>
                                    <button type="button" onclick="execRichCmd('underline')"><i class="fa-solid fa-underline"></i></button>
                                    <div class="separator"></div>
                                    <button type="button" onclick="execRichCmd('insertUnorderedList')"><i class="fa-solid fa-list-ul"></i></button>
                                    <button type="button" onclick="execRichCmd('insertOrderedList')"><i class="fa-solid fa-list-ol"></i></button>
                                    <div class="separator"></div>
                                    <button type="button" onclick="execRichCmd('justifyLeft')"><i class="fa-solid fa-align-left"></i></button>
                                    <button type="button" onclick="execRichCmd('justifyCenter')"><i class="fa-solid fa-align-center"></i></button>
                                </div>
                                <div id="pf-description" class="rich-text-editor" contenteditable="true">${product?.description || ''}</div>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION E: Stok Bilgileri -->
                    <div class="form-card">
                        <div class="form-card-header">
                            <i class="fa-solid fa-boxes-stacked"></i>
                            <h4>Stok Bilgileri</h4>
                        </div>
                        <div class="form-card-body">
                            <div class="form-row triple">
                                <div class="form-group">
                                    <label>Stok Miktarı</label>
                                    <input type="number" id="pf-stock" class="form-control" min="0" 
                                        value="${product?.stock ?? 0}" placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label>Uyarı Seviyesi</label>
                                    <input type="number" id="pf-stock-alert" class="form-control" min="0" 
                                        value="${product?.stockAlertLevel ?? 5}" placeholder="5">
                                </div>
                                <div class="form-group">
                                    <label>Barkod/EAN</label>
                                    <input type="text" id="pf-barcode" class="form-control" 
                                        value="${product?.barcode || ''}" placeholder="Opsiyonel">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ağırlık (gram)</label>
                                    <input type="number" id="pf-weight" class="form-control" min="0" 
                                        value="${product?.weight || ''}" placeholder="Opsiyonel">
                                </div>
                                <div class="form-group">
                                    <label>Boyutlar (GxDxY cm)</label>
                                    <input type="text" id="pf-dimensions" class="form-control" 
                                        value="${product?.dimensions || ''}" placeholder="Örn: 20x15x5">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SIDEBAR -->
                <div class="product-form-sidebar">
                    
                    <!-- SECTION C: Fiyatlandırma -->
                    <div class="form-card">
                        <div class="form-card-header">
                            <i class="fa-solid fa-tag"></i>
                            <h4>Fiyatlandırma</h4>
                        </div>
                        <div class="form-card-body">
                            <div class="form-group">
                                <label>Piyasa Fiyatı (Eski)</label>
                                <div class="price-input-group">
                                    <input type="number" id="pf-old-price" class="form-control" min="0" step="0.01"
                                        value="${product?.oldPrice || ''}" placeholder="0.00" oninput="calculateDiscount()">
                                    <span class="price-currency">₺</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Satış Fiyatı <span class="required">*</span></label>
                                <div class="price-input-group">
                                    <input type="number" id="pf-price" class="form-control" min="0" step="0.01"
                                        value="${product?.price || ''}" placeholder="0.00" required oninput="calculateDiscount()">
                                    <span class="price-currency">₺</span>
                                </div>
                            </div>
                            <div id="discount-display" class="discount-display" style="display: none;">
                                <i class="fa-solid fa-percent"></i>
                                <div>
                                    <div class="discount-value" id="discount-value">0%</div>
                                    <div class="discount-label">İndirim</div>
                                </div>
                            </div>
                            <div class="form-row" style="margin-top: 15px;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label>Para Birimi</label>
                                    <select id="pf-currency" class="form-control">
                                        <option value="TRY" ${product?.currency === 'TRY' || !product?.currency ? 'selected' : ''}>TL (₺)</option>
                                        <option value="USD" ${product?.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                        <option value="EUR" ${product?.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label>KDV</label>
                                    <div class="toggle-switch-wrapper" style="margin-top: 8px;">
                                        <span class="toggle-label">Hariç</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="pf-vat" ${product?.vatIncluded !== false ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <span class="toggle-label">Dahil</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION D: Görsel Yönetimi -->
                    <div class="form-card">
                        <div class="form-card-header">
                            <i class="fa-solid fa-images"></i>
                            <h4>Görseller</h4>
                        </div>
                        <div class="form-card-body">
                            <div class="image-upload-area" id="image-drop-zone" onclick="document.getElementById('image-file-input').click()">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                                <h4>Görselleri Sürükleyin</h4>
                                <p>veya</p>
                                <span class="browse-btn">Dosya Seçin</span>
                                <input type="file" id="image-file-input" multiple accept="image/jpeg,image/png,image/webp" style="display:none">
                                <div class="file-info">JPG, PNG, WebP • Max 5MB</div>
                            </div>
                            <div class="image-grid" id="image-preview-grid"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="product-form-footer">
                <div class="form-footer-left">
                    <div class="autosave-status" id="autosave-status">
                        <i class="fa-solid fa-cloud-check"></i>
                        <span>Otomatik kayıt aktif</span>
                    </div>
                </div>
                <div class="form-footer-right">
                    <button type="button" class="btn-preview" onclick="closeProductModal()">
                        <i class="fa-solid fa-times"></i> İptal
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveProduct(${product ? product.id : 'null'})">
                        <i class="fa-solid fa-check"></i> Kaydet
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        // Initialize
        setupCharCounters();
        setupKeywordsInput();
        setupImageUpload();
        renderImageGrid();
        calculateDiscount();

        // Set initial title counter
        const titleInput = document.getElementById('pf-title');
        if (titleInput) {
            document.getElementById('title-counter').textContent = `${titleInput.value.length}/200`;
            titleInput.oninput = () => {
                document.getElementById('title-counter').textContent = `${titleInput.value.length}/200`;
                // Auto-generate slug
                if (!product) {
                    document.getElementById('pf-slug').value = slugify(titleInput.value);
                }
            };
        }

        // Start auto-save
        startAutoSave(product?.id);
    }

    function closeProductModal() {
        if (autoSaveInterval) clearInterval(autoSaveInterval);
        const modal = document.getElementById('admin-modal');
        modal.classList.remove('product-form-modal');
        modal.style.display = 'none';
        tempProductImages = [];
    }

    function setupCharCounters() {
        const counters = [
            { input: 'pf-seo-title', counter: 'seo-title-counter', max: 60 },
            { input: 'pf-seo-desc', counter: 'seo-desc-counter', max: 160 },
            { input: 'pf-short-desc', counter: 'short-desc-counter', max: 200 }
        ];

        counters.forEach(({ input, counter, max }) => {
            const el = document.getElementById(input);
            const counterEl = document.getElementById(counter);
            if (el && counterEl) {
                const update = () => {
                    const len = el.value.length;
                    counterEl.textContent = `${len}/${max}`;
                    counterEl.className = 'char-counter' + (len > max * 0.9 ? ' warning' : '') + (len >= max ? ' danger' : '');
                };
                update();
                el.oninput = update;
            }
        });
    }

    function setupKeywordsInput() {
        const input = document.getElementById('pf-keywords-input');
        const wrapper = document.getElementById('keywords-wrapper');
        if (!input || !wrapper) return;

        input.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = input.value.trim();
                if (val) {
                    const tag = document.createElement('span');
                    tag.className = 'tag-item';
                    tag.innerHTML = `${val}<span class="remove-tag" onclick="removeKeyword(this)">×</span>`;
                    wrapper.insertBefore(tag, input);
                    input.value = '';
                }
            }
        };
    }

    window.removeKeyword = function (el) {
        el.parentElement.remove();
    };

    window.execRichCmd = function (cmd) {
        document.execCommand(cmd, false, null);
        document.getElementById('pf-description').focus();
    };

    window.calculateDiscount = function () {
        const oldPrice = parseFloat(document.getElementById('pf-old-price')?.value) || 0;
        const price = parseFloat(document.getElementById('pf-price')?.value) || 0;
        const display = document.getElementById('discount-display');
        const valueEl = document.getElementById('discount-value');

        if (oldPrice > price && price > 0) {
            const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
            valueEl.textContent = `%${discount}`;
            display.style.display = 'flex';
        } else {
            display.style.display = 'none';
        }
    };

    function setupImageUpload() {
        const dropZone = document.getElementById('image-drop-zone');
        const fileInput = document.getElementById('image-file-input');
        if (!dropZone || !fileInput) return;

        ['dragenter', 'dragover'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', () => {
            handleFiles(fileInput.files);
            fileInput.value = '';
        });
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.match('image/(jpeg|png|webp)')) {
                showToast('Sadece JPG, PNG ve WebP formatları desteklenir.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('Dosya boyutu 5MB\'dan büyük olamaz.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = {
                    url: e.target.result,
                    isMain: tempProductImages.length === 0,
                    isFeatured: false,
                    order: tempProductImages.length
                };
                tempProductImages.push(img);
                renderImageGrid();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImageGrid() {
        const grid = document.getElementById('image-preview-grid');
        if (!grid) return;

        if (tempProductImages.length === 0) {
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = tempProductImages.map((img, idx) => `
            <div class="image-item ${img.isMain ? 'is-main' : ''} ${img.isFeatured ? 'is-featured' : ''}" data-index="${idx}">
                ${img.isMain ? '<span class="image-item-badge main">Vitrin</span>' : ''}
                ${img.isFeatured ? '<span class="image-item-badge featured">Öne Çıkan</span>' : ''}
                <img src="${img.url}" alt="">
                <span class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></span>
                <div class="image-item-overlay">
                    <div class="image-item-actions">
                        <button type="button" class="btn-main" title="Vitrin Yap" onclick="setMainImage(${idx})">
                            <i class="fa-solid fa-star"></i>
                        </button>
                        <button type="button" class="btn-featured" title="Öne Çıkar" onclick="setFeaturedImage(${idx})">
                            <i class="fa-solid fa-thumbtack"></i>
                        </button>
                        <button type="button" class="btn-delete" title="Sil" onclick="deleteImage(${idx})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Init sortable
        new Sortable(grid, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: (evt) => {
                const item = tempProductImages.splice(evt.oldIndex, 1)[0];
                tempProductImages.splice(evt.newIndex, 0, item);
                tempProductImages.forEach((img, i) => img.order = i);
            }
        });
    }

    window.setMainImage = function (idx) {
        tempProductImages.forEach((img, i) => img.isMain = i === idx);
        renderImageGrid();
    };

    window.setFeaturedImage = function (idx) {
        tempProductImages[idx].isFeatured = !tempProductImages[idx].isFeatured;
        renderImageGrid();
    };

    window.deleteImage = function (idx) {
        tempProductImages.splice(idx, 1);
        if (tempProductImages.length > 0 && !tempProductImages.some(i => i.isMain)) {
            tempProductImages[0].isMain = true;
        }
        renderImageGrid();
    };

    function startAutoSave(productId) {
        const statusEl = document.getElementById('autosave-status');
        autoSaveInterval = setInterval(() => {
            const draft = collectFormData(productId);
            localStorage.setItem('deerDeriProductDraft', JSON.stringify(draft));
            if (statusEl) {
                statusEl.innerHTML = '<i class="fa-solid fa-check" style="color:var(--success-color)"></i><span>Taslak kaydedildi</span>';
                setTimeout(() => {
                    statusEl.innerHTML = '<i class="fa-solid fa-cloud-check"></i><span>Otomatik kayıt aktif</span>';
                }, 2000);
            }
        }, 30000);
    }

    function collectFormData(existingId) {
        const keywords = [];
        document.querySelectorAll('#keywords-wrapper .tag-item').forEach(t => {
            keywords.push(t.textContent.replace('×', '').trim());
        });

        const selectedCats = [];
        document.querySelectorAll('#pf-categories input:checked').forEach(cb => {
            selectedCats.push(cb.value);
        });

        return {
            id: existingId || Date.now(),
            name: document.getElementById('pf-title')?.value || '',
            sku: document.getElementById('pf-sku')?.value || '',
            slug: document.getElementById('pf-slug')?.value || '',
            status: document.getElementById('pf-status')?.checked ? 'active' : 'passive',
            category: selectedCats.length === 1 ? selectedCats[0] : selectedCats,
            seoTitle: document.getElementById('pf-seo-title')?.value || '',
            seoDescription: document.getElementById('pf-seo-desc')?.value || '',
            keywords: keywords,
            shortDescription: document.getElementById('pf-short-desc')?.value || '',
            description: document.getElementById('pf-description')?.innerHTML || '',
            price: parseFloat(document.getElementById('pf-price')?.value) || 0,
            oldPrice: parseFloat(document.getElementById('pf-old-price')?.value) || null,
            currency: document.getElementById('pf-currency')?.value || 'TRY',
            vatIncluded: document.getElementById('pf-vat')?.checked ?? true,
            images: tempProductImages.length > 0 ? tempProductImages : ['assets/products/placeholder.jpg'],
            stock: parseInt(document.getElementById('pf-stock')?.value) || 0,
            stockAlertLevel: parseInt(document.getElementById('pf-stock-alert')?.value) || 5,
            barcode: document.getElementById('pf-barcode')?.value || '',
            weight: document.getElementById('pf-weight')?.value || '',
            dimensions: document.getElementById('pf-dimensions')?.value || '',
            rating: 5,
            updatedAt: new Date().toISOString()
        };
    }

    window.saveProduct = function (existingId) {
        // Validate required fields
        const title = document.getElementById('pf-title')?.value?.trim();
        const price = document.getElementById('pf-price')?.value;

        if (!title) {
            showToast('Ürün başlığı zorunludur.');
            document.getElementById('pf-title')?.classList.add('is-invalid');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            showToast('Geçerli bir satış fiyatı giriniz.');
            document.getElementById('pf-price')?.classList.add('is-invalid');
            return;
        }

        const productData = collectFormData(existingId);
        productData.createdAt = existingId ?
            (state.products.find(p => p.id === existingId)?.createdAt || new Date().toISOString()) :
            new Date().toISOString();

        if (existingId) {
            const idx = state.products.findIndex(p => p.id === existingId);
            if (idx > -1) state.products[idx] = productData;
        } else {
            state.products.unshift(productData);
        }

        saveData();
        localStorage.removeItem('deerDeriProductDraft');
        closeProductModal();
        renderView('products');
        showToast('Ürün başarıyla kaydedildi.');
    };

    window.closeProductModal = closeProductModal;

    function showCategoryModal(category = null) {
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = category ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle';

        formArea.innerHTML = `
            <form id="category-form">
                <div class="form-group">
                    <label>Kategori Adı</label>
                    <input type="text" name="name" id="cat-name-input" class="form-control" value="${category ? category.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Kategori ID (Otomatik Oluşturulur)</label>
                    <input type="text" name="id" id="cat-id-input" class="form-control" value="${category ? category.id : ''}" readonly required>
                    <small>Sistem tarafından SEO uyumlu olarak oluşturulur.</small>
                </div>
                <div class="form-group">
                    <label>Kategori URL (Link)</label>
                    <input type="text" name="url" id="cat-url-input" class="form-control" value="${category ? (category.url || '/kategori/' + category.id) : ''}" placeholder="Örn: /cuzdan veya https://example.com/sayfa">
                    <small>Kategoriye tıklandığında yönlendirilecek URL. Boş bırakılırsa varsayılan kategori sayfasına gider.</small>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

        const nameInput = document.getElementById('cat-name-input');
        const idInput = document.getElementById('cat-id-input');

        if (!category) {
            nameInput.oninput = () => {
                idInput.value = slugify(nameInput.value);
            };
        }

        modal.style.display = 'flex';

        document.getElementById('category-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const catData = {
                id: formData.get('id'),
                name: formData.get('name'),
                url: formData.get('url') || '',
                children: category ? (category.children || []) : []
            };

            if (category) {
                // Update existing in recursive tree
                const updateInTree = (list) => {
                    for (let item of list) {
                        if (item.id === category.id) {
                            item.name = catData.name;
                            item.url = catData.url;
                            return true;
                        }
                        if (item.children && updateInTree(item.children)) return true;
                    }
                    return false;
                };
                updateInTree(state.categories);
            } else {
                // Add new to root
                if (state.categories.find(c => c.id === catData.id)) {
                    alert('Bu kategori ismiyle daha önce bir kayıt oluşturulmuş!');
                    return;
                }
                state.categories.push(catData);
            }

            saveData();
            modal.style.display = 'none';
            renderView('categories');
            showToast('Kategori kaydedildi ve siteye yansıtıldı.');
        };
    }

    function slugify(text) {
        const trMap = {
            'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
            'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
        };
        for (let key in trMap) {
            text = text.replace(new RegExp(key, 'g'), trMap[key]);
        }
        return text.toLowerCase()
            .replace(/[^-a-zA-Z0-9\s]+/g, '') // Remove non-alphanumeric except hyphens/spaces
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim();
    }

    function showOrderModal(order) {
        const modal = document.getElementById('admin-modal');
        const formArea = document.getElementById('modal-form-area');
        const title = document.getElementById('modal-title');

        title.textContent = `Sipariş Yönetimi #${order.id}`;

        formArea.innerHTML = `
            <div class="order-details-summary" style="margin-bottom: 20px;">
                <p><strong>Müşteri:</strong> ${order.customerName}</p>
                <p><strong>Toplam:</strong> ${formatPrice(order.total)}₺</p>
                <p><strong>Adres:</strong> ${order.address ? order.address.address + ' ' + order.address.district + '/' + order.address.city : 'Belirtilmemiş'}</p>
            </div>
            <form id="order-status-form">
                <div class="form-group">
                    <label>Sipariş Durumu</label>
                    <select name="status" class="form-control">
                        <option value="İşleniyor" ${order.status === 'İşleniyor' ? 'selected' : ''}>İşleniyor</option>
                        <option value="Hazırlanıyor" ${order.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                         <option value="Paketlendi" ${order.status === 'Paketlendi' ? 'selected' : ''}>Paketlendi</option>
                        <option value="Kargoya Verildi" ${order.status === 'Kargoya Verildi' ? 'selected' : ''}>Kargoya Verildi</option>
                         <option value="Kargolandı" ${order.status === 'Kargolandı' ? 'selected' : ''}>Kargolandı</option>
                        <option value="Teslim Edildi" ${order.status === 'Teslim Edildi' ? 'selected' : ''}>Teslim Edildi</option>
                        <option value="İptal Edildi" ${order.status === 'İptal Edildi' ? 'selected' : ''}>İptal Edildi</option>
                    </select>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Güncelle</button>
                    <button type="button" class="btn btn-delete" style="background: var(--danger-color); color: white;" onclick="window.deleteOrder('${order.id}', '${order.userId}')">Siparişi Sil</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';

        document.getElementById('order-status-form').onsubmit = (e) => {
            e.preventDefault();
            const newStatus = new FormData(e.target).get('status');
            updateOrderStatus(order.id, order.userId, newStatus);
            modal.style.display = 'none';
            showToast('Sipariş durumu güncellendi.');
        };
    }

    window.updateOrderStatusFromDetail = function (orderId, userId) {
        const newStatus = document.getElementById('detail-status-select').value;
        updateOrderStatus(orderId, userId, newStatus);
        showToast('Sipariş durumu güncellendi: ' + newStatus);
    };

    function updateOrderStatus(orderId, userId, status) {
        const users = JSON.parse(localStorage.getItem('deerDeriUsers')) || [];
        const uIdx = users.findIndex(u => u.id === userId);
        if (uIdx > -1) {
            const oIdx = users[uIdx].orders.findIndex(o => o.id === orderId);
            if (oIdx > -1) {
                users[uIdx].orders[oIdx].status = status;
                localStorage.setItem('deerDeriUsers', JSON.stringify(users));

                // If this is current user, sync session too
                const currentUser = JSON.parse(localStorage.getItem('deerDeriCurrentUser'));
                if (currentUser && currentUser.id === userId) {
                    currentUser.orders[oIdx].status = status;
                    localStorage.setItem('deerDeriCurrentUser', JSON.stringify(currentUser));
                }

                loadData(); // Refresh local state
                renderView('orders');
            }
        }
    }

    window.deleteOrder = function (orderId, userId) {
        if (confirm('Siparişi silmek istediğinize emin misiniz?')) {
            const users = JSON.parse(localStorage.getItem('deerDeriUsers')) || [];
            const uIdx = users.findIndex(u => u.id === userId);
            if (uIdx > -1) {
                users[uIdx].orders = users[uIdx].orders.filter(o => o.id !== orderId);
                localStorage.setItem('deerDeriUsers', JSON.stringify(users));

                // Sync session
                const currentUser = JSON.parse(localStorage.getItem('deerDeriCurrentUser'));
                if (currentUser && currentUser.id === userId) {
                    currentUser.orders = currentUser.orders.filter(o => o.id !== orderId);
                    localStorage.setItem('deerDeriCurrentUser', JSON.stringify(currentUser));
                }

                loadData();
                document.getElementById('admin-modal').style.display = 'none';
                renderView('orders');
                showToast('Sipariş silindi.');
            }
        }
    }

    // --- Toast Notification ---
    function showToast(message) {
        // Reuse or inject toast container if needed
        // For now, let's inject a simple one specifically for admin
        let container = document.getElementById('admin-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'admin-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            background: #333; color: white; padding: 12px 20px; border-radius: 4px;
            margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s forwards; pointer-events: auto;
        `;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==================== FOOTER MANAGEMENT (PROFESSIONAL UI) ====================
    function renderFooterManagement(contentArea) {
        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');

        contentArea.innerHTML = `
            <div style="max-width: 1400px;">
                <!-- Modals Container -->
                <div id="footer-modals"></div>
                
                <div class="card">
                    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px 12px 0 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">
                                    <i class="fa-solid fa-table-cells-large"></i> Footer Yönetimi
                                </h3>
                                <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">
                                    Footer kolonlarını ve linklerini profesyonelce yönetin. Değişiklikler anında yansır.
                                </p>
                            </div>
                            <button onclick="openFooterColumnModal()" class="btn" style="background: white; color: #667eea; font-weight: 700; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <i class="fa-solid fa-plus"></i> Yeni Kolon
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 30px; background: #f8f9fa;">
                        <div id="footer-columns-container"></div>
                    </div>
                </div>
            </div>
        `;

        renderFooterColumns();
    }

    function renderFooterColumns() {
        const container = document.getElementById('footer-columns-container');
        if (!container) return;

        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');

        if (footerColumns.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 80px 40px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.2;">
                        <i class="fa-solid fa-table-cells-large"></i>
                    </div>
                    <h4 style="color: #333; margin-bottom: 10px;">Henüz footer kolonu yok</h4>
                    <p style="color: #999; margin-bottom: 25px;">Başlamak için "Yeni Kolon" butonuna tıklayın</p>
                    <button onclick="openFooterColumnModal()" class="btn btn-primary" style="padding: 12px 30px;">
                        <i class="fa-solid fa-plus"></i> İlk Kolonu Ekle
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div style="display: grid; gap: 20px;">';
        footerColumns.forEach((column, index) => {
            html += `
                <div class="footer-column-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s ease;" onmouseenter="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" onmouseleave="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'">
                    <!-- Column Header -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px; border-bottom: 2px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                <i class="fa-solid fa-grip-vertical" style="color: #999; cursor: grab; font-size: 18px;"></i>
                                <h4 style="margin: 0; font-size: 20px; font-weight: 700; color: #2c3e50;">${column.title}</h4>
                                <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700;">${column.links?.length || 0} Link</span>
                            </div>
                            ${column.description ? `<p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">${column.description}</p>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="openFooterColumnModal(${index})" class="btn btn-sm" style="background: #667eea; color: white; padding: 8px 16px; border-radius: 6px;" title="Düzenle">
                                <i class="fa-solid fa-edit"></i>
                            </button>
                            <button onclick="deleteFooterColumn(${index})" class="btn btn-sm" style="background: #e74c3c; color: white; padding: 8px 16px; border-radius: 6px;" title="Sil">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Column Body -->
                    <div style="padding: 25px;">
                        ${column.showSocial ? `
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <strong style="color: #333; font-size: 14px;">
                                        <i class="fa-solid fa-share-nodes"></i> Sosyal Medya Linkleri
                                    </strong>
                                    <button onclick="openFooterColumnModal(${index})" class="btn btn-sm" style="font-size: 11px; padding: 4px 10px;">
                                        <i class="fa-solid fa-edit"></i> Düzenle
                                    </button>
                                </div>
                                <div style="display: grid; gap: 8px; font-size: 13px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <i class="fa-brands fa-instagram" style="width: 20px; color: #E1306C;"></i>
                                        <code style="flex: 1; background: white; padding: 6px 10px; border-radius: 4px; font-size: 12px;">${column.socialLinks?.instagram || '#'}</code>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <i class="fa-brands fa-facebook" style="width: 20px; color: #1877F2;"></i>
                                        <code style="flex: 1; background: white; padding: 6px 10px; border-radius: 4px; font-size: 12px;">${column.socialLinks?.facebook || '#'}</code>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <i class="fa-brands fa-pinterest" style="width: 20px; color: #E60023;"></i>
                                        <code style="flex: 1; background: white; padding: 6px 10px; border-radius: 4px; font-size: 12px;">${column.socialLinks?.pinterest || '#'}</code>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Links Section -->
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <strong style="color: #333; font-size: 14px;">
                                    <i class="fa-solid fa-link"></i> Linkler
                                </strong>
                                <button onclick="openFooterLinkModal(${index})" class="btn btn-sm btn-success" style="font-size: 12px; padding: 6px 14px; border-radius: 6px;">
                                    <i class="fa-solid fa-plus"></i> Link Ekle
                                </button>
                            </div>

                            ${column.links && column.links.length > 0 ? `
                                <div style="display: grid; gap: 10px;">
                                    ${column.links.map((link, linkIndex) => `
                                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e9ecef; transition: all 0.2s ease;" onmouseenter="this.style.borderColor='#667eea'" onmouseleave="this.style.borderColor='#e9ecef'">
                                            <div style="flex: 1; min-width: 0;">
                                                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 4px; font-size: 14px;">${link.text}</div>
                                                <div style="font-size: 12px; color: #7f8c8d; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px; margin-right: 4px;"></i>
                                                    ${link.url}
                                                </div>
                                            </div>
                                            <div style="display: flex; gap: 6px; margin-left: 15px;">
                                                ${linkIndex > 0 ? `
                                                    <button onclick="moveFooterLink(${index}, ${linkIndex}, -1)" class="btn btn-sm" style="padding: 6px 10px; background: #ecf0f1; color: #2c3e50; border-radius: 4px;" title="Yukarı Taşı">
                                                        <i class="fa-solid fa-arrow-up"></i>
                                                    </button>
                                                ` : ''}
                                                ${linkIndex < column.links.length - 1 ? `
                                                    <button onclick="moveFooterLink(${index}, ${linkIndex}, 1)" class="btn btn-sm" style="padding: 6px 10px; background: #ecf0f1; color: #2c3e50; border-radius: 4px;" title="Aşağı Taşı">
                                                        <i class="fa-solid fa-arrow-down"></i>
                                                    </button>
                                                ` : ''}
                                                <button onclick="openFooterLinkModal(${index}, ${linkIndex})" class="btn btn-sm" style="padding: 6px 10px; background: #3498db; color: white; border-radius: 4px;" title="Düzenle">
                                                    <i class="fa-solid fa-edit"></i>
                                                </button>
                                                <button onclick="deleteFooterLink(${index}, ${linkIndex})" class="btn btn-sm" style="padding: 6px 10px; background: #e74c3c; color: white; border-radius: 4px;" title="Sil">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div style="background: #f8f9fa; padding: 40px; border-radius: 8px; text-align: center; border: 2px dashed #dee2e6;">
                                    <i class="fa-solid fa-link" style="font-size: 32px; color: #cbd5e0; margin-bottom: 10px;"></i>
                                    <p style="color: #999; margin: 0 0 15px; font-size: 13px;">Bu kolonda henüz link yok</p>
                                    <button onclick="openFooterLinkModal(${index})" class="btn btn-sm btn-success" style="padding: 8px 20px;">
                                        <i class="fa-solid fa-plus"></i> İlk Linki Ekle
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    // Open Column Modal (Add or Edit)
    window.openFooterColumnModal = function (columnIndex = null) {
        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');
        const column = columnIndex !== null ? footerColumns[columnIndex] : null;
        const isEdit = column !== null;

        const modalHTML = `
            <div id="footer-column-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s;">
                <div style="background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s;">
                    <!-- Modal Header -->
                    <div style="padding: 25px; border-bottom: 2px solid #f0f0f0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px 16px 0 0;">
                        <h3 style="margin: 0; font-size: 22px; font-weight: 700;">
                            <i class="fa-solid ${isEdit ? 'fa-edit' : 'fa-plus-circle'}"></i> 
                            ${isEdit ? 'Kolonu Düzenle' : 'Yeni Kolon Ekle'}
                        </h3>
                    </div>

                    <!-- Modal Body -->
                    <div style="padding: 30px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 700; color: #2c3e50; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                <i class="fa-solid fa-heading"></i> Kolon Başlığı *
                            </label>
                            <input type="text" id="column-title" value="${column?.title || ''}" placeholder="Örn: Kurumsal" style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; transition: all 0.3s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 700; color: #2c3e50; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                <i class="fa-solid fa-align-left"></i> Açıklama (Opsiyonel)
                            </label>
                            <textarea id="column-description" placeholder="Kısa bir açıklama..." style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; min-height: 80px; resize: vertical; font-family: inherit; transition: all 0.3s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e0e0e0'">${column?.description || ''}</textarea>
                        </div>

                        <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                            <label style="display: flex; align-items: center; cursor: pointer; user-select: none;">
                                <input type="checkbox" id="column-show-social" ${column?.showSocial ? 'checked' : ''} onchange="document.getElementById('social-links-section').style.display = this.checked ? 'block' : 'none'" style="width: 20px; height: 20px; margin-right: 12px; cursor: pointer; accent-color: #667eea;">
                                <span style="font-weight: 600; color: #2c3e50; font-size: 14px;">
                                    <i class="fa-solid fa-share-nodes"></i> Sosyal Medya Linkleri Göster
                                </span>
                            </label>

                            <div id="social-links-section" style="margin-top: 20px; display: ${column?.showSocial ? 'block' : 'none'};">
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">
                                        <i class="fa-brands fa-instagram" style="color: #E1306C;"></i> Instagram URL
                                    </label>
                                    <input type="text" id="social-instagram" value="${column?.socialLinks?.instagram || '#'}" placeholder="https://instagram.com/..." style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">
                                        <i class="fa-brands fa-facebook" style="color: #1877F2;"></i> Facebook URL
                                    </label>
                                    <input type="text" id="social-facebook" value="${column?.socialLinks?.facebook || '#'}" placeholder="https://facebook.com/..." style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px;">
                                        <i class="fa-brands fa-pinterest" style="color: #E60023;"></i> Pinterest URL
                                    </label>
                                    <input type="text" id="social-pinterest" value="${column?.socialLinks?.pinterest || '#'}" placeholder="https://pinterest.com/..." style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div style="padding: 20px 30px; border-top: 2px solid #f0f0f0; display: flex; gap: 12px; justify-content: flex-end; background: #fafafa; border-radius: 0 0 16px 16px;">
                        <button onclick="closeFooterModal()" class="btn" style="padding: 12px 24px; background: #ecf0f1; color: #2c3e50; border-radius: 8px; font-weight: 600;">
                            <i class="fa-solid fa-times"></i> İptal
                        </button>
                        <button onclick="saveFooterColumn(${columnIndex})" class="btn btn-primary" style="padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-weight: 700; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                            <i class="fa-solid fa-save"></i> ${isEdit ? 'Güncelle' : 'Ekle'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('footer-modals').innerHTML = modalHTML;
    };

    // Open Link Modal (Add or Edit)
    window.openFooterLinkModal = function (columnIndex, linkIndex = null) {
        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');
        const link = linkIndex !== null ? footerColumns[columnIndex]?.links[linkIndex] : null;
        const isEdit = link !== null;

        const modalHTML = `
            <div id="footer-link-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s;">
                <div style="background: white; border-radius: 16px; width: 90%; max-width: 550px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s;">
                    <!-- Modal Header -->
                    <div style="padding: 25px; border-bottom: 2px solid #f0f0f0; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border-radius: 16px 16px 0 0;">
                        <h3 style="margin: 0; font-size: 22px; font-weight: 700;">
                            <i class="fa-solid ${isEdit ? 'fa-edit' : 'fa-plus-circle'}"></i> 
                            ${isEdit ? 'Linki Düzenle' : 'Yeni Link Ekle'}
                        </h3>
                    </div>

                    <!-- Modal Body -->
                    <div style="padding: 30px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 700; color: #2c3e50; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                <i class="fa-solid fa-text-width"></i> Link Metni *
                            </label>
                            <input type="text" id="link-text" value="${link?.text || ''}" placeholder="Örn: Hakkımızda" style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; transition: all 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>

                        <div>
                            <label style="display: block; font-weight: 700; color: #2c3e50; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                <i class="fa-solid fa-link"></i> Link URL *
                            </label>
                            <input type="text" id="link-url" value="${link?.url || ''}" placeholder="/hakkimizda.html veya https://..." style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: monospace; transition: all 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div style="padding: 20px 30px; border-top: 2px solid #f0f0f0; display: flex; gap: 12px; justify-content: flex-end; background: #fafafa; border-radius: 0 0 16px 16px;">
                        <button onclick="closeFooterModal()" class="btn" style="padding: 12px 24px; background: #ecf0f1; color: #2c3e50; border-radius: 8px; font-weight: 600;">
                            <i class="fa-solid fa-times"></i> İptal
                        </button>
                        <button onclick="saveFooterLink(${columnIndex}, ${linkIndex})" class="btn btn-primary" style="padding: 12px 30px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border-radius: 8px; font-weight: 700; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);">
                            <i class="fa-solid fa-save"></i> ${isEdit ? 'Güncelle' : 'Ekle'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('footer-modals').innerHTML = modalHTML;
    };

    // Save Column
    window.saveFooterColumn = function (columnIndex) {
        const title = document.getElementById('column-title').value.trim();
        if (!title) {
            alert('Kolon başlığı zorunludur!');
            return;
        }

        const description = document.getElementById('column-description').value.trim();
        const showSocial = document.getElementById('column-show-social').checked;

        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');

        const columnData = {
            id: columnIndex !== null ? footerColumns[columnIndex].id : String(Date.now()),
            title: title,
            description: description,
            showSocial: showSocial,
            socialLinks: showSocial ? {
                instagram: document.getElementById('social-instagram').value.trim() || '#',
                facebook: document.getElementById('social-facebook').value.trim() || '#',
                pinterest: document.getElementById('social-pinterest').value.trim() || '#'
            } : null,
            links: columnIndex !== null ? footerColumns[columnIndex].links : []
        };

        if (columnIndex !== null) {
            footerColumns[columnIndex] = columnData;
        } else {
            footerColumns.push(columnData);
        }

        localStorage.setItem('deerDeriFooterColumns', JSON.stringify(footerColumns));
        closeFooterModal();
        renderFooterColumns();
        if (window.renderFooter) window.renderFooter();
        showToast(columnIndex !== null ? 'Kolon güncellendi!' : 'Kolon eklendi!', 'success');
    };

    // Save Link
    window.saveFooterLink = function (columnIndex, linkIndex) {
        const text = document.getElementById('link-text').value.trim();
        const url = document.getElementById('link-url').value.trim();

        if (!text || !url) {
            alert('Link metni ve URL zorunludur!');
            return;
        }

        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');
        if (!footerColumns[columnIndex].links) footerColumns[columnIndex].links = [];

        const linkData = {
            id: linkIndex !== null ? footerColumns[columnIndex].links[linkIndex].id : String(Date.now()),
            text: text,
            url: url
        };

        if (linkIndex !== null) {
            footerColumns[columnIndex].links[linkIndex] = linkData;
        } else {
            footerColumns[columnIndex].links.push(linkData);
        }

        localStorage.setItem('deerDeriFooterColumns', JSON.stringify(footerColumns));
        closeFooterModal();
        renderFooterColumns();
        if (window.renderFooter) window.renderFooter();
        showToast(linkIndex !== null ? 'Link güncellendi!' : 'Link eklendi!', 'success');
    };

    // Move Link (Reorder)
    window.moveFooterLink = function (columnIndex, linkIndex, direction) {
        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');
        const links = footerColumns[columnIndex].links;
        const newIndex = linkIndex + direction;

        if (newIndex < 0 || newIndex >= links.length) return;

        // Swap links
        [links[linkIndex], links[newIndex]] = [links[newIndex], links[linkIndex]];

        localStorage.setItem('deerDeriFooterColumns', JSON.stringify(footerColumns));
        renderFooterColumns();
        if (window.renderFooter) window.renderFooter();
        showToast('Link sırası değiştirildi!', 'success');
    };

    // Delete Column
    window.deleteFooterColumn = function (index) {
        if (!confirm('Bu kolonu silmek istediğinizden emin misiniz? Kolon içindeki tüm linkler de silinecek.')) return;

        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');
        footerColumns.splice(index, 1);
        localStorage.setItem('deerDeriFooterColumns', JSON.stringify(footerColumns));

        renderFooterColumns();
        if (window.renderFooter) window.renderFooter();
        showToast('Kolon silindi!', 'success');
    };

    // Delete Link
    window.deleteFooterLink = function (columnIndex, linkIndex) {
        if (!confirm('Bu linki silmek istediğinizden emin misiniz?')) return;

        const footerColumns = JSON.parse(localStorage.getItem('deerDeriFooterColumns') || '[]');
        footerColumns[columnIndex].links.splice(linkIndex, 1);
        localStorage.setItem('deerDeriFooterColumns', JSON.stringify(footerColumns));

        renderFooterColumns();
        if (window.renderFooter) window.renderFooter();
        showToast('Link silindi!', 'success');
    };

    // Close Modal
    window.closeFooterModal = function () {
        document.getElementById('footer-modals').innerHTML = '';
    };

    // Add CSS animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);

    // --- Helper for Image Upload (Mock) ---
    window.openImageUploader = function (inputId) {
        const url = prompt('Lütfen görsel URL adresini girin (veya boş bırakıp iptal edin):', 'https://');
        if (url && url.length > 5) {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = url;
                // Trigger change event manually
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            }
        }
    };

    // Run
    init();
});
