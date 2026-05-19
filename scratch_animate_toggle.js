const fs = require('fs');
let html = fs.readFileSync('checkout.html', 'utf8');

const oldToggle = `<div id="auth-mode-selector" style="display:flex; border-bottom:1px solid #ebebeb; background:#f0f0f0; border-radius:6px 6px 0 0;">
                        <button type="button" id="btn-mode-guest" onclick="setCheckoutMode('guest')" class="btn-addr-type active" style="flex:1; border:none; border-radius:0; padding:15px; font-size:13px; font-weight:800; border-right:1px solid var(--border-color); display:flex; flex-direction:column; align-items:center; gap:5px; background:#fafafa;">
                            <i class="fa-solid fa-user-secret" style="font-size:18px;"></i>
                            MİSAFİR ALIŞVERİŞİ
                            <span style="font-size:10px; color:#666; font-weight:500;">Hızlı ve Üyeliksiz</span>
                        </button>
                        <button type="button" id="btn-mode-register" onclick="setCheckoutMode('register')" class="btn-addr-type" style="flex:1; border:none; border-radius:0; padding:15px; font-size:13px; font-weight:800; display:flex; flex-direction:column; align-items:center; gap:5px; background:transparent;">
                            <i class="fa-solid fa-user-plus" style="font-size:18px;"></i>
                            ÜYELİK OLUŞTUR
                            <span style="font-size:10px; color:#666; font-weight:500;">Kolay Takip ve Fırsatlar</span>
                        </button>
                    </div>`;

const newToggleHtml = `
                    <!-- Animated Auth Mode Selector -->
                    <div class="auth-mode-container">
                        <button type="button" id="btn-mode-guest" onclick="setCheckoutMode('guest')" class="auth-mode-btn active">
                            <i class="fa-solid fa-user-secret"></i>
                            MİSAFİR ALIŞVERİŞİ
                            <span>Hızlı ve Üyeliksiz</span>
                        </button>
                        <button type="button" id="btn-mode-register" onclick="setCheckoutMode('register')" class="auth-mode-btn">
                            <i class="fa-solid fa-user-plus"></i>
                            ÜYELİK OLUŞTUR
                            <span>Kolay Takip ve Fırsatlar</span>
                        </button>
                    </div>`;

const cssAdditions = `
        .auth-mode-container {
            display: flex;
            background: #f0f0f0;
            padding: 6px;
            border-radius: 12px;
            margin: 20px 20px 0 20px;
            position: relative;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
        }
        .auth-mode-btn {
            flex: 1;
            border: none;
            background: transparent;
            padding: 15px 10px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #888;
            position: relative;
            overflow: hidden;
        }
        .auth-mode-btn::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent);
            transform: translateX(-100%);
            transition: 0.6s;
        }
        .auth-mode-btn:hover::before {
            transform: translateX(100%);
        }
        .auth-mode-btn i {
            font-size: 20px;
            margin-bottom: 2px;
            transition: all 0.3s ease;
        }
        .auth-mode-btn.active {
            color: #000;
            background: #fff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            animation: gentlePulse 2s infinite ease-in-out;
        }
        .auth-mode-btn.active i {
            color: #000;
            transform: scale(1.1);
        }
        .auth-mode-btn span {
            font-size: 10px;
            font-weight: 600;
            opacity: 0.8;
            letter-spacing: 0.5px;
        }
        @keyframes gentlePulse {
            0% { box-shadow: 0 4px 15px rgba(0,0,0,0.05); transform: translateY(0); }
            50% { box-shadow: 0 6px 20px rgba(0,0,0,0.12); transform: translateY(-1px); }
            100% { box-shadow: 0 4px 15px rgba(0,0,0,0.05); transform: translateY(0); }
        }
`;

if(html.includes(oldToggle)) {
    html = html.replace(oldToggle, newToggleHtml);
    html = html.replace('</style>', cssAdditions + '\n    </style>');
    fs.writeFileSync('checkout.html', html, 'utf8');
    console.log('Toggle animated successfully.');
} else {
    console.log('Old toggle not found');
}
