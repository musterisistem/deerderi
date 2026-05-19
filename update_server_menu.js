const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const apiCode = `
    // GET /api/menu
    if (requestUrl === '/api/menu' && request.method === 'GET') {
        return handleGetMenu(response);
    }
    // POST /api/admin/menu
    if (requestUrl === '/api/admin/menu' && request.method === 'POST') {
        return handleAdminUpdateMenu(request, response);
    }
`;

code = code.replace('    // GET /api/campaigns', apiCode + '\n    // GET /api/campaigns');

const handlerCode = `
// MENU API
function handleGetMenu(response) {
    try {
        let menuItems = [];
        const fs = require('fs');
        if (fs.existsSync('./menu.json')) {
            menuItems = JSON.parse(fs.readFileSync('./menu.json', 'utf8'));
        } else {
            // Defaults
            menuItems = [
                { id: 1, text: 'ANA SAYFA', url: '/', icon: '', color: '' },
                { id: 2, text: 'CÜZDANLAR', url: '/kategori/cuzdan', icon: '', color: '' },
                { id: 3, text: 'ÇANTALAR', url: '/kategori/canta', icon: '', color: '' },
                { id: 4, text: 'GÖZLÜKLER', url: '/kategori/gozluk', icon: '', color: '' },
                { id: 5, text: 'ŞAPKALAR', url: '/kategori/sapka', icon: '', color: '' },
                { id: 6, text: 'AKSESUAR', url: '/kategori/aksesuar', icon: '', color: '' },
                { id: 7, text: 'KEMER', url: '/kategori/kemer', icon: '', color: '' },
                { id: 8, text: 'İNDİRİM FIRSATI! 🔥', url: '/indirim', icon: 'fire', color: '#ff0000' },
                { id: 9, text: 'İLETİŞİM', url: '/iletisim', icon: '', color: '' }
            ];
            fs.writeFileSync('./menu.json', JSON.stringify(menuItems, null, 2));
        }
        sendJSON(response, 200, { success: true, data: menuItems });
    } catch (e) {
        sendJSON(response, 500, { success: false, error: e.message });
    }
}

function handleAdminUpdateMenu(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk;
    });
    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.menu || !Array.isArray(data.menu)) {
                return sendJSON(response, 400, { success: false, error: 'Invalid menu data' });
            }
            const fs = require('fs');
            fs.writeFileSync('./menu.json', JSON.stringify(data.menu, null, 2));
            sendJSON(response, 200, { success: true });
        } catch (error) {
            sendJSON(response, 500, { success: false, error: error.message });
        }
    });
}
`;

code += '\n' + handlerCode;
fs.writeFileSync('server.js', code);
console.log('server.js updated with menu API.');
