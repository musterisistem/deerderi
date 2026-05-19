import fs from 'fs';

const SCRIPT_JS = './script.js';
let scriptContent = fs.readFileSync(SCRIPT_JS, 'utf8');

// We want to move the "if (data.data.paytr)" block below the User Registration block.
// Let's just remove the paytr block from where it is and put it before the localOrder saving block.
const paytrBlock = `
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

// Remove it first (handle variations of whitespace roughly)
scriptContent = scriptContent.replace(paytrBlock, "");

// Add it right before the "const localOrder = {"
if (!scriptContent.includes('form.action = \'https://www.paytr.com/odeme\';')) {
    scriptContent = scriptContent.replace(
        "const localOrder = {",
        paytrBlock.trim() + "\n\n        const localOrder = {"
    );
    fs.writeFileSync(SCRIPT_JS, scriptContent, 'utf8');
    console.log('script.js fixed.');
} else {
    console.log('Already fixed.');
}

