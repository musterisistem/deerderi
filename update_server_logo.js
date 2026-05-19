const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const routeCode = `
    // POST /api/admin/logo
    if (requestUrl === '/api/admin/logo' && request.method === 'POST') {
        return handleAdminUploadLogo(request, response);
    }
`;
code = code.replace('    // POST /api/admin/campaigns', routeCode + '\n    // POST /api/admin/campaigns');

const handlerCode = `
// UPLOAD LOGO API
function handleAdminUploadLogo(request, response) {
    let body = '';
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

    request.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_SIZE) {
            sendJSON(response, 413, { success: false, error: 'File too large' });
            request.destroy();
        }
    });

    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.image || !data.image.includes('base64')) {
                throw new Error('Invalid image data');
            }

            const base64Data = data.image.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            const fs = require('fs');
            fs.writeFileSync('./assets/logo.png', imageBuffer);

            sendJSON(response, 200, { success: true, url: '/assets/logo.png?v=' + Date.now() });
        } catch (error) {
            console.error('Logo upload error:', error);
            sendJSON(response, 500, { success: false, error: error.message });
        }
    });
}
`;

code += '\n' + handlerCode;
fs.writeFileSync('server.js', code);
console.log('Logo API added.');
