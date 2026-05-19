const fs = require('fs');
let code = fs.readFileSync('admin.js', 'utf8');

const newCode = `
// ==========================================
// ICON SELECTOR MODAL
// ==========================================
let meteorIconsList = [];
let currentIconInputTarget = null;

async function loadMeteorIcons() {
    if (meteorIconsList.length > 0) return;
    try {
        const res = await fetch('/assets/meteor-icons.json');
        meteorIconsList = await res.json();
    } catch (e) {
        console.error('İkonlar yüklenemedi', e);
    }
}

window.openIconModal = async function(inputElement) {
    currentIconInputTarget = inputElement;
    const modal = document.getElementById('icon-modal');
    modal.style.display = 'block';
    
    await loadMeteorIcons();
    renderIconGrid(meteorIconsList);
    
    document.getElementById('icon-search').value = '';
    document.getElementById('icon-search').focus();
};

document.getElementById('icon-search')?.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = meteorIconsList.filter(icon => icon.includes(val));
    renderIconGrid(filtered);
});

document.querySelector('.close-icon-modal')?.addEventListener('click', () => {
    document.getElementById('icon-modal').style.display = 'none';
});

function renderIconGrid(icons) {
    const grid = document.getElementById('icon-grid');
    if (!grid) return;
    if (icons.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;">İkon bulunamadı.</div>';
        return;
    }
    
    grid.innerHTML = icons.map(icon => \`
        <div class="icon-item" onclick="selectIcon('\${icon}')" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; border:1px solid transparent; border-radius:5px; transition:0.2s;" onmouseover="this.style.background='#eee'; this.style.borderColor='#ccc'" onmouseout="this.style.background='transparent'; this.style.borderColor='transparent'" title="\${icon}">
            <svg class="i i-\${icon}" style="--i-size: 24px; color: #333;"><use href="/assets/svg-sprite.svg#\${icon}"/></svg>
        </div>
    \`).join('');
}

window.selectIcon = function(iconName) {
    if (currentIconInputTarget) {
        currentIconInputTarget.value = iconName;
        // Update the preview
        const previewWrap = currentIconInputTarget.parentElement.querySelector('.icon-preview');
        if (previewWrap) {
            previewWrap.innerHTML = \`<svg class="i i-\${iconName}" style="--i-size: 20px; color: #333;"><use href="/assets/svg-sprite.svg#\${iconName}"/></svg>\`;
        }
    }
    document.getElementById('icon-modal').style.display = 'none';
};

// ==========================================
// CAMPAIGN MANAGEMENT
// ==========================================
window.adminSaveCampaigns = async function() {
    const btn = document.getElementById('btn-save-campaigns');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...';
    btn.disabled = true;

    try {
        const rows = document.querySelectorAll('#campaigns-tbody tr');
        let campaigns = [];
        
        rows.forEach((row, index) => {
            const text = row.querySelector('.camp-text').value;
            const icon = row.querySelector('.camp-icon').value;
            const color = row.querySelector('.camp-color').value;
            const link = row.querySelector('.camp-link').value || '#';
            
            if(text) {
                campaigns.push({
                    id: index + 1,
                    text: text,
                    icon: icon,
                    color: color,
                    link: link
                });
            }
        });

        if(campaigns.length > 6) {
            alert('En fazla 6 adet kampanya ekleyebilirsiniz.');
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Değişiklikleri Kaydet';
            btn.disabled = false;
            return;
        }

        const res = await fetch('/api/admin/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaigns })
        });
        
        const data = await res.json();
        if(data.success) {
            alert('Kayan kampanyalar başarıyla kaydedildi! Web sitesinde anlık olarak güncellenecektir.');
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

window.addCampaignRow = function() {
    const tbody = document.getElementById('campaigns-tbody');
    const rowCount = tbody.querySelectorAll('tr').length;
    if(rowCount >= 6) {
        alert('En fazla 6 kampanya ekleyebilirsiniz.');
        return;
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = \`
        <td><input type="text" class="form-control camp-text" placeholder="Kampanya metni" required></td>
        <td>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="icon-preview" style="width: 24px; text-align:center;">
                    <svg class="i i-gift" style="--i-size: 20px; color: #333;"><use href="/assets/svg-sprite.svg#gift"/></svg>
                </div>
                <input type="text" class="form-control camp-icon" placeholder="gift" value="gift" readonly onclick="window.openIconModal(this)" style="cursor:pointer; background:#fff;">
            </div>
        </td>
        <td><input type="color" class="form-control camp-color" value="#000000" style="padding: 2px; height: 35px; cursor:pointer;"></td>
        <td><input type="text" class="form-control camp-link" placeholder="https://..." value="#"></td>
        <td>
            <button type="button" class="btn btn-sm btn-icon btn-delete" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button>
        </td>
    \`;
    tbody.appendChild(tr);
};

async function renderCampaignSettings(container) {
    container.innerHTML = '<div class="loader-spinner-creative" style="margin:50px auto;"></div>';
    
    try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        let campaigns = [];
        if(data.success && data.data) {
            campaigns = data.data;
        }
        
        container.innerHTML = \`
            <div class="card">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>Kayan Kampanyalar (Marquee)</h3>
                    <button class="btn btn-primary btn-sm" onclick="window.addCampaignRow()">
                        <i class="fa-solid fa-plus"></i> Yeni Ekle
                    </button>
                </div>
                <div class="card-body">
                    <p class="text-muted" style="margin-bottom: 20px;">Sitenin en üstünde kayan kampanya yazılarını buradan yönetebilirsiniz. En fazla 6 adet ekleyebilirsiniz. İkon seçmek için ikon ismine tıklayın. Değişiklikler anında web sitesine yansır.</p>
                    <div class="admin-table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Kampanya Metni</th>
                                    <th>İkon Seçimi</th>
                                    <th>Renk</th>
                                    <th>Bağlantı (Link)</th>
                                    <th width="80">İşlem</th>
                                </tr>
                            </thead>
                            <tbody id="campaigns-tbody">
                                \${campaigns.map(camp => {
                                    // Remove fa-solid if it was saved before this update
                                    let iconName = camp.icon.replace('fa-', '').replace('solid ', '').replace('fa ', '').trim();
                                    return \`
                                    <tr>
                                        <td><input type="text" class="form-control camp-text" value="\${camp.text.replace(/"/g, '&quot;')}" required></td>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:10px;">
                                                <div class="icon-preview" style="width: 24px; text-align:center;">
                                                    <svg class="i i-\${iconName}" style="--i-size: 20px; color: #333;"><use href="/assets/svg-sprite.svg#\${iconName}"/></svg>
                                                </div>
                                                <input type="text" class="form-control camp-icon" value="\${iconName}" readonly onclick="window.openIconModal(this)" style="cursor:pointer; background:#fff;" placeholder="İkon seç...">
                                            </div>
                                        </td>
                                        <td><input type="color" class="form-control camp-color" value="\${camp.color}" style="padding: 2px; height: 35px; cursor:pointer;"></td>
                                        <td><input type="text" class="form-control camp-link" value="\${camp.link.replace(/"/g, '&quot;')}"></td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-icon btn-delete" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                \`}).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top:20px; text-align:right;">
                        <button id="btn-save-campaigns" class="btn btn-primary" onclick="window.adminSaveCampaigns()">
                            <i class="fa-solid fa-save"></i> Değişiklikleri Kaydet
                        </button>
                    </div>
                </div>
            </div>
        \`;
    } catch(e) {
        container.innerHTML = '<div class="alert alert-danger">Kampanyalar yüklenirken hata oluştu.</div>';
    }
}
`;

// Replace from // ==========================================
// CAMPAIGN MANAGEMENT to the end
const replaceStart = '// ==========================================\r\n// CAMPAIGN MANAGEMENT';
let splitCode = code.split(replaceStart);
if(splitCode.length === 1) {
    splitCode = code.split('// ==========================================\n// CAMPAIGN MANAGEMENT');
}
if(splitCode.length > 1) {
    code = splitCode[0] + newCode;
    fs.writeFileSync('admin.js', code);
    console.log('admin.js updated.');
} else {
    console.log('Could not find campaign management block');
}
