const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const passport = require('passport');

router.route('/register')
    .get(users.registerForm)
    .post(catchAsync( users.register))

router.route('/login')
    .get( users.loginForm)
    .post(  passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.logIn);


router.get('/logout', users.logOut);

module.exports = router;