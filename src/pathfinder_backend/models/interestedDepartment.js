//Import the mongoose module
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// 先新增 InterestedDepartment 的 Schema 
var InterestedDepartmentSchema = new Schema({
    userId: {type: ObjectId, required: true},
    department: {type: [Number], required: true},
    lackAbilities: {type: [Number], required: true}
    });

module.exports = mongoose.model("InterestedDepartment", InterestedDepartmentSchema);