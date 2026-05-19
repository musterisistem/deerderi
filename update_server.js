const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const routeCode = `
    // GET /api/campaigns
    if (requestUrl === '/api/campaigns' && request.method === 'GET') {
        return handleGetCampaigns(response);
    }
    // POST /api/admin/campaigns
    if (requestUrl === '/api/admin/campaigns' && request.method === 'POST') {
        return handleAdminSaveCampaigns(request, response);
    }
`;
code = code.replace('    // 5.2 API: Send Email', routeCode + '\n    // 5.2 API: Send Email');

const handlersCode = `
// CAMPAIGNS API
function handleGetCampaigns(response) {
    const fs = require('fs');
    fs.readFile('./campaigns.json', 'utf8', (err, data) => {
        let campaigns = [];
        if (!err) {
            try { campaigns = JSON.parse(data); } catch(e){}
        } else {
            // Default campaigns if file doesn't exist
            campaigns = [
                { id: 1, text: 'ANNELER GÜNÜ KOLEKSİYONU YAYINDA!', icon: 'fa-gift', color: '#e83e8c', link: '#' },
                { id: 2, text: 'SEZON SONU İNDİRİM FIRSATLARI!', icon: 'fa-tags', color: '#fd7e14', link: '#' },
                { id: 3, text: '2. GÖZLÜKTE NET %50 İNDİRİM!', icon: 'fa-glasses', color: '#17a2b8', link: '#' },
                { id: 4, text: '2000₺ VE ÜZERİ ÜCRETSİZ KARGO!', icon: 'fa-truck-fast', color: '#28a745', link: '#' },
                { id: 5, text: 'YENİ SEZON ÜRÜNLERİ KEŞFEDİN!', icon: 'fa-star', color: '#ffc107', link: '#' }
            ];
        }
        sendJSON(response, 200, { success: true, data: campaigns });
    });
}

async function handleAdminSaveCampaigns(request, response) {
    const fs = require('fs');
    try {
        const data = await parseBody(request);
        if (data.campaigns && Array.isArray(data.campaigns)) {
            if(data.campaigns.length > 6) {
                return sendJSON(response, 400, { success: false, error: 'En fazla 6 kampanya eklenebilir.' });
            }
            fs.writeFile('./campaigns.json', JSON.stringify(data.campaigns, null, 2), (err) => {
                if(err) return sendJSON(response, 500, { success: false, error: 'Kaydedilemedi' });
                sendJSON(response, 200, { success: true });
            });
        } else {
            sendJSON(response, 400, { success: false, error: 'Geçersiz veri' });
        }
    } catch(e) {
        sendJSON(response, 500, { success: false, error: e.message });
    }
}
`;

code += '\n' + handlersCode;
fs.writeFileSync('server.js', code);
console.log('Added campaign routes and handlers.');
