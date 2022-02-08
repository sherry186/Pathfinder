//Import the mongoose module
var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

//Define a schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var SchemaTypes = mongoose.Schema.Types;

function isTitleRequired () {
    return typeof this.title === 'string'? false : true;
}

function isDescriptionRequired () {
    return typeof this.description === 'string'? false : true;
}

// 先新增 Record 的 Schema 
var RecordSchema = new Schema({
    userId: {type: ObjectId, required: true},
    title: {type: String, required: isTitleRequired},
    description: {type: String, required: isDescriptionRequired},
    tags:{type: Map, required: true},
    images:{type: [String], required: true},
    feeling:{type: SchemaTypes.Double, required: true},
    score: {type: [Number], required: true}
    },{
        //因為timestamps回傳值預設是+0時區 所以我手動加秒數 回傳string 可以請前端再對此string做處理
        timestamps: { currentTime: () => Date.now()+ 8*60*60*1000 }
    });

module.exports = mongoose.model("Record", RecordSchema);