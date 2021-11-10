const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

//https://res.cloudinary.com/cloudname/image/upload/v1635962883/YelpCamp/awugl3sex7ijg2awjsg7.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
});


ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_150');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    location: String,
    price: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'

    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts );

CampgroundSchema.virtual('properties.popUpMarkup').get( function () {
    return (`<strong><a href="/campgrounds/${this._id}" >${this.title}</a></strong>
    <p> ${this.description.substring(0, 20)}  . . . </p>`)
});

//after delete one campground this function will delete all reviews that
//were connected with that specific campground id
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    console.log(doc)
    if(doc){
        await review.deleteMany({
            _id:{
                $in: doc.reviews
            }
            
        })
    }
})

//exporting the variable CampgroundSchema as model ;)
module.exports = mongoose.model('Campground', CampgroundSchema);