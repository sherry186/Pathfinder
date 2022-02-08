//Import the mongoose module
var mongoose = require('mongoose');
// Password handler
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Define a schema
var Schema = mongoose.Schema;
const Double = mongoose.Schema.Types.Double;


// 先新增 User 的 Schema 
var UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    abilityScoreSum: {type: [Number], required: true},
    topDepartment: {type: [String], required: true},
    lackAbilities: {type: [Number], required: true}
    });

// ensures password is hashed before saving into db, 
// check out https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1 tutorial
UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});


UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("User", UserSchema);