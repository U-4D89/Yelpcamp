const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');

module.exports.index =  async ( request, response ) => {
    const allCampgrounds = await Campground.find({})
    response.render('campgrounds/index.ejs', { allCampgrounds })

};


module.exports.renderNewForm = (request, response ) => {
    response.render('campgrounds/new');
};

module.exports.createCampground = async ( request, response, next ) => {
    const geoData = await geocoder.forwardGeocode({
        query: request.body.campground.location,
        limit: 1
    }).send()
    
    const campground = new Campground(request.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = request.files.map( f => ({ url: f.path, filename: f.filename }));
    campground.author = request.user._id;
    await campground.save();
    console.log(campground)
    request.flash('success', 'Successfully made a new campground!! ')
    response.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showCampground = async ( request, response ) => {
    //nested population for make that every review has own author and each campground has an author
    const campground = await Campground.findById(request.params.id).populate({
        path: 'reviews',
        populate: {
            path:'author'
        }
        }).populate('author');
    if(!campground){
        request.flash('error', 'That campground does not exist :(')
        return response.redirect('/campgrounds')
    }
    response.render('campgrounds/details' , { campground });
};

module.exports.editCampground = async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findById(id);
    if(!campground){
        request.flash('error', 'That campground does not exist :(')
        return response.redirect('/campgrounds')
    }

    response.render('campgrounds/edit' , { campground });
};

module.exports.updateCampground = async (request, response) => {
    const { id } = request.params;
    //console.log('ID CAMPGROUND!!', id)
    const campground = await Campground.findByIdAndUpdate(id, { ...request.body.campground });
    const imgs = request.files.map( f => ({ url: f.path, filename: f.filename }))
    campground.images.push( ...imgs );
    campground.save();
    if (request.body.deleteImages) {
        for ( let filename of request.body.deleteImages ){
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: request.body.deleteImages} }  } })
        console.log(campground)
    }
    request.flash('success', 'Successfully updated campground!! ');
    response.redirect(`/campgrounds/${campground._id}`);

};

module.exports.deleteCampground = async (request, response) => {
    const newCampground = await Campground.findByIdAndDelete(request.params.id);
    console.log(`/campgrounds/:id   deleting the ${request.params.id} id object. . .`);
    request.flash('success', 'Campground deleted without problems!!')
    response.redirect('/campgrounds')
};