//Import the mongoose module
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// 先新增 Tag 的 Schema 
var TagSchema = new Schema({
    userId: {type: ObjectId, required: true},
    tags:{type: Map, required: true}
    });

module.exports = mongoose.model("Tag", TagSchema);