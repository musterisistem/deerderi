/**
 * Mail Gönderme Yardımcısı
 */

console.log('📧 Mail Helper Loaded');

window.sendOrderEmails = async function (orderData) {
    if (!orderData) {
        console.error('❌ Sipariş verisi eksik!');
        return;
    }

    console.log('📨 Sending emails for order:', orderData.orderNumber);

    try {
        // Ürün listesi formatı
        const products = Array.isArray(orderData.items) ? orderData.items.map(item => ({
            name: item.name || item.productName || 'Ürün',
            quantity: item.quantity || 1,
            price: (item.price || 0).toLocaleString('tr-TR'),
            image: item.image || item.productImage || ''
        })) : [];

        // Adres verisini güvenli şekilde al
        const addr = orderData.address || orderData.shippingAddress || {};

        const emailPayload = {
            orderNumber: orderData.orderNumber || orderData.id,
            orderDate: orderData.date || new Date().toLocaleDateString('tr-TR'),
            customerName: orderData.customerName || addr.title || 'Değerli Müşterimiz',
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone || addr.phone || '',
            paymentMethod: orderData.paymentMethod || 'Kredi Kartı',
            products: products,
            subtotal: (orderData.subtotal || 0).toLocaleString('tr-TR'),
            shipping: (orderData.shipping === 'door' ? 50 : 100).toLocaleString('tr-TR'),
            total: (orderData.total || 0).toLocaleString('tr-TR'),

            // Adres Bilgileri (Düzeltildi)
            deliveryName: orderData.customerName || '',
            deliveryAddress: addr.address || '',
            deliveryCity: addr.city || '',
            deliveryDistrict: addr.district || '',
            deliveryPhone: addr.phone || ''
        };

        // 1. Müşteri Maili
        fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'order-confirmation',
                to: orderData.customerEmail,
                data: emailPayload
            })
        }).then(r => console.log('✓ Customer email request sent', r.status))
            .catch(e => console.error('Customer email failed', e));

        // 2. Admin Maili (Paralel)
        const adminEmails = JSON.parse(localStorage.getItem('deerDeriAdminEmails') || '[]');
        if (adminEmails.length > 0) {
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin-notification',
                    to: adminEmails,
                    data: emailPayload
                })
            }).then(r => console.log('✓ Admin email request sent', r.status))
                .catch(e => console.error('Admin email failed', e));
        } else {
            console.warn('⚠️ No admin emails configured!');
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Mail gönderme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Hoşgeldin Maili Yardımcısı
window.sendWelcomeEmail = function (userData) {
    if (!userData || !userData.email) return;

    console.log('👋 Sending welcome email to:', userData.email);

    fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'welcome',
            to: userData.email,
            data: {
                customerName: userData.firstName + ' ' + userData.lastName
            }
        })
    }).then(r => console.log('✓ Welcome email sent', r.status))
        .catch(e => console.error('Welcome email failed', e));
};
