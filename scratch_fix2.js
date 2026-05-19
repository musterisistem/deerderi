const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const regex = /window\.toggleNewAddressForm = function \(\) \{[\s\S]*?updateCheckoutSummary\(\);\s*\};/;

const fixedCode = `window.toggleNewAddressForm = function () {
    const form = document.getElementById('checkout-address-form');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        window.selectedAddressId = null;
        document.querySelectorAll('.saved-address-card').forEach(c => {
            c.classList.remove('selected');
            const icon = c.querySelector('i');
            if(icon) icon.className = 'fa-regular fa-circle';
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

    document.querySelectorAll('.shipping-mini-card, .shipping-card').forEach(opt => {
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
    const transferForm = document.getElementById('payment-transfer-form');
    const codMsg = document.getElementById('payment-cod-msg');
    
    const ccBtn = document.getElementById('btn-pay-cc');

    if (type === 'door') {
        if (cardForm) cardForm.style.display = 'none';
        if (transferForm) transferForm.style.display = 'none';
        if (ccBtn) ccBtn.parentElement.style.display = 'none';
        if (codMsg) codMsg.style.display = 'block';
    } else {
        if (ccBtn) ccBtn.parentElement.style.display = 'flex';
        if (codMsg) codMsg.style.display = 'none';
        if (typeof window.setPaymentMethod === 'function') {
            window.setPaymentMethod(window.paymentMethod || 'credit_card');
        }
    }

    if (typeof updateCheckoutSummary === 'function') {
        updateCheckoutSummary();
    }
};`;

code = code.replace(regex, fixedCode);
fs.writeFileSync('script.js', code, 'utf8');
console.log('Fixed script.js successfully');
