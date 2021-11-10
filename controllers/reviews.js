const Campground = require('../models/campground')
const Review = require('../models/review');

module.exports.createReview = async ( request, response ) => {
   
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    campground.reviews.push(review);
    review.author = request.user._id;
    await review.save();
    await campground.save();
    request.flash('success', 'Your new review was created!!');
    response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async ( request, response ) => {
    
    const { id, reviewId } = request.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    request.flash('success', 'Review deleted without problems!!')
    response.redirect(`/campgrounds/${id}`)

};


