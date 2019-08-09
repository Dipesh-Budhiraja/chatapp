'use strict';

module.exports = function(){
    return {
        SignUpValidation: function(req, res, next){
            req.checkBody('username', 'Username is Required').notEmpty();
            req.checkBody('username', 'Username Must not be less than 5').isLength({min: 5});
            req.checkBody('email', 'Email is Required').notEmpty();
            req.checkBody('email', 'Email is Invalid').isEmail();
            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});

            req.getValidationResult()
            .then((result) => {
                const errors = result.array();
                const messages = [];
                errors.forEach(function(error){
                    messages.push(error.msg);
                });

                req.flash('error', messages);
                res.redirect('/signup');
            })
            .catch((err) => {
                return next();
            })
        },

        LoginValidation: function(req, res, next){
            req.checkBody('email', 'Email is Required').notEmpty();
            req.checkBody('email', 'Email is Invalid').isEmail();
            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});

            req.getValidationResult()
            .then((result) => {
                const errors = result.array();
                const messages = [];
                errors.forEach(function(error){
                    messages.push(error.msg);
                });

                req.flash('error', messages);
                res.redirect('/');
            })
            .catch((err) => {
                return next();
            })
        }
    }
}