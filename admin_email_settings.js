// Mail Settings Management
window.renderEmailSettings = function (container) {
    // Load admin emails from localStorage
    const adminEmails = JSON.parse(localStorage.getItem('deerDeriAdminEmails') || '[]');

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Sipariş Bildirimi E-posta Adresleri</h3>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">
                    Siteye gelen siparişler için bildirim almak istediğiniz e-posta adreslerini ekleyin.
                </p>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label>Yeni E-posta Adresi Ekle</label>
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <input type="email" id="new-admin-email" class="form-control" 
                               placeholder="ornek@mail.com" style="flex: 1;">
                        <button class="btn btn-primary" onclick="window.addAdminEmail()">
                            <i class="fa-solid fa-plus"></i> Ekle
                        </button>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 16px; margin-bottom: 15px;">
                        Kayıtlı E-posta Adresleri (${adminEmails.length})
                    </h4>
                    <div id="admin-emails-list" style="display: flex; flex-direction: column; gap: 10px;">
                        ${adminEmails.length === 0 ?
            '<p style="color: #999;">Henüz e-posta adresi eklenmemiş.</p>' :
            adminEmails.map((email, index) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; 
                                            background: #f9f9f9; padding: 12px 15px; border-radius: 6px; border-left: 3px solid var(--primary-color);">
                                    <span style="font-size: 14px; color: #333;">
                                        <i class="fa-solid fa-envelope" style="color: var(--primary-color); margin-right: 8px;"></i>
                                        ${email}
                                    </span>
                                    <button class="btn btn-sm btn-icon btn-delete" onclick="window.removeAdminEmail(${index})">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')
        }
                    </div>
                </div>

                <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; border-radius: 6px; margin-top: 20px;">
                    <h4 style="font-size: 14px; color: #1565c0; margin-bottom: 10px;">
                        <i class="fa-solid fa-paper-plane"></i> Test E-postası Gönder
                    </h4>
                    <p style="font-size: 13px; color: #666; margin-bottom: 10px;">
                        Mail sisteminin çalışıp çalışmadığını test etmek için bir deneme maili gönderin.
                    </p>
                    <button class="btn btn-info btn-sm" onclick="window.sendTestEmail()">
                        <i class="fa-solid fa-flask"></i> Test Maili Gönder
                    </button>
                </div>
            </div>
        </div>
    `;
};

window.addAdminEmail = function () {
    const input = document.getElementById('new-admin-email');
    const email = input.value.trim();

    if (!email) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Geçersiz e-posta formatı.');
        return;
    }

    // Load existing emails
    const adminEmails = JSON.parse(localStorage.getItem('deerDeriAdminEmails') || '[]');

    // Check if already exists
    if (adminEmails.includes(email)) {
        alert('Bu e-posta adresi zaten ekli.');
        return;
    }

    // Add new email
    adminEmails.push(email);
    localStorage.setItem('deerDeriAdminEmails', JSON.stringify(adminEmails));

    console.log('✅ Email added to localStorage:', email);
    console.log('Total emails:', adminEmails);

    // Clear input
    input.value = '';

    // Refresh the view
    const contentArea = document.getElementById('content-area');
    if (contentArea && typeof window.renderEmailSettings === 'function') {
        window.renderEmailSettings(contentArea);
        if (typeof window.showToast === 'function') {
            window.showToast('E-posta adresi başarıyla eklendi.', 'success');
        } else {
            alert('E-posta adresi başarıyla eklendi.');
        }
    }
};


window.removeAdminEmail = function (index) {
    if (!confirm('Bu e-posta adresini silmek istediğinize emin misiniz?')) {
        return;
    }

    const adminEmails = JSON.parse(localStorage.getItem('deerDeriAdminEmails') || '[]');
    adminEmails.splice(index, 1);
    localStorage.setItem('deerDeriAdminEmails', JSON.stringify(adminEmails));

    console.log('✅ Email removed from localStorage');
    console.log('Remaining emails:', adminEmails);

    // Refresh the view
    const contentArea = document.getElementById('content-area');
    if (contentArea && typeof window.renderEmailSettings === 'function') {
        window.renderEmailSettings(contentArea);
        if (typeof window.showToast === 'function') {
            window.showToast('E-posta adresi silindi.', 'success');
        } else {
            alert('E-posta adresi silindi.');
        }
    }
};

window.sendTestEmail = async function () {
    const adminEmails = JSON.parse(localStorage.getItem('deerDeriAdminEmails') || '[]');

    if (adminEmails.length === 0) {
        alert('Test maili göndermek için önce bir e-posta adresi ekleyin.');
        return;
    }

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'admin-notification',
                to: adminEmails,
                data: {
                    orderNumber: 'TEST-' + Date.now(),
                    orderDate: new Date().toLocaleDateString('tr-TR'),
                    customerName: 'Test Müşteri',
                    customerEmail: 'test@example.com',
                    customerPhone: '0555 123 45 67',
                    products: [
                        { name: 'Test Ürün', quantity: 1, price: '1.000' }
                    ],
                    total: '1.000',
                    deliveryName: 'Test Müşteri',
                    deliveryAddress: 'Test Adres',
                    deliveryCity: 'İstanbul',
                    deliveryDistrict: 'Kadıköy',
                    deliveryPhone: '0555 123 45 67'
                }
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Test maili başarıyla gönderildi! Gelen kutunuzu kontrol edin.');
        } else {
            throw new Error(result.error || 'Mail gönderilemedi');
        }
    } catch (err) {
        console.error('Test mail error:', err);
        alert('Test maili gönderilemedi: ' + err.message + '\n\nResend API key yapılandırmasını kontrol edin (.env dosyası).');
    }
};
