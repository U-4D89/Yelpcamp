
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedsHelpers')
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTipology: true
};

//handling errors
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!!!');
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const randomPlace = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 20);
        const camp = new Campground({
            author: '618be0bd9cdb98fed0ad9e3c',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomPlace].city}, ${cities[randomPlace].state}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, qui suscipit dolorum dignissimos alias amet vero nulla quod nihil repellat unde vitae dolorem! Culpa, ad doloribus! Cum beatae labore blanditiis!',
            price: randomPrice,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randomPlace].longitude,
                    cities[randomPlace].latitude
                ]

            },
            images:[
                {
                    url: 'https://res.cloudinary.com/dyeomdani/image/upload/v1635959253/YelpCamp/camp2_lgau0p.jpg',
                    filename: 'Campground1'
                },
                {
                    url: 'https://res.cloudinary.com/dyeomdani/image/upload/v1635959477/YelpCamp/grandteton_julswc.jpg',
                    filename: 'Campground2'
                }
            ]
        })

        await camp.save();
    }
}

console.log(Campground.location)

seedDB().then(() => {
    console.log('Database disconnected!!!')
    mongoose.connection.close();
});