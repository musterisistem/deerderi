const dbConnect = require('../../lib/db');
const User = require('../../models/User');
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = async (req, res) => {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        await dbConnect();

        const { name, email, password, phone, tcId } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: 'Eksik bilgi.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashPassword(password),
            phone,
            tcId
        });

        res.status(200).json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ success: false, error: 'Kayıt işlemi sırasında bir hata oluştu.' });
    }
};
