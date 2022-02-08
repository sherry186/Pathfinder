const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const SchemaTypes = mongoose.Schema.Types;

const ScoreSchema = new Schema({
    userId: {type: ObjectId, required: true},
    abilityScoreSum: {type: [SchemaTypes.Double], required: true},
    topDepartment: [String]
});

module.exports = mongoose.model("Score", ScoreSchema);