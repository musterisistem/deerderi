const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const newCheckoutLogic = `// --- NEW ROBUST CHECKOUT SYSTEM ---

window.initCheckout = function () {
    console.log('🚀 Init Checkout Started (One-Page)');
    try {
        // Load Cart
        window.cart = JSON.parse(localStorage.getItem('deerDeriCart')) || [];
        updateCheckoutSummary();

        if (typeof populateCities === 'function') {
            populateCities();
        }

        const user = UserManager.getCurrentUser();
        const guestInfoBox = document.getElementById('checkout-guest-info');
        const loginLink = document.getElementById('checkout-login-link');
        const savedBox = document.getElementById('checkout-saved-addresses');
        const formBox = document.getElementById('checkout-address-form');

        if (user) {
            // Logged in
            if(guestInfoBox) guestInfoBox.style.display = 'none';
            if(loginLink) loginLink.style.display = 'none';
            
            if (user.addresses && user.addresses.length > 0) {
                if (savedBox) savedBox.style.display = 'block';
                if (formBox) formBox.style.display = 'none';
                renderCheckoutAddresses(user.addresses);
            } else {
                if (savedBox) savedBox.style.display = 'none';
                if (formBox) formBox.style.display = 'block';
            }
        } else {
            // Guest
            if(guestInfoBox) guestInfoBox.style.display = 'block';
            if(loginLink) loginLink.style.display = 'block';
            if (savedBox) savedBox.style.display = 'none';
            if (formBox) formBox.style.display = 'block';
        }

        document.body.style.opacity = '1';

    } catch (error) {
        console.error('❌ Checkout Init Error:', error);
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

window.processOrder = async function () {
    const user = UserManager.getCurrentUser();
    const isNewAddr = document.getElementById('checkout-address-form') && document.getElementById('checkout-address-form').style.display !== 'none';
    
    // Validate Guest Info if not logged in
    if (!user) {
        const guestFields = ['guest-name', 'guest-surname', 'guest-email', 'guest-phone'];
        if (!validateFields(guestFields)) {
            showToast('Lütfen kişisel bilgilerinizi eksiksiz doldurun.', 'error');
            return;
        }
    }

    // Validate Address
    if (isNewAddr) {
        if (!validateFields(['addr-text-input', 'city-select', 'district-select'])) {
            showToast('Lütfen teslimat adresini eksiksiz doldurun.', 'error');
            return;
        }
        window.currentCheckoutAddress = {
            id: 'temp-' + Date.now(),
            title: document.getElementById('addr-title-input').value || 'Teslimat Adresi',
            address: document.getElementById('addr-text-input').value,
            city: document.getElementById('city-select').value,
            district: document.getElementById('district-select').value,
            phone: user ? user.phone : document.getElementById('guest-phone').value
        };
    } else {
        if (!window.selectedAddressId) {
            showToast('Lütfen bir teslimat adresi seçin.', 'error');
            return;
        }
        window.currentCheckoutAddress = user.addresses.find(a => a.id === window.selectedAddressId);
    }

    // Validate Payment
    if (window.currentShippingType !== 'door') {
        if (!validateFields(['card-name', 'card-number', 'card-expiry', 'card-cvv'])) {
            showToast('Lütfen ödeme bilgilerinizi girin.', 'error');
            return;
        }
    }

    let finalAddr = window.currentCheckoutAddress;

    // Save Address if logged in and new
    if (user && finalAddr && (finalAddr.id && finalAddr.id.toString().startsWith('temp-'))) {
        const isAlreadyInSaved = user.addresses && user.addresses.find(a => a.address === finalAddr.address);
        if (!isAlreadyInSaved) {
            const persistentAddr = {
                ...finalAddr,
                id: Date.now().toString() + Math.floor(Math.random() * 1000)
            };
            user.addresses = user.addresses || [];
            user.addresses.push(persistentAddr);
            finalAddr = persistentAddr;

            UserManager.setCurrentUser(user);
            const users = UserManager.getUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx > -1) {
                users[idx].addresses = user.addresses;
                UserManager.saveUsers(users);
            }
        }
    }

    // Register guest automatically as mentioned in old flow
    let currentUserData = user;
    if (!currentUserData) {
        currentUserData = {
            firstName: document.getElementById('guest-name').value,
            lastName: document.getElementById('guest-surname').value,
            email: document.getElementById('guest-email').value,
            phone: document.getElementById('guest-phone').value
        };
    }

    const orderId = saveOrderToHistory(window.cart, calculateTotal(), window.currentShippingType, finalAddr);

    // --- MAIL GONDERIMI ---
    const totalAmount = calculateTotal();
    const shippingCost = (typeof currentShippingCost !== 'undefined' ? currentShippingCost : 0);

    const mailData = {
        orderNumber: orderId,
        date: new Date().toLocaleDateString('tr-TR'),
        customerName: (currentUserData.firstName + ' ' + (currentUserData.lastName || '')).trim(),
        customerEmail: currentUserData.email,
        customerPhone: currentUserData.phone || (finalAddr ? finalAddr.phone : ''),
        paymentMethod: window.currentShippingType === 'door' ? 'Kapıda Ödeme' : 'Kredi Kartı',
        items: JSON.parse(JSON.stringify(window.cart)),
        subtotal: totalAmount - shippingCost,
        shipping: window.currentShippingType,`;

const regex = /\/\/ --- NEW ROBUST CHECKOUT SYSTEM ---[\s\S]*?shipping: window\.currentShippingType,/;
if(regex.test(code)) {
    code = code.replace(regex, newCheckoutLogic);
    fs.writeFileSync('script.js', code);
    console.log('Replaced Checkout logic.');
} else {
    console.log('Regex did not match.');
}
