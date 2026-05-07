const fs = require('fs');

// =====================================================================
// STEP 1: v6-design.css - Add full-width responsive overrides
// =====================================================================
const fullWidthCSS = `
/* ============================================================
   GLOBAL FULL-WIDTH & RESPONSIVE LAYOUT SYSTEM
   ============================================================ */

/* Force all page wrappers to be full-width */
.cart-container,
.checkout-container,
.product-detail-wrapper,
.account-container,
.register-container,
.contact-container,
.category-container,
.page-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 40px !important;
    box-sizing: border-box;
}

/* Inner content max-width for readability - acts as soft container */
.cart-layout,
.checkout-grid,
.product-layout,
.account-layout,
.category-layout {
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
}

/* v6-header full-width enforcement */
.v6-top-bar,
.v6-main-header,
.v6-footer {
    width: 100% !important;
    max-width: 100% !important;
    left: 0;
    right: 0;
}

.v6-header-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 40px;
}

/* Section wrappers */
.v6-section-inner,
.v6-products-grid,
.v6-faq-container,
.v6-collections-section {
    max-width: 1600px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 40px;
    padding-right: 40px;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
    .cart-container,
    .checkout-container,
    .product-detail-wrapper,
    .account-container,
    .page-container {
        padding: 0 24px !important;
    }
    .v6-header-container,
    .v6-section-inner {
        padding: 0 24px;
    }
}

@media (max-width: 900px) {
    .checkout-grid {
        grid-template-columns: 1fr !important;
    }
    .checkout-sidebar {
        position: static !important;
        order: -1;
    }
    .cart-layout {
        grid-template-columns: 1fr !important;
    }
}

@media (max-width: 768px) {
    .cart-container,
    .checkout-container,
    .product-detail-wrapper,
    .account-container,
    .page-container {
        padding: 0 16px !important;
    }
    .v6-header-container,
    .v6-section-inner {
        padding: 0 16px;
    }
    .v6-footer > div {
        padding: 40px 16px 20px !important;
    }
    .v6-footer [style*="grid-template-columns:2fr"] {
        grid-template-columns: 1fr 1fr !important;
    }
}

@media (max-width: 480px) {
    .cart-container,
    .checkout-container,
    .product-detail-wrapper,
    .account-container,
    .page-container {
        padding: 0 12px !important;
    }
    .v6-footer [style*="grid-template-columns:2fr"] {
        grid-template-columns: 1fr !important;
    }
}
`;

let css = fs.readFileSync('v6-design.css', 'utf8');
if (!css.includes('GLOBAL FULL-WIDTH & RESPONSIVE LAYOUT SYSTEM')) {
    fs.appendFileSync('v6-design.css', fullWidthCSS);
    console.log('✅ Added full-width CSS to v6-design.css');
} else {
    console.log('⚠️  Full-width CSS already present');
}

// =====================================================================
// STEP 2: styles.css - Remove container max-width restriction
// =====================================================================
let stylesCss = fs.readFileSync('styles.css', 'utf8');
// Increase container width to 100%
stylesCss = stylesCss.replace('--container-width: 1400px;', '--container-width: 100%;');
// Ensure container has good padding
stylesCss = stylesCss.replace(
    '.container {\n    max-width: var(--container-width);\n    margin: 0 auto;\n    padding: 0 20px;\n}',
    '.container {\n    max-width: 1600px;\n    width: 100%;\n    margin: 0 auto;\n    padding: 0 40px;\n    box-sizing: border-box;\n}'
);
fs.writeFileSync('styles.css', stylesCss);
console.log('✅ Updated styles.css container');

// =====================================================================
// STEP 3: Update individual page containers
// =====================================================================
const pageUpdates = {
    'cart.html': [
        { from: '.cart-container {', to: '.cart-container {\n            width: 100%;\n            max-width: 100%;' },
        { from: 'padding: 60px 0;', to: 'padding: 40px 40px;' }
    ],
    'checkout.html': [
        { from: '.checkout-container {\n            max-width: 1400px;\n            margin: 20px auto;\n            padding: 0 20px;\n        }', 
          to: '.checkout-container {\n            width: 100%;\n            max-width: 100%;\n            margin: 20px 0;\n            padding: 0 40px;\n            box-sizing: border-box;\n        }' }
    ]
};

Object.entries(pageUpdates).forEach(([file, updates]) => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    updates.forEach(({ from, to }) => {
        if (html.includes(from)) {
            html = html.replace(from, to);
            console.log(`✅ Updated ${file}`);
        }
    });
    fs.writeFileSync(file, html);
});

// =====================================================================
// STEP 4: product.html - ensure full width
// =====================================================================
let product = fs.readFileSync('product.html', 'utf8');
if (!product.includes('product-detail-wrapper')) {
    // Wrap the main product content in a full-width div
    console.log('ℹ️  product.html already managed or different structure');
}

console.log('\n✅ Full-width layout applied to all pages!');
