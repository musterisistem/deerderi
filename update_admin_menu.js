const fs = require('fs');
let code = fs.readFileSync('admin.js', 'utf8');

// Titles map update
code = code.replace(
    "'logo-settings': 'Site Logosu'",
    "'logo-settings': 'Site Logosu',\n            'menu-settings': 'Site Menüsü'"
);

// Switch case update
code = code.replace(
    "case 'logo-settings':",
    "case 'menu-settings':\n                renderMenuConfigSettings(contentArea);\n                break;\n            case 'logo-settings':"
);

// Append menu logic
const menuJs = `
// ==========================================
// SITE MENU MANAGEMENT
// ==========================================
window.adminSaveMenu = async function() {
    const btn = document.getElementById('btn-save-menu');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...';
    btn.disabled = true;

    try {
        const rows = document.querySelectorAll('#menu-tbody tr');
        let menuItems = [];
        
        rows.forEach((row, index) => {
            const text = row.querySelector('.menu-text').value;
            const url = row.querySelector('.menu-url').value || '#';
            const icon = row.querySelector('.menu-icon').value;
            const color = row.querySelector('.menu-color').value;
            
            if(text) {
                menuItems.push({
                    id: index + 1,
                    text: text,
                    url: url,
                    icon: icon,
                    color: color === '#000000' ? '' : color // treat black as default/no color for simplicity or let them pick anything
                });
            }
        });

        const res = await fetch('/api/admin/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menu: menuItems })
        });
        
        const data = await res.json();
        if(data.success) {
            alert('Menü başarıyla kaydedildi! Web sitesinde anlık olarak güncellenecektir.');
        } else {
            alert('Hata: ' + data.error);
        }
    } catch(e) {
        console.error(e);
        alert('Kaydedilirken bir hata oluştu.');
    }
    
    btn.innerHTML = '<i class="fa-solid fa-save"></i> Değişiklikleri Kaydet';
    btn.disabled = false;
};

window.addMenuRow = function() {
    const tbody = document.getElementById('menu-tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = \`
        <td><input type="text" class="form-control menu-text" placeholder="Menü Adı" required></td>
        <td><input type="text" class="form-control menu-url" placeholder="/kategori/..." value="#"></td>
        <td>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="icon-preview" style="width: 24px; text-align:center;"></div>
                <input type="text" class="form-control menu-icon" placeholder="İkon seç (Opsiyonel)" readonly onclick="window.openIconModal(this)" style="cursor:pointer; background:#fff;">
                <button type="button" class="btn btn-sm btn-outline" onclick="clearIconInput(this)" title="İkonu temizle"><i class="fa-solid fa-times"></i></button>
            </div>
        </td>
        <td><input type="color" class="form-control menu-color" value="#000000" style="padding: 2px; height: 35px; cursor:pointer;" title="Siyah renk varsayılan tema rengini kullanır"></td>
        <td>
            <button type="button" class="btn btn-sm btn-icon btn-delete" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button>
        </td>
    \`;
    tbody.appendChild(tr);
};

window.clearIconInput = function(btn) {
    const tr = btn.closest('td');
    tr.querySelector('.menu-icon').value = '';
    tr.querySelector('.icon-preview').innerHTML = '';
};

async function renderMenuConfigSettings(container) {
    container.innerHTML = '<div class="loader-spinner-creative" style="margin:50px auto;"></div>';
    
    try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        let menuItems = [];
        if(data.success && data.data) {
            menuItems = data.data;
        }
        
        container.innerHTML = \`
            <div class="card">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>Site Menüsü Yönetimi</h3>
                    <button class="btn btn-primary btn-sm" onclick="window.addMenuRow()">
                        <i class="fa-solid fa-plus"></i> Yeni Menü Ekle
                    </button>
                </div>
                <div class="card-body">
                    <p class="text-muted" style="margin-bottom: 20px;">Sol taraftan açılan site menüsündeki bağlantıları buradan yönetebilirsiniz. Menü rengini varsayılan (tema rengi) yapmak için rengi Siyah (#000000) bırakın.</p>
                    <div class="admin-table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Menü Adı</th>
                                    <th>URL Bağlantısı</th>
                                    <th>İkon (Opsiyonel)</th>
                                    <th>Metin Rengi</th>
                                    <th width="80">İşlem</th>
                                </tr>
                            </thead>
                            <tbody id="menu-tbody">
                                \${menuItems.map(item => \`
                                    <tr>
                                        <td><input type="text" class="form-control menu-text" value="\${item.text.replace(/"/g, '&quot;')}" required></td>
                                        <td><input type="text" class="form-control menu-url" value="\${item.url.replace(/"/g, '&quot;')}"></td>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:10px;">
                                                <div class="icon-preview" style="width: 24px; text-align:center;">
                                                    \${item.icon ? \`<svg class="i i-\${item.icon}" style="--i-size: 20px; color: #333;"><use href="/assets/svg-sprite.svg#\${item.icon}"/></svg>\` : ''}
                                                </div>
                                                <input type="text" class="form-control menu-icon" value="\${item.icon || ''}" readonly onclick="window.openIconModal(this)" style="cursor:pointer; background:#fff;" placeholder="İkon seç (Opsiyonel)">
                                                <button type="button" class="btn btn-sm btn-outline" onclick="clearIconInput(this)" title="İkonu temizle"><i class="fa-solid fa-times"></i></button>
                                            </div>
                                        </td>
                                        <td><input type="color" class="form-control menu-color" value="\${item.color || '#000000'}" style="padding: 2px; height: 35px; cursor:pointer;" title="Siyah renk varsayılan tema rengini kullanır"></td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-icon btn-delete" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top:20px; text-align:right;">
                        <button id="btn-save-menu" class="btn btn-primary" onclick="window.adminSaveMenu()">
                            <i class="fa-solid fa-save"></i> Değişiklikleri Kaydet
                        </button>
                    </div>
                </div>
            </div>
        \`;
    } catch(e) {
        container.innerHTML = '<div class="alert alert-danger">Menüler yüklenirken hata oluştu.</div>';
    }
}
`;

code += '\n' + menuJs;
fs.writeFileSync('admin.js', code);
console.log('admin.js updated for Menu Settings.');
