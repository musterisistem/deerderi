import fs from 'fs';

const SCRIPT_JS = './script.js';
let scriptContent = fs.readFileSync(SCRIPT_JS, 'utf8');

const injectionCode = `
        const orderNumber = data.data.orderNumber;
        
        if (data.data.paytr) {
            const paytr = data.data.paytr;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://www.paytr.com/odeme';
            form.style.display = 'none';
            
            for (const key in paytr) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = paytr[key];
                form.appendChild(input);
            }
            
            const expiry = document.getElementById('card-expiry').value.split('/');
            const expMonth = expiry[0] ? expiry[0].trim() : '';
            const expYear = expiry[1] ? expiry[1].trim() : '';
            
            const ccFields = {
                cc_owner: document.getElementById('card-name').value,
                card_number: document.getElementById('card-number').value.replace(/\\s+/g, ''),
                expiry_month: expMonth,
                expiry_year: expYear,
                cvv: document.getElementById('card-cvv').value
            };
            
            for (const key in ccFields) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = ccFields[key];
                form.appendChild(input);
            }
            
            document.body.appendChild(form);
            showToast('PayTR Ödeme sayfasına yönlendiriliyorsunuz...', 'info');
            form.submit();
            return;
        }
`;

if (!scriptContent.includes('form.action = \'https://www.paytr.com/odeme\';')) {
    scriptContent = scriptContent.replace(
        "const orderNumber = data.data.orderNumber;",
        injectionCode
    );
    fs.writeFileSync(SCRIPT_JS, scriptContent, 'utf8');
    console.log('script.js updated.');
} else {
    console.log('script.js already updated.');
}


const CHECKOUT_HTML = './checkout.html';
let checkoutContent = fs.readFileSync(CHECKOUT_HTML, 'utf8');

if (!checkoutContent.includes('paytr_failed')) {
    checkoutContent = checkoutContent.replace(
        "</body>",
        "    <script>\n        window.addEventListener('load', () => {\n            const urlParams = new URLSearchParams(window.location.search);\n            if (urlParams.get('error') === 'paytr_failed') {\n                alert('Ödemeniz reddedildi veya bir hata oluştu. Lütfen tekrar deneyin.');\n            }\n        });\n    </script>\n</body>"
    );
    fs.writeFileSync(CHECKOUT_HTML, checkoutContent, 'utf8');
    console.log('checkout.html updated.');
} else {
    console.log('checkout.html already updated.');
}


const SUCCESS_HTML = './success.html';
if (fs.existsSync(SUCCESS_HTML)) {
    let successContent = fs.readFileSync(SUCCESS_HTML, 'utf8');
    if (!successContent.includes('deerDeriCart')) {
        successContent = successContent.replace(
            "</body>",
            "    <script>\n        localStorage.setItem('deerDeriCart', JSON.stringify([]));\n    </script>\n</body>"
        );
        fs.writeFileSync(SUCCESS_HTML, successContent, 'utf8');
        console.log('success.html updated.');
    }
}
