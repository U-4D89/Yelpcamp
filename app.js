if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const port = process.argv[2];

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

//connecting with yelp-camp db
const MongoDBStore = require('connect-mongo')(session);
const databaseAtlas = process.env.DB_URL;
const databaseLocal = 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(databaseLocal, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTipology: true
});

//handling errors from db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!!!');
});

const app = express();

app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended:true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

//prevent mongo injection
app.use(mongoSanitize({
    replaceWith: '_'
}));


const secret = 'thisshouldbeabettersecret!';
// app.use(session({
//     secret: secret,
//     store: MongoStore.create({ mongoUrl: databaseLocal })
// }))
const store = new MongoDBStore ({
    url: databaseLocal,
    secret:'thisshouldbeabettersecret!',
    touchAfter: 24 * 60  * 60 //lazy udpate hours * minutes * seconds

});

store.on('error', function (e) {
    console.log('error store', e)
});


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  //not accesible for https, useful for localhost
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];

const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use( ( request, response, next ) => {
    console.log(request.session)
    response.locals.currentUser = request.user;
    response.locals.success = request.flash('success');
    response.locals.error = request.flash('error');
    next();
})


//          R O U T E S
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);


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