if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const port = process.argv[2];
const ExpressError = require('./utils/ExpressError');

//all required routes
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//forces put and delete methods
const methodOverride =  require('method-override');
app.use(methodOverride('_method'));

//for add some js code on html
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate); 


//session
const session = require('express-session');
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig));


//passport authentification 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash messages, define types of messages
const flash = require('connect-flash');
app.use(flash());
app.use( ( request, response, next ) => {
    console.log(request.session)
    response.locals.currentUser = request.user;
    response.locals.success = request.flash('success');
    response.locals.error = request.flash('error');
    next();
})

//paths for use in every place the folders views and public
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended:true }));

//connecting with yelp-camp db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTipology: true
};

//handling errors from db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!!!');
});

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);

app.get('/', (request, response) => {
    response.render('home');
})

app.all('*', (request, response, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use( (err, request, response, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong mate!'
    response.status(statusCode).render('error', { err }); 
})

app.listen(port, () => {
    console.log(` - - - Listen on ${port} port - - - `);
});