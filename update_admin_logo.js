const fs = require('fs');
let code = fs.readFileSync('admin.js', 'utf8');

// Update view mapping
code = code.replace(
    "'campaigns': 'Kayan Kampanyalar'",
    "'campaigns': 'Kayan Kampanyalar',\n            'logo-settings': 'Site Logosu'"
);

// Update switch case
code = code.replace(
    "case 'campaigns':",
    "case 'logo-settings':\n                renderLogoSettings(contentArea);\n                break;\n            case 'campaigns':"
);

// Add logo component
const logoComponentCode = `
// ==========================================
// LOGO MANAGEMENT
// ==========================================
function renderLogoSettings(container) {
    container.innerHTML = \`
        <div class="card">
            <div class="card-header">
                <h3>Site Logosu Yönetimi</h3>
            </div>
            <div class="card-body">
                <p class="text-muted" style="margin-bottom: 20px;">Sitenin sol üst köşesinde yer alan mevcut logoyu değiştirebilirsiniz. Yeni logo yüklediğinizde anında siteye yansıyacaktır.</p>
                
                <div style="display:flex; gap: 30px; align-items:flex-start; flex-wrap:wrap;">
                    <!-- Mevcut Logo -->
                    <div style="flex:1; min-width:300px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align:center; background:#f9f9f9;">
                        <h4 style="margin-bottom:15px; font-size:14px; color:#555;">Mevcut Logo</h4>
                        <div style="background:#fff; padding:20px; border-radius:5px; border:1px dashed #ccc; display:inline-block; margin-bottom: 15px; width: 100%; box-sizing:border-box;">
                            <img id="current-site-logo" src="/assets/logo.png?v=\${Date.now()}" style="max-height: 80px; max-width: 100%; object-fit:contain;" alt="Site Logosu">
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline btn-delete" onclick="document.getElementById('current-site-logo').src=''" style="color:var(--danger-color); border-color:var(--danger-color);">
                                <i class="fa-solid fa-trash"></i> Logoyu Kaldır
                            </button>
                        </div>
                    </div>
                    
                    <!-- Yeni Logo Yükle -->
                    <div style="flex:1; min-width:300px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align:center; border-style: dashed; border-width: 2px;" id="logo-dropzone">
                        <h4 style="margin-bottom:15px; font-size:14px; color:#555;">Yeni Logo Yükle (Sürükle & Bırak)</h4>
                        
                        <div style="padding: 40px 20px; cursor:pointer;" onclick="document.getElementById('logo-upload-input').click()">
                            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 40px; color: #ccc; margin-bottom:15px;"></i>
                            <p style="color: #666; font-size: 14px;">Görseli buraya sürükleyin veya <strong>dosya seçmek için tıklayın</strong></p>
                            <p style="color: #999; font-size: 12px; margin-top:5px;">Önerilen format: PNG (Şeffaf arkaplan)</p>
                            <input type="file" id="logo-upload-input" accept="image/png, image/jpeg, image/svg+xml" style="display:none;" onchange="handleLogoSelect(this)">
                        </div>
                        
                        <div id="logo-preview-area" style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid #eee;">
                            <p style="font-size:12px; color:#666; margin-bottom:10px;">Önizleme:</p>
                            <img id="logo-preview-img" src="" style="max-height: 60px; max-width:100%; margin-bottom:15px;">
                            <div>
                                <button class="btn btn-primary" id="btn-save-logo" onclick="uploadNewLogo()">
                                    <i class="fa-solid fa-save"></i> Logoyu Kaydet ve Uygula
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    \`;

    // Sürükle bırak olayları
    setTimeout(() => {
        const dropzone = document.getElementById('logo-dropzone');
        if(!dropzone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.style.borderColor = 'var(--primary-color)';
                dropzone.style.backgroundColor = 'rgba(0,0,0,0.02)';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.style.borderColor = '#ddd';
                dropzone.style.backgroundColor = 'transparent';
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                document.getElementById('logo-upload-input').files = files;
                handleLogoSelect(document.getElementById('logo-upload-input'));
            }
        }, false);
    }, 100);
}

let selectedLogoBase64 = null;

window.handleLogoSelect = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedLogoBase64 = e.target.result;
            document.getElementById('logo-preview-img').src = selectedLogoBase64;
            document.getElementById('logo-preview-area').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.uploadNewLogo = async function() {
    if (!selectedLogoBase64) return;
    
    const btn = document.getElementById('btn-save-logo');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/admin/logo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: selectedLogoBase64 })
        });

        const data = await res.json();
        if (data.success) {
            // Update the preview
            document.getElementById('current-site-logo').src = data.url;
            document.getElementById('logo-preview-area').style.display = 'none';
            selectedLogoBase64 = null;
            document.getElementById('logo-upload-input').value = '';
            
            // Show alert
            alert('Logo başarıyla güncellendi! Siteye yansıdı.');
        } else {
            alert('Logo yüklenirken bir hata oluştu: ' + (data.error || 'Bilinmeyen hata'));
        }
    } catch(err) {
        console.error(err);
        alert('Sunucuya bağlanılamadı.');
    }
    
    btn.innerHTML = originalText;
    btn.disabled = false;
};
`;

code += '\n' + logoComponentCode;
fs.writeFileSync('admin.js', code);
console.log('admin.js updated for Logo settings.');
