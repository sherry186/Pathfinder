require('dotenv').config()
const aws = require('aws-sdk');
const crypto = require('crypto');
var {promisify} = require("util");
const randomBytes = promisify(crypto.randomBytes);
const docx = require("docx");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
var fs = require('fs');

const region = "ap-northeast-2";
const bucketName = "pathfinder-image";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4'
})

exports.generateUploadURL = async function() {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString("hex");

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 120
    });

    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    return uploadURL;
}

// exports.generateUploadURL = async function( amount ) {
//     const URLs = [];
//     for(var i = 0; i < amount; i++){
//         const rawBytes = await randomBytes(16);
//         const imageName = rawBytes.toString("hex");

//         const params = ({
//             Bucket: bucketName,
//             Key: imageName,
//             Expires: 120
//         });

//         const uploadURL = await s3.getSignedUrlPromise('putObject', params);
//         URLs[i] = uploadURL;
//     }
//     return URLs;
// }

const paragraphs = (parentArr) => {
    var arr = [], child = [];
    var cnt = 0;
    for(var i = 0; i < parentArr.length-1; i++){
        arr = [];
        arr = parentArr[i].split(['T']);
        for(var j = 0; j < arr.length; j++){
            if(j == 0){
                child[cnt] = 
                new Paragraph({
                    children: [
                        new TextRun({
                            text: arr[0],
                            bold: true,
                            size: 40
                        }),
                    ],
                }) 
                cnt++;
            }
            else{
                child[cnt] = 
                new Paragraph({
                    children: [
                    new TextRun({
                            text: arr[j]
                        }),
                    ],
                }) 
                cnt++;
            }  
        }
    }
  
    return child
};

exports.generatDocURL = async function( word ) {
    const rawBytes = await randomBytes(16);
    const docName = rawBytes.toString("hex")+".docx";
    var res = word.toString();
    var parentArr = [];
    parentArr = res.split("---");
    
    const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs(parentArr),
            }],
        });

    const b64string = await Packer.toBase64String(doc);
    fs.writeFileSync("My Document.docx", Buffer.from(b64string, 'base64'));
    const fileContent = fs.readFileSync("My Document.docx");
    
    const params = ({
        Bucket: bucketName,
        Key: docName,
        Expires: 120,
        Body: fileContent
    }); 
   
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });

    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    return uploadURL;
}