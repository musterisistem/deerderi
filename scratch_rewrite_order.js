const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// We need to rewrite handleCreateOrder and handleGetOrder to support a local fallback if dbConnected is false.

const oldCreateOrderRegex = /\/\/ ---- POST \/api\/orders ----[\s\S]*?\/\/ ---- GET \/api\/orders\/:orderNumber ----/;
const newCreateOrder = `// ---- POST /api/orders ----
async function handleCreateOrder(request, response) {
    try {
        const body = await parseBody(request);

        // Basic validation
        if (!body.customer || !body.customer.name || !body.customer.email) {
            return sendJSON(response, 400, { error: 'Müşteri adı ve e-posta zorunludur' });
        }
        if (!body.shippingAddress) {
            return sendJSON(response, 400, { error: 'Teslimat adresi zorunludur' });
        }
        if (!body.items || body.items.length === 0) {
            return sendJSON(response, 400, { error: 'Sepet boş' });
        }

        let subtotal = 0;
        const validatedItems = [];

        // Validate items
        for (const item of body.items) {
            let price = item.price;
            let product = null;
            if (dbConnected && Product) {
                product = await Product.findById(item.productId).catch(() => null);
                if (product) {
                    if (product.stock < item.quantity) {
                        return sendJSON(response, 400, { error: \`"\${product.name}" ürünü yeterli stokta yok\` });
                    }
                    price = product.discountPrice || product.price;
                }
            }
            validatedItems.push({
                productId: product ? product._id : (item.productId || ''),
                name: product ? product.name : item.name,
                price,
                quantity: item.quantity || 1,
                image: product ? (product.mainImage || (product.images && product.images[0] ? product.images[0].url : '')) : (item.image || ''),
                slug: product ? product.slug : (item.slug || ''),
            });
            subtotal += price * (item.quantity || 1);
        }

        // Shipping cost
        let shippingCost = 100; // default standard
        const freeShippingThreshold = 2000;
        if (body.shippingMethod === 'express') {
            shippingCost = 200;
        } else if (subtotal >= freeShippingThreshold) {
            shippingCost = 0;
        }

        const total = subtotal + shippingCost;
        const orderNumber = 'DR' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

        const orderData = {
            orderNumber,
            customer: body.customer,
            shippingAddress: body.shippingAddress,
            billingAddress: body.billingAddress || body.shippingAddress,
            items: validatedItems,
            subtotal,
            shippingCost,
            total,
            paymentMethod: body.paymentMethod || 'creditCard',
            paymentStatus: 'pending',
            shippingMethod: body.shippingMethod || 'standard',
            notes: body.notes || '',
            createdAt: new Date().toISOString()
        };

        if (dbConnected && Order) {
            const order = new Order(orderData);
            await order.save();
            
            // Decrease stock
            for (const item of validatedItems) {
                if (item.productId && Product) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
                }
            }
        } else {
            // Local fallback
            let localOrders = [];
            if (fs.existsSync('./local_orders.json')) {
                localOrders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
            }
            orderData._id = orderNumber;
            localOrders.push(orderData);
            fs.writeFileSync('./local_orders.json', JSON.stringify(localOrders, null, 2));
        }

        sendJSON(response, 201, {
            success: true,
            data: {
                orderNumber: orderNumber,
                _id: orderData._id || orderNumber,
                total: total,
                createdAt: orderData.createdAt,
            }
        });
    } catch (err) {
        console.error('POST /api/orders error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- GET /api/orders/:orderNumber ----`;

const oldGetOrderRegex = /\/\/ ---- GET \/api\/orders\/:orderNumber ----[\s\S]*?\/\/ ---- POST \/api\/coupons\/validate ----/;
const newGetOrder = `// ---- GET /api/orders/:orderNumber ----
async function handleGetOrder(orderNumber, response) {
    try {
        let order = null;
        if (dbConnected && Order) {
            order = await Order.findOne({ orderNumber });
        } else {
            if (fs.existsSync('./local_orders.json')) {
                const localOrders = JSON.parse(fs.readFileSync('./local_orders.json', 'utf8'));
                order = localOrders.find(o => o.orderNumber === orderNumber);
            }
        }

        if (!order) return sendJSON(response, 404, { error: 'Sipariş bulunamadı' });
        sendJSON(response, 200, { success: true, data: order });
    } catch (err) {
        console.error('GET /api/orders/:id error:', err);
        sendJSON(response, 500, { error: err.message });
    }
}

// ---- POST /api/coupons/validate ----`;

if (code.match(oldCreateOrderRegex) && code.match(oldGetOrderRegex)) {
    code = code.replace(oldCreateOrderRegex, newCreateOrder);
    code = code.replace(oldGetOrderRegex, newGetOrder);
    fs.writeFileSync('server.js', code, 'utf8');
    console.log('Order functions rewritten successfully for offline fallback.');
} else {
    console.error('Regex match failed.');
}
