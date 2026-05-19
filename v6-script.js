// v6-script.js

// Sidebar Toggle Logic
function toggleSidebar() {
    const sidebar = document.querySelector('.v6-sidebar');
    const overlay = document.querySelector('.v6-sidebar-overlay');
    
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }
}

// FAQ Toggle Logic
function toggleFaq(element) {
    const faqItem = element.parentElement;
    
    // Optional: Close other open FAQs
    /*
    const allFaqs = document.querySelectorAll('.v6-faq-item');
    allFaqs.forEach(item => {
        if(item !== faqItem) item.classList.remove('active');
    });
    */

    faqItem.classList.toggle('active');
}

// Countdown Timer Logic
function startCountdown() {
    // Set target date 17 days, 3 hours, 26 mins, 49 secs from now for visual effect
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 17);
    targetDate.setHours(targetDate.getHours() + 3);
    targetDate.setMinutes(targetDate.getMinutes() + 26);
    targetDate.setSeconds(targetDate.getSeconds() + 49);

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if(!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance < 0) {
            return; // Timer ended
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = days.toString().padStart(2, '0');
        hoursEl.innerText = hours.toString().padStart(2, '0');
        minutesEl.innerText = minutes.toString().padStart(2, '0');
        secondsEl.innerText = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Slider Logic
let currentSlideIndex = 0;

function moveSlide(direction) {
    const slides = document.querySelectorAll('.v6-hero-slide');
    if (slides.length === 0) return;

    slides[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    slides[currentSlideIndex].classList.add('active');
}

// Auto advance slider every 6 seconds
setInterval(() => {
    moveSlide(1);
}, 6000);

// Fetch dynamic campaigns marquee
async function loadCampaignMarquee() {
    try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
            const marquee = document.getElementById('dynamic-marquee');
            if(!marquee) return;
            
            let html = '';
            // Render original items
            data.data.forEach(camp => {
                let linkStart = camp.link && camp.link !== '#' ? `<a href="${camp.link}" style="color:inherit; text-decoration:none;">` : '';
                let linkEnd = camp.link && camp.link !== '#' ? `</a>` : '';
                html += `<span class="v6-marquee-item">${linkStart}<svg class="i i-${camp.icon}" style="color: ${camp.color}; --i-size: 16px; margin-right: 5px; vertical-align: text-top;"><use href="/assets/svg-sprite.svg#${camp.icon}"/></svg> ${camp.text}${linkEnd}</span><span class="v6-marquee-dot">•</span>`;
            });
            // Duplicate for seamless scrolling
            data.data.forEach(camp => {
                let linkStart = camp.link && camp.link !== '#' ? `<a href="${camp.link}" style="color:inherit; text-decoration:none;">` : '';
                let linkEnd = camp.link && camp.link !== '#' ? `</a>` : '';
                html += `<span class="v6-marquee-item">${linkStart}<svg class="i i-${camp.icon}" style="color: ${camp.color}; --i-size: 16px; margin-right: 5px; vertical-align: text-top;"><use href="/assets/svg-sprite.svg#${camp.icon}"/></svg> ${camp.text}${linkEnd}</span><span class="v6-marquee-dot">•</span>`;
            });
            marquee.innerHTML = html;
        }
    } catch (error) {
        console.error('Kayan kampanya yüklenemedi:', error);
    }
}

// Initialize scripts

document.addEventListener('DOMContentLoaded', () => {
    startCountdown();
    loadCampaignMarquee();
    loadSidebarMenu();
    initLiveSearch();

    // Lazy Loading Scroll Animations
    const fadeElements = document.querySelectorAll('.v6-fade-in');
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
});
// Collections Auto-Scroll (infinite loop, step every 2s)
(function() {
    const track = document.getElementById('collectionsTrack');
    if (!track) return;

    const CARD_COUNT = 5; // original cards
    const GAP = 20;

    let currentIndex = 0;
    let isTransitioning = false;
    let isPaused = false;

    function getCardWidth() {
        const card = track.querySelector('.v6-carousel-card');
        return card ? card.offsetWidth + GAP : 340;
    }

    function jumpToIndex(index, animated) {
        const cardWidth = getCardWidth();
        track.style.transition = animated ? 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' : 'none';
        track.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    function advance() {
        if (isPaused || isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        jumpToIndex(currentIndex, true);

        // When we've gone through all 5 originals, silently jump back to 0
        track.addEventListener('transitionend', function onEnd() {
            track.removeEventListener('transitionend', onEnd);
            if (currentIndex >= CARD_COUNT) {
                currentIndex = 0;
                jumpToIndex(currentIndex, false);
            }
            isTransitioning = false;
        });
    }

    // Pause on hover
    const viewport = document.getElementById('collectionsViewport');
    if (viewport) {
        viewport.addEventListener('mouseenter', () => isPaused = true);
        viewport.addEventListener('mouseleave', () => isPaused = false);
    }

    // Start at position 0
    jumpToIndex(0, false);
    setInterval(advance, 2000);
})();

// ============================================
// Ürün Kartı Geliştirmeleri
// ============================================
(function initProductCards() {
    function setup() {
        const cards = document.querySelectorAll('.v6-product-card');
        if (!cards.length) return;

        cards.forEach(card => {
            const imgContainer = card.querySelector('.v6-product-image-container');
            const imgSlider    = card.querySelector('.v6-product-image-slider');
            const imgs         = card.querySelectorAll('.v6-product-img');
            const productInfo  = card.querySelector('.v6-product-info');

            if (!imgContainer || !imgSlider || !imgs.length || !productInfo) return;

            const imgCount = imgs.length;
            let currentIdx = 0;

            // --- NOKTALAR (sağ kenar, dikey) ---
            const dotsWrap = document.createElement('div');
            dotsWrap.className = 'v6-img-dots';
            for (let i = 0; i < imgCount; i++) {
                const dot = document.createElement('span');
                dot.className = 'v6-img-dot' + (i === 0 ? ' active' : '');
                dotsWrap.appendChild(dot);
            }
            imgContainer.appendChild(dotsWrap);
            const dots = dotsWrap.querySelectorAll('.v6-img-dot');

            function showImage(idx) {
                currentIdx = idx;
                // Slider her görsel %100 genişlik → index * 100%
                imgSlider.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                imgSlider.style.transform  = `translateX(-${idx * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            }

            // Mouse X pozisyonuna göre hangi görselin gösterileceği
            imgContainer.addEventListener('mousemove', (e) => {
                const rect = imgContainer.getBoundingClientRect();
                const x    = e.clientX - rect.left;
                const idx  = Math.min(Math.floor((x / rect.width) * imgCount), imgCount - 1);
                if (idx !== currentIdx) showImage(idx);
            });

            // Mouse çıkınca 1. görsele dön
            imgContainer.addEventListener('mouseleave', () => showImage(0));

            // --- ÜRÜNÜ İNCELE BUTONU (görsel içine) ---
            if (!imgContainer.querySelector('.v6-product-action')) {
                const actionDiv = document.createElement('div');
                actionDiv.className = 'v6-product-action';
                actionDiv.innerHTML = '<span class="v6-product-view-btn">Ürünü İncele <i class="fa-solid fa-arrow-right"></i></span>';
                imgContainer.appendChild(actionDiv);
            }
        });
    }

    window.initProductCards = setup;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

// ============================================
// Promo Video Banner (YouTube API)
// ============================================
let ytPlayer;
function onYouTubeIframeAPIReady() {
    if (!document.getElementById('video-banner-player')) return;
    
    ytPlayer = new YT.Player('video-banner-player', {
        videoId: 'i2CkLotShyA',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'mute': 1,
            'loop': 1,
            'playlist': 'i2CkLotShyA',
            'playsinline': 1,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'disablekb': 1,
            'end': 15
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    event.target.mute();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        // Fade in the video only when it actually starts playing to hide initial play button
        const wrapper = document.getElementById('video-wrapper');
        if(wrapper) wrapper.style.opacity = '1';
    }
}

(function loadYoutubeAPI() {
    if (!document.getElementById('video-banner-player')) return;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// ============================================
// Filter Button Sliding Animation
// ============================================
(function initFilters() {
    function setup() {
        const filtersContainer = document.querySelector('.v6-filters');
        if (!filtersContainer) return;
        
        const activeBg = filtersContainer.querySelector('.v6-filter-active-bg');
        const btns = filtersContainer.querySelectorAll('.v6-filter-btn');
        if (!activeBg || !btns.length) return;

        function updateActiveBg(activeBtn) {
            activeBg.style.width = `${activeBtn.offsetWidth}px`;
            activeBg.style.height = `${activeBtn.offsetHeight}px`;
            activeBg.style.transform = `translate(${activeBtn.offsetLeft}px, ${activeBtn.offsetTop}px)`;
            activeBg.style.opacity = '1';
        }

        // Initialize position based on active button
        const initialActive = Array.from(btns).find(b => b.classList.contains('active')) || btns[0];
        if (initialActive) {
            // Small timeout to ensure fonts/layout are rendered
            setTimeout(() => updateActiveBg(initialActive), 100);
        }

        // Handle clicks
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('active')) return;
                
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateActiveBg(btn);
                
                const productsGrid = document.querySelector('.v6-products-grid');
                if (productsGrid) {
                    productsGrid.style.opacity = '0';
                    setTimeout(() => {
                        // Geliştirme aşamasında şimdilik aynı ürünler listeleniyor.
                        // İleride farklı kategori ürünleri buraya yüklenebilir.
                        productsGrid.style.opacity = '1';
                    }, 400);
                }
            });
        });

        // Handle resize to fix position
        window.addEventListener('resize', () => {
            const activeBtn = Array.from(btns).find(b => b.classList.contains('active'));
            if (activeBtn) updateActiveBg(activeBtn);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

// ============================================
// AUTH DROPDOWN + LOGIN MODAL (Global)
// ============================================
(function initAuthSystem() {
    function buildHTML(user) {
        if (user) {
            // Giriş yapılmış → Hesabım menüsü
            const isAdmin = user.email === 'admin@deerderi.com';
            return `
                <a href="/account.html"><i class="fa-regular fa-user"></i> Hesabım</a>
                <a href="/account.html#orders"><i class="fa-solid fa-box"></i> Siparişlerim</a>
                ${isAdmin ? `<a href="/yonetim" style="color:#e67e22"><i class="fa-solid fa-gear"></i> Yönetim Paneli</a>` : ''}
                <div class="v6-dd-divider"></div>
                <button class="v6-dd-btn v6-dd-logout" onclick="window.logoutUser && window.logoutUser()">
                    <i class="fa-solid fa-right-from-bracket"></i> Çıkış Yap
                </button>`;
        } else {
            // Giriş yapılmamış
            return `
                <button class="v6-dd-btn v6-dd-btn-login" onclick="openLoginModal()">
                    <i class="fa-regular fa-user"></i> Giriş Yap
                </button>
                <button class="v6-dd-btn v6-dd-btn-register" onclick="window.location.href='/kayit.html'">
                    <i class="fa-solid fa-user-plus"></i> Üye Ol
                </button>`;
        }
    }

    function updateAuthUI() {
        const user = window.UserManager ? window.UserManager.getCurrentUser() : null;
        const authItems = document.querySelectorAll('.v6-auth-item');

        authItems.forEach(item => {
            let dd = item.querySelector('.v6-auth-dropdown');
            if (!dd) {
                dd = document.createElement('div');
                dd.className = 'v6-auth-dropdown';
                item.appendChild(dd);
            }
            dd.innerHTML = buildHTML(user);

            // Update label
            const span = item.querySelector('span');
            if (span) {
                span.textContent = user ? (user.firstName || 'Hesabım').toUpperCase() : 'HESABIM';
            }
        });
    }

    // Inject Login Modal HTML once into body
    function injectLoginModal() {
        if (document.getElementById('v6-login-modal-overlay')) return;
        const modal = document.createElement('div');
        modal.id = 'v6-login-modal-overlay';
        modal.innerHTML = `
            <div id="v6-login-modal">
                <button class="v6-modal-close" onclick="closeLoginModal()" aria-label="Kapat">&times;</button>
                <div class="v6-modal-logo">
                    <img src="/assets/logo.png" alt="DEER DERİ">
                </div>
                <h2 class="v6-modal-title">Giriş Yap</h2>
                <p class="v6-modal-subtitle">Hesabınıza giriş yapın</p>

                <form id="v6-login-form" autocomplete="on">
                    <div class="v6-modal-input-group">
                        <label for="v6-login-email">E-Posta</label>
                        <input type="email" id="v6-login-email" placeholder="ornek@mail.com" required autocomplete="email">
                    </div>
                    <div class="v6-modal-input-group">
                        <label for="v6-login-pass">Şifre</label>
                        <input type="password" id="v6-login-pass" placeholder="••••••••" required autocomplete="current-password">
                    </div>
                    <div id="v6-login-error">E-posta veya şifre hatalı. Lütfen tekrar deneyin.</div>
                    <button type="submit" class="v6-modal-btn-login">GİRİŞ YAP</button>
                </form>

                <div class="v6-modal-footer">
                    Hesabınız yok mu?
                    <a href="/kayit.html">Üye Ol</a>
                </div>
            </div>`;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLoginModal();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLoginModal();
        });

        // Login form submit
        document.getElementById('v6-login-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('v6-login-email').value.trim();
            const pass  = document.getElementById('v6-login-pass').value;
            const errEl = document.getElementById('v6-login-error');
            const btn   = this.querySelector('.v6-modal-btn-login');
            errEl.style.display = 'none';
            btn.textContent = 'Giriş yapılıyor...';
            btn.disabled = true;

            try {
                const success = await window.loginUser(email, pass, false);
                if (success) {
                    closeLoginModal();
                    updateAuthUI();
                    const current = window.location.pathname;
                    if (current === '/' || current.endsWith('index.html') || current.endsWith('kayit.html')) {
                        window.location.href = '/account.html';
                    } else {
                        window.location.reload();
                    }
                } else {
                    errEl.style.display = 'block';
                    btn.textContent = 'GİRİŞ YAP';
                    btn.disabled = false;
                }
            } catch(err) {
                errEl.textContent = 'Bağlantı hatası. Lütfen tekrar deneyin.';
                errEl.style.display = 'block';
                btn.textContent = 'GİRİŞ YAP';
                btn.disabled = false;
            }
        });
    }

    window.openLoginModal = function() {
        const overlay = document.getElementById('v6-login-modal-overlay');
        if (overlay) {
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            setTimeout(() => document.getElementById('v6-login-email')?.focus(), 100);
        }
    };

    window.closeLoginModal = function() {
        const overlay = document.getElementById('v6-login-modal-overlay');
        if (overlay) {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    function setup() {
        // Add v6-auth-item class to HESABIM icon
        const actionItems = document.querySelectorAll('.v6-action-item');
        actionItems.forEach(item => {
            const iconUser = item.querySelector('.fa-user, .fa-regular.fa-user');
            if (iconUser) {
                item.classList.add('v6-auth-item');
            }
            
            // Activate SEPET icon
            const span = item.querySelector('span');
            if (span && span.textContent.trim().toUpperCase() === 'SEPET') {
                item.classList.add('v6-cart-item');
                let dd = item.querySelector('.v6-cart-dropdown');
                if (!dd) {
                    dd = document.createElement('div');
                    dd.className = 'v6-cart-dropdown';
                    dd.id = 'header-cart-preview';
                    item.appendChild(dd);
                }

                item.addEventListener('click', function(e) {
                    if (e.target.closest('.v6-cart-dropdown')) return; // ignore clicks inside popup
                    e.preventDefault();
                    if (typeof window.toggleCart === 'function') {
                        window.toggleCart(true);
                    } else {
                        window.location.href = '/cart.html';
                    }
                });
            }
        });

        injectLoginModal();

        // INSTANT INJECT: Do not wait for UserManager to build the dropdown HTML.
        // This ensures the hover works at millisecond 0 on page load.
        updateAuthUI();
        if (typeof window.updateCartBadge === 'function') window.updateCartBadge();

        // Wait for UserManager (script.js might load async) to swap to logged-in state
        if (window.UserManager) {
            updateAuthUI();
        } else {
            // Poll briefly
            let tries = 0;
            const poll = setInterval(() => {
                tries++;
                if (window.UserManager || tries > 20) {
                    clearInterval(poll);
                    updateAuthUI();
                }
            }, 150);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();


// ==========================================
// LIVE SEARCH LOGIC
// ==========================================
let allProductsCache = [];
let searchTimeout = null;

async function fetchProductsForSearch() {
    if (allProductsCache.length > 0) return allProductsCache;
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.data) {
            allProductsCache = data.data;
        }
        return allProductsCache;
    } catch(e) {
        console.error('Error fetching products for search:', e);
        return [];
    }
}

function formatPrice(price) {
    if (!price) return '0,00';
    return price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function initLiveSearch() {
    const searchInput = document.getElementById('main-search-input');
    const searchPopup = document.getElementById('search-popup');
    const resultsContainer = document.getElementById('search-results-container');
    
    if (!searchInput || !searchPopup || !resultsContainer) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        clearTimeout(searchTimeout);
        
        if (query.length >= 3) {
            searchTimeout = setTimeout(async () => {
                const products = await fetchProductsForSearch();
                const filtered = products.filter(p => p.name && p.name.toLowerCase().includes(query));
                
                if (filtered.length > 0) {
                    resultsContainer.innerHTML = filtered.map(p => `
                        <a href="/urun-${p.slug || p.id}" class="search-result-item">
                            <img src="${p.images && p.images[0] ? p.images[0] : '/assets/placeholder.jpg'}" class="search-result-img" alt="${p.name}">
                            <div class="search-result-info">
                                <div class="search-result-name">${p.name}</div>
                                <div class="search-result-price">${formatPrice(p.price)} ₺</div>
                            </div>
                        </a>
                    `).join('');
                } else {
                    resultsContainer.innerHTML = '<div class="search-no-result">Sonuç bulunamadı.</div>';
                }
                
                searchPopup.classList.add('active');
            }, 300); // 300ms debounce
        } else {
            searchPopup.classList.remove('active');
        }
    });

    // Close popup on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchPopup.contains(e.target)) {
            searchPopup.classList.remove('active');
        }
    });
    
    // Open popup again if input is clicked and has >= 3 chars
    searchInput.addEventListener('click', () => {
        if (searchInput.value.trim().length >= 3) {
            searchPopup.classList.add('active');
        }
    });
}


// ==========================================
// DYNAMIC SIDEBAR MENU
// ==========================================
async function loadSidebarMenu() {
    try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success && data.data) {
            const menuContainer = document.getElementById('dynamic-sidebar-menu');
            if(!menuContainer) return;
            
            menuContainer.innerHTML = data.data.map(item => {
                let colorStyle = item.color ? `color: ${item.color};` : '';
                
                let iconHtml = '';
                if (item.icon) {
                    const animClass = item.animated ? ' is-animated' : '';
                    // No gap: icon sits flush left, text next to it
                    iconHtml = `<svg class="menu-icon-svg${animClass}" viewBox="0 0 24 24"><use href="/assets/svg-sprite.svg#${item.icon}"/></svg>`;
                }
                
                return `<a href="${item.url}" style="${colorStyle}">${iconHtml}${item.text}</a>`;
            }).join('');
        }
    } catch (error) {
        console.error('Sidebar menü yüklenemedi:', error);
    }
}
