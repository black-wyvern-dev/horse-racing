const { registerUser } = require('../../methods/users')
const passport = require('passport');

function authController() {
    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req, res, next) {

            // here err, user, info is coming from passport.js where in done() function we have provided null, false/user , message
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message);
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }

                // when user exists and password matches then login the user using login method;
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message);
                        return next(err);
                    }
                    if (req.user.role == 'admin')
                        return res.redirect('/admin/orders');
                    else {
                        return res.redirect('/customer/orders');
                    }
                })
            })(req, res, next)
        },

        async postRegister(req, res) {
            const info = registerUser(req.body);
            req.flash('result', info.result);
            req.flash('error', info.error);
            res.redirect('/login');
        },

        logout(req, res) {
            req.logout();
            delete req.session.cart;
            return res.redirect('/');
        }
    }
}
module.exports = authController;