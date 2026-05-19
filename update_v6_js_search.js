const fs = require('fs');
let code = fs.readFileSync('v6-script.js', 'utf8');

const searchJs = `
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
                    resultsContainer.innerHTML = filtered.map(p => \`
                        <a href="/urun-\${p.slug || p.id}" class="search-result-item">
                            <img src="\${p.images && p.images[0] ? p.images[0] : '/assets/placeholder.jpg'}" class="search-result-img" alt="\${p.name}">
                            <div class="search-result-info">
                                <div class="search-result-name">\${p.name}</div>
                                <div class="search-result-price">\${formatPrice(p.price)} ₺</div>
                            </div>
                        </a>
                    \`).join('');
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
`;

code += '\n' + searchJs;

// Add initLiveSearch to DOMContentLoaded
code = code.replace(
    "loadCampaignMarquee();",
    "loadCampaignMarquee();\n    initLiveSearch();"
);

fs.writeFileSync('v6-script.js', code);
console.log('v6-script.js updated with live search logic.');
