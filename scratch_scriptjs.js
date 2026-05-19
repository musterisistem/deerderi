const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

const startMarker = 'window.initCheckout = function () {';
const endMarker = 'window.updateCheckoutSummary = function () {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers in script.js");
    process.exit(1);
}

const replacement = `window.initCheckout = function () {
    console.log('🚀 Init Single-Page Checkout Started');
    try {
        window.cart = JSON.parse(localStorage.getItem('deerDeriCart')) || [];
        updateCheckoutSummary();

        if (typeof populateCities === 'function') {
            populateCities();
        }

        const user = UserManager.getCurrentUser();
        const guestContainer = document.getElementById('guest-form-container');
        const loggedInContainer = document.getElementById('logged-in-user-container');
        const authLinks = document.getElementById('checkout-auth-links');
        const savedBox = document.getElementById('checkout-saved-addresses');
        const formBox = document.getElementById('checkout-address-form');

        if (user) {
            if (guestContainer) guestContainer.style.display = 'none';
            if (authLinks) authLinks.style.display = 'none';
            if (loggedInContainer) {
                loggedInContainer.style.display = 'block';
                const nameEl = document.getElementById('logged-in-user-name');
                if (nameEl) nameEl.textContent = user.firstName + (user.lastName ? ' ' + user.lastName : '');
            }
            if (user.addresses && user.addresses.length > 0) {
                if (savedBox) savedBox.style.display = 'block';
                if (formBox) formBox.style.display = 'none';
                renderCheckoutAddresses(user.addresses);
            } else {
                if (savedBox) savedBox.style.display = 'none';
                if (formBox) formBox.style.display = 'block';
            }
        } else {
            if (guestContainer) guestContainer.style.display = 'block';
            if (loggedInContainer) loggedInContainer.style.display = 'none';
            if (authLinks) authLinks.style.display = 'block';
            if (savedBox) savedBox.style.display = 'none';
            if (formBox) formBox.style.display = 'block';
        }

        document.body.style.opacity = '1';
    } catch (error) {
        console.error('❌ Checkout Init Error:', error);
    }
};

window.toggleBillingAddress = function () {
    const isChecked = document.getElementById('use-same-address').checked;
    const container = document.getElementById('billing-address-container');
    if (container) {
        container.style.display = isChecked ? 'none' : 'block';
    }
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

// goToStep logic removed for single-page layout

window.processOrder = async function () {
    const user = typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null;
    let valid = true;
    
    // 1. Validate User Info if guest
    let customerName = '', customerEmail = '', customerPhone = '', tc = '';
    if (!user) {
        if (!validateFields(['guest-name', 'guest-surname', 'guest-email', 'guest-phone'])) {
            valid = false;
        } else {
            customerName = (document.getElementById('guest-name').value + ' ' + document.getElementById('guest-surname').value).trim();
            customerEmail = document.getElementById('guest-email').value.trim();
            customerPhone = document.getElementById('guest-phone').value.trim();
            tc = document.getElementById('guest-tc') ? document.getElementById('guest-tc').value.trim() : '';
        }
    } else {
        customerName = user.firstName + (user.lastName ? ' ' + user.lastName : '');
        customerEmail = user.email;
        customerPhone = user.phone;
        tc = '';
    }

    // 2. Validate Delivery Address
    let finalShippingAddr = null;
    const isNewAddr = document.getElementById('checkout-address-form').style.display !== 'none';
    if (isNewAddr) {
        if (!validateFields(['addr-text-input', 'city-select', 'district-select'])) {
            valid = false;
        } else {
            finalShippingAddr = {
                title: document.getElementById('addr-title-input').value || 'Yeni Adres',
                address: document.getElementById('addr-text-input').value,
                city: document.getElementById('city-select').value,
                district: document.getElementById('district-select').value
            };
        }
    } else {
        if (!window.selectedAddressId) {
            valid = false;
        } else {
            finalShippingAddr = user.addresses.find(a => a.id === window.selectedAddressId);
        }
    }

    // 3. Validate Billing Address
    let finalBillingAddr = null;
    const useSameCb = document.getElementById('use-same-address');
    const useSameAddress = useSameCb ? useSameCb.checked : true;
    
    if (!useSameAddress) {
        if (!validateFields(['billing-title', 'billing-text-input', 'billing-city', 'billing-district'])) {
            valid = false;
        } else {
            finalBillingAddr = {
                title: document.getElementById('billing-title').value,
                address: document.getElementById('billing-text-input').value,
                city: document.getElementById('billing-city').value,
                district: document.getElementById('billing-district').value
            };
        }
    } else {
        finalBillingAddr = finalShippingAddr;
    }

    // 4. Validate Payment Method
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    const isDoor = shippingRadio && shippingRadio.value === 'door';
    
    if (!isDoor) {
        if (!validateFields(['card-name', 'card-number', 'card-expiry', 'card-cvv'])) {
            valid = false;
        }
    }

    if (!valid) {
        showToast('Lütfen zorunlu alanları eksiksiz doldurun.', 'error');
        return;
    }

    if (!window.cart || window.cart.length === 0) {
        showToast('Sepetiniz boş.', 'error');
        return;
    }

    // Build order payload
    const cartItems = window.cart.map(item => ({
        productId: item._id || item.mongoId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        slug: item.slug || '',
    }));

    const shippingMethod = isDoor ? 'door' : 'standard';
    const paymentMethod = isDoor ? 'cashOnDelivery' : 'creditCard';

    const orderPayload = {
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            tc: tc
        },
        shippingAddress: {
            title: finalShippingAddr.title || 'Ev',
            line1: finalShippingAddr.address || finalShippingAddr.line1 || '',
            city: finalShippingAddr.city || '',
            district: finalShippingAddr.district || '',
        },
        billingAddress: finalBillingAddr ? {
            title: finalBillingAddr.title || 'Fatura',
            line1: finalBillingAddr.address || finalBillingAddr.line1 || '',
            city: finalBillingAddr.city || '',
            district: finalBillingAddr.district || '',
        } : null,
        items: cartItems,
        shippingMethod,
        paymentMethod,
        couponCode: window.appliedCouponCode || null,
    };

    const submitBtn = document.querySelector('[onclick="processOrder()"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'İşleniyor...';
    }

    try {
        showToast('Siparişiniz işleniyor...', 'info');

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Sipariş oluşturulamadı');
        }

        const orderNumber = data.data.orderNumber;

        const localOrder = {
            id: orderNumber,
            orderNumber,
            date: new Date().toLocaleDateString('tr-TR'),
            items: window.cart,
            address: finalShippingAddr,
            shipping: shippingMethod,
            total: data.data.total,
        };
        const localOrders = JSON.parse(localStorage.getItem('deerDeriOrders') || '[]');
        localOrders.push(localOrder);
        localStorage.setItem('deerDeriOrders', JSON.stringify(localOrders));

        window.cart = [];
        localStorage.setItem('deerDeriCart', JSON.stringify([]));
        if (typeof updateCartBadge === 'function') updateCartBadge();

        showToast('Siparişiniz alındı! Yönlendiriliyorsunuz...', 'success');
        setTimeout(() => {
            window.location.href = \`/siparis-tamamlandi?orderNumber=\${encodeURIComponent(orderNumber)}\`;
        }, 1500);

    } catch (err) {
        console.error('processOrder error:', err);
        showToast('Hata: ' + err.message, 'error');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SİPARİŞİ TAMAMLA';
        }
    }
};

`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('script.js', newContent, 'utf8');
console.log('script.js updated successfully.');
