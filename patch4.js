import fs from 'fs';

const SCRIPT_JS = './script.js';
let scriptContent = fs.readFileSync(SCRIPT_JS, 'utf8');

const maskCode = `
// Credit Card Input Masks
window.addEventListener('DOMContentLoaded', () => {
    const ccNum = document.getElementById('card-number');
    const ccExp = document.getElementById('card-expiry');
    const ccCvv = document.getElementById('card-cvv');
    const ccName = document.getElementById('card-name');

    if (ccNum) {
        ccNum.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\\D/g, '');
            val = val.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = val.substring(0, 19);
        });
    }
    
    if (ccExp) {
        ccExp.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\\D/g, '');
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2, 4);
            }
            e.target.value = val.substring(0, 5);
        });
    }
    
    if (ccCvv) {
        ccCvv.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\\D/g, '');
            e.target.value = val.substring(0, 4);
        });
    }

    if (ccName) {
        ccName.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\\s]/g, '').toUpperCase();
        });
    }
});
`;

if (!scriptContent.includes('// Credit Card Input Masks')) {
    scriptContent = scriptContent + "\n" + maskCode;
    fs.writeFileSync(SCRIPT_JS, scriptContent, 'utf8');
    console.log('script.js updated with masks.');
} else {
    console.log('script.js already has masks.');
}

