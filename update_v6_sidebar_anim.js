const fs = require('fs');
let code = fs.readFileSync('v6-script.js', 'utf8');

// Find and replace the loadSidebarMenu function
const funcStart = code.lastIndexOf('async function loadSidebarMenu()');
const funcEnd = code.indexOf('\n}', funcStart) + 2; // find closing brace

const oldFunc = code.substring(funcStart, funcEnd);

const newFunc = `async function loadSidebarMenu() {
    try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success && data.data) {
            const menuContainer = document.getElementById('dynamic-sidebar-menu');
            if(!menuContainer) return;
            
            menuContainer.innerHTML = data.data.map(item => {
                let colorStyle = item.color ? \`color: \${item.color};\` : '';
                
                let iconHtml = '';
                if (item.icon) {
                    const animClass = item.animated ? ' is-animated' : '';
                    // No gap: icon sits flush left, text next to it
                    iconHtml = \`<svg class="menu-icon-svg\${animClass}" viewBox="0 0 24 24"><use href="/assets/svg-sprite.svg#\${item.icon}"/></svg>\`;
                }
                
                return \`<a href="\${item.url}" style="\${colorStyle}">\${iconHtml}\${item.text}</a>\`;
            }).join('');
        }
    } catch (error) {
        console.error('Sidebar menü yüklenemedi:', error);
    }
}`;

code = code.substring(0, funcStart) + newFunc + code.substring(funcEnd);
fs.writeFileSync('v6-script.js', code);
console.log('v6-script.js: loadSidebarMenu updated with animation support.');
