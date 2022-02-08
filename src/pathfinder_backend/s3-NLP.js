const AWS = require('aws-sdk');
const fs = require('fs');
const moment = require("moment");
const Record = require("./models/record.js"); //the record models
const path = require('path');
const filePath = path.join(__dirname, '/RecordNLP.json');

const AWSCredentials = {
    accessKey: 'AKIAVU3UV3IHORDIDP7Q',
    secret: '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',
    bucketName: 'pathfinder-uploadbucket'
};

const s3 = new AWS.S3({
    accessKeyId: AWSCredentials.accessKey,
    secretAccessKey: AWSCredentials.secret
});


exports.getAllUnAnalysisRecords = async function() {
    var today = moment(new Date()).format("YYYY-MM-DD");
        //var today = "2021-09-25";
        let records = await Record.find({
            $and: [
                { $or: [ { createdAt: { '$gte': new Date(today+"T00:00:00.000Z"), '$lte': new Date(today + "T23:59:59.999Z") }}, 
                { updatedAt: { '$gte': new Date(today+"T00:00:00.000Z"), '$lte': new Date(today + "T23:59:59.999Z") }} ]  },
                { feeling: { '$gte': 0.5 }  }
            ]   
        });
        //let records = await Record.find();
        // const userId = "612caa38462b190004c17f48";
        // let records = await Record.find({ userId: userId });
        
        if(records.length == 0) return "There is no new Record.";

        var obj = {
            articles: []
         };
        for(var i = 0 ; i < records.length; i++){
            obj.articles.push({article_id: records[i]._id, article: records[i].description, if_new: true});
        }
        var json = JSON.stringify(obj);
        //var file = fs.createWriteStream('RecordNLP.json');
        //file.write(json);
        
        
        fs.writeFileSync('RecordNLP.json', json);
        //fs.writeFileSync(filePath,json);
        return records.toString();
}


exports.uploadToS3 = async function(fileName) {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    // Setting up S3 upload parameters
    const params = {
        Bucket: AWSCredentials.bucketName,
        Key: fileName,
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
}







