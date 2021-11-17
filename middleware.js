const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = ( request, response, next ) => {
    //request.user
    if(!request.isAuthenticated()) {
        request.session.returnTo = request.originalUrl;
        request.flash('error', 'You must be signed in.');
        response.redirect('/login');
    }
    next();
}

module.exports.validateCampground = ( request, response, next ) => {
  
    const { error } = campgroundSchema.validate(request.body);
    if (error){
        const msg = error.details.map( el => el.message ).join(',');
        const msgSlice = (msg.slice(12));
        const finalMsg = (`"${msgSlice}.`);
        throw new ExpressError(finalMsg, 400);
    } else {
        next();
    }
}


module.exports.isAuthor = async ( request, response, next ) => {
    const { id } = request.params; 
    const campground = await Campground.findById(id);
    if (!campground.author.equals(request.user._id)) {
        request.flash('error', 'You are not the owner of this camp, denied permission!!');
        return response.redirect(`/campgrounds/${id}`);
    }
    next();

}


module.exports.validateReview = ( request, response, next ) => {
    const { error } = reviewSchema.validate(request.body);
    //console.log(request.body)
    if (error) {
        const msg = error.details.map( el => el.message ).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


module.exports.isReviewAuthor = async ( request, response, next ) => {
    const { id, reviewId } = request.params; 
    const review = await Review.findById(reviewId);
    if (!review.author.equals(request.user._id)) {
        request.flash('error', 'You are not the owner of this camp, denied permission!!');
        return response.redirect(`/campgrounds/${id}`);
    }
    next();

}