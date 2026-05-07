const fs = require('fs');

// Read current file
let html = fs.readFileSync('checkout.html', 'utf8');

// Remove duplicate DOCTYPE/html/head declarations at top
// The file has a broken duplicate at the start
html = html.replace(/<!DOCTYPE html>\r?\n<html lang="tr">\r?\n\r?\n<head>\r?\n    <meta charset="UTF-8">\r?\n<!DOCTYPE html>\n<html lang="tr">\n\nhead>\n    <meta charset="UTF-8">\n    <meta name="viewport"[^\n]*\n    <meta name="google-site-verification"[^\n]*\n    <title>DEER DERI \| Ödeme<\/title>\n    <link rel="stylesheet" href="v6-design\.css\?v=207">\n/, `<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-site-verification" content="kLmZs2xRHV_V-byOVIHxyP3cAKrClsnj0JUWQRgfgBM" />
    <title>DEER DERI | Ödeme</title>
    <link rel="stylesheet" href="v6-design.css?v=207">
    <link rel="stylesheet" href="styles.css?v=2">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary-black: #000000;
            --soft-grey: #f8f8f8;
            --border-color: #e5e5e5;
            --text-muted: #666666;
            --success-green: #2e7d32;
        }

        /* FULL WIDTH CHECKOUT */
        body { overflow-x: hidden; }

        .checkout-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 30px 60px 0 60px;
            box-sizing: border-box;
        }

`);

// Check if it worked
const lines = html.split('\n');
console.log('First 20 lines after fix:');
lines.slice(0, 20).forEach((l, i) => console.log(i+1, l));

fs.writeFileSync('checkout.html', html);
console.log('\nDone. Total lines:', lines.length);
