//Import the mongoose module
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// 先新增 Activity 的 Schema 
var ActivitySchema = new Schema({
    type: {type: [Number], required: true},
    department:{type: [Number], required: true},
    major:{type: [Number], required: false},
    title:{type: String, required: true},
    host:{type: String, required: true},
    location:{type: String, required: false},
    time:{type: String, required: false},
    url:{type: String, required: true},
    description:{type: String, required: true},
    abilities:{type: [Number], required: true},
    image:{type: String, required: false}
});

module.exports = mongoose.model("Activity", ActivitySchema);