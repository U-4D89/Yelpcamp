const User = require('../models/user');



module.exports.registerForm =  ( request, response ) => {
    response.render('users/register');
};

module.exports.register  = async ( request, response, next ) => {

    try {
        const { email, username, password } = request.body;
        const emailPattern = /^[^ ]+@[^]+\.[a-z]{2,3}$/;
        const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        
        if ( !email.match(emailPattern)) {
            request.flash('error', 'Invalid email.');
            response.redirect('/register');
        }

        if (!password.match(passwordPattern) || !password.length > 8) {
            request.flash('error', 'Invalid password.');
            response.redirect('/register');
        }

        const newUser = new User({ email, username });
        const registeredUser =  await User.register(newUser, password);

        request.logIn(registeredUser, err => {
            if (err) return next(err);


            request.flash('success', 'Thanks for register, enjoy the Yelp Camp ;)');
            // console.log(newUser)
            response.redirect('/campgrounds');
            console.log('SUCCESS!')
           
        });

       
    } catch (e) {
        request.flash('error', e.message);
        response.redirect('/register');
    }
   
};

module.exports.loginForm =  ( request, response ) => {
    response.render('users/login');
};

module.exports.logIn = ( request, response ) => {
    request.flash('success', 'Welcome back!!');
    const redirectUrl = request.session.returnTo || '/campgrounds';
    delete request.returnTo;
    response.redirect(redirectUrl);
};

module.exports.logOut = ( request, response ) => {
    request.logOut();
    request.flash('success', 'Session closed!!');
    console.log('SUCCESS')
    response.redirect('/campgrounds');
}