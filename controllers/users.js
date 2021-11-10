const User = require('../models/user');



module.exports.registerForm =  ( request, response ) => {
    response.render('users/register');
};

module.exports.register  = async ( request, response, next ) => {

    try {
        const { email, username, password } = request.body;
        const newUser = new User({ email, username });
        const registeredUser =  await User.register(newUser, password);
        request.logIn(registeredUser, err => {
            if (err) return next(err);

            request.flash('success', 'Thanks for register, enjoy the Yelp Camp ;)');
            //console.log(newUser)
            response.redirect('/campgrounds');
           
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
    request.flash('sucess', 'Session closed!!');
    response.redirect('/campgrounds');
}