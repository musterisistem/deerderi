const fs = require('fs');
let code = fs.readFileSync('admin.js', 'utf8');

// Remove old SITE MENU MANAGEMENT block entirely
const menuStart = code.indexOf('// ==========================================\n// SITE MENU MANAGEMENT');
if (menuStart === -1) {
    console.log('ERROR: Could not find menu section');
    process.exit(1);
}
code = code.substring(0, menuStart);

// New menu management code with animation toggle
const menuJs = `// ==========================================
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
            const animated = row.querySelector('.menu-animated').checked;
            
            if(text) {
                menuItems.push({
                    id: index + 1,
                    text: text,
                    url: url,
                    icon: icon,
                    color: color === '#000000' ? '' : color,
                    animated: icon ? animated : false
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
    tr.innerHTML = buildMenuRow({ text: '', url: '#', icon: '', color: '#000000', animated: false });
    tbody.appendChild(tr);
};

window.clearMenuIcon = function(btn) {
    const td = btn.closest('td');
    td.querySelector('.menu-icon').value = '';
    td.querySelector('.icon-preview').innerHTML = '';
    td.querySelector('.menu-icon').placeholder = 'İkon seç (Opsiyonel)';
};

function buildMenuRow(item) {
    const color = item.color || '#000000';
    const animated = item.animated ? 'checked' : '';
    const iconPreview = item.icon
        ? \`<svg class="i i-\${item.icon}" style="--i-size: 20px; color: #333;"><use href="/assets/svg-sprite.svg#\${item.icon}"/></svg>\`
        : '';
    
    return \`
        <tr>
            <td><input type="text" class="form-control menu-text" value="\${(item.text || '').replace(/"/g, '&quot;')}" required placeholder="Menü Adı"></td>
            <td><input type="text" class="form-control menu-url" value="\${(item.url || '#').replace(/"/g, '&quot;')}" placeholder="/kategori/..."></td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="icon-preview" style="width:24px; text-align:center;">\${iconPreview}</div>
                    <input type="text" class="form-control menu-icon" value="\${item.icon || ''}" readonly onclick="window.openIconModal(this)" style="cursor:pointer; background:#fff; flex:1;" placeholder="Seçmek için tıkla">
                    <button type="button" class="btn btn-sm btn-outline" onclick="window.clearMenuIcon(this)" title="İkonu temizle" style="padding: 4px 8px;"><i class="fa-solid fa-times"></i></button>
                </div>
            </td>
            <td>
                <label class="anim-toggle-wrap" title="İkon yanıp sönme animasyonu (icon seçiliyken aktif)">
                    <input type="checkbox" class="menu-animated" \${animated} onchange="updateAnimPreview(this)">
                    <span class="anim-toggle-label">Animasyon</span>
                    <span class="anim-demo \${item.animated && item.icon ? 'is-animated' : ''}" id="anim-demo-">
                        \${item.icon ? \`<svg class="i i-\${item.icon}" style="--i-size:14px; color: \${item.color || '#555'};"><use href="/assets/svg-sprite.svg#\${item.icon}"/></svg>\` : '<i class="fa-solid fa-bolt" style="font-size:12px; color:#ccc;"></i>'}
                    </span>
                </label>
            </td>
            <td><input type="color" class="form-control menu-color" value="\${color}" style="padding: 2px; height: 35px; cursor:pointer;" title="Siyah = varsayılan tema rengi"></td>
            <td>
                <button type="button" class="btn btn-sm btn-icon btn-delete" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    \`;
}

window.updateAnimPreview = function(checkbox) {
    const tr = checkbox.closest('tr');
    const demo = tr.querySelector('.anim-demo');
    if(checkbox.checked) {
        demo.classList.add('is-animated');
    } else {
        demo.classList.remove('is-animated');
    }
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
                    <p class="text-muted" style="margin-bottom: 20px;">Sol taraftan açılan site menüsündeki bağlantıları yönetin. İkon seçmek için ilgili alana tıklayın. <strong>Animasyon</strong> aktif ise ikon menüde yavaşça yanıp söner. Siyah renk = tema varsayılan rengi.</p>
                    <div class="admin-table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Menü Adı</th>
                                    <th>URL</th>
                                    <th>İkon</th>
                                    <th>Animasyon</th>
                                    <th>Renk</th>
                                    <th width="60">Sil</th>
                                </tr>
                            </thead>
                            <tbody id="menu-tbody">
                                \${menuItems.map(item => buildMenuRow(item)).join('')}
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

code += menuJs;
fs.writeFileSync('admin.js', code);
console.log('admin.js updated with animated menu support.');
