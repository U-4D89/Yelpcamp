const mongoose = require('mongoose');
const passport = require('passport');
const  passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true

    }
});

//adds to user schema the result of passportlocalmongoose
//username, salt+hashedpassword
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);