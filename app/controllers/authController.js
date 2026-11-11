const { Admin } = require('../models/index');

exports.getLogin = (req, res) => {
    if (req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        message: res.locals.error && res.locals.error.length > 0 ? res.locals.error[0] : null
    });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            req.flash('error', 'User tidak tersedia');
            return req.session.save(() => res.redirect('/admin/login'));
        }

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            req.flash('error', 'Password salah');
            return req.session.save(() => res.redirect('/admin/login'));
        }

        req.session.adminId = admin._id.toString();
        req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            res.redirect('/admin/dashboard');
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Terjadi kesalahan server');
        req.session.save(() => res.redirect('/admin/login'));
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/admin/login');
    });
};
