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

// Initialize scripts
document.addEventListener('DOMContentLoaded', () => {
    startCountdown();

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
