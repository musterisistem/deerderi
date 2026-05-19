const fs = require('fs');
let code = fs.readFileSync('v6-script.js', 'utf8');

const jsCode = `
// ==========================================
// DYNAMIC SIDEBAR MENU
// ==========================================
async function loadSidebarMenu() {
    try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success && data.data) {
            const menuContainer = document.getElementById('dynamic-sidebar-menu');
            if(!menuContainer) return;
            
            menuContainer.innerHTML = data.data.map(item => {
                let colorStyle = item.color ? \`color: \${item.color};\` : '';
                let iconHtml = item.icon ? \`<svg class="i i-\${item.icon}" style="--i-size: 16px; margin-right: 8px; vertical-align: middle;"><use href="/assets/svg-sprite.svg#\${item.icon}"/></svg>\` : '';
                
                return \`<a href="\${item.url}" style="\${colorStyle}">\${iconHtml}\${item.text}</a>\`;
            }).join('');
        }
    } catch (error) {
        console.error('Sidebar menü yüklenemedi:', error);
    }
}
`;

code = code.replace(
    "loadCampaignMarquee();",
    "loadCampaignMarquee();\n    loadSidebarMenu();"
);
code += '\n' + jsCode;

fs.writeFileSync('v6-script.js', code);
console.log('v6-script.js updated with dynamic menu.');
