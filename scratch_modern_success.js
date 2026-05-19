const fs = require('fs');
let html = fs.readFileSync('success.html', 'utf8');

const newHeroCss = `
        .success-hero {
            background: #fafafa;
            border-bottom: 1px solid #ebebeb;
            color: #111;
            padding: 80px 20px 60px;
            text-align: center;
            position: relative;
        }

        .success-icon-box {
            width: 90px;
            height: 90px;
            background: #e8f5e9;
            color: #2e7d32;
            border: 2px solid #c8e6c9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            box-shadow: 0 0 30px rgba(46, 125, 50, 0.2), inset 0 0 20px rgba(255,255,255,1);
            animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), gentlePulseSuccess 2s infinite alternate ease-in-out;
        }

        @keyframes gentlePulseSuccess {
            0% { box-shadow: 0 0 20px rgba(46, 125, 50, 0.15), inset 0 0 20px rgba(255,255,255,1); transform: translateY(0); }
            100% { box-shadow: 0 0 40px rgba(46, 125, 50, 0.3), inset 0 0 20px rgba(255,255,255,1); transform: translateY(-4px); }
        }

        .success-hero h1 {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            margin-bottom: 15px;
            font-weight: 700;
            color: #111;
        }

        .success-hero p {
            font-size: 16px;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            font-weight: 400;
        }

        .order-card {
            max-width: 900px;
            margin: -30px auto 60px; /* Slight overlap */
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
            border: 1px solid #ebebeb;
            overflow: hidden;
            position: relative;
            z-index: 10;
            animation: slideUp 0.7s ease-out;
        }
`;

// Replace the old css block
const regex = /\.success-hero \{[\s\S]*?\.order-card \{[\s\S]*?animation: slideUp 0\.7s ease-out;\s*\}/;

if(html.match(regex)) {
    html = html.replace(regex, newHeroCss.trim());
} else {
    console.log("Regex didn't match perfectly, trying broader replace.");
    // Fallback if formatting is slightly different
    html = html.replace(/\.success-hero \{[\s\S]*?slideUp 0\.7s ease-out;\s*\}/, newHeroCss.trim());
}

// Remove the old negative margin-top inline style from loading box
html = html.replace(/margin-top:-40px;/g, 'margin-top:-30px;');

fs.writeFileSync('success.html', html, 'utf8');
console.log('Success page updated to modern light theme');
