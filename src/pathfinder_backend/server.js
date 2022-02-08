require('dotenv').config()

var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const bodyParser = require('body-parser');

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
const { computeScore } = require('./compute_score/computeScore')
var { generateUploadURL } = require('./s3.js');
var { generatDocURL } = require('./s3.js');

const PORT = process.env.PORT || 5000;

//******************* database part start *****************//

//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = process.env.DB_URI;


mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => { console.log("DB Connected") })
  .catch((err) => console.log(err));;

//******************* database part end *****************//


var app = express();
const docx = require("docx");
const { WordsUnderline } = require('docx');
const { Document, Packer, Paragraph, TextRun } = docx;

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true,
}));

app.get('/s3Url', async (req,res) => {
    const url = await generateUploadURL();
    res.send({url});
});

// app.get('/s3Url', async (req,res) => {
//   var amount = req.query.amount;
//   console.log(typeof amount, amount);
//   const urls = await generateUploadURL(amount);
//   res.send({urls});
// });

app.get('/docUrl', async (req,res) => {
  console.log('req.query.word', req.query.word);
  var word = decodeURIComponent(req.query.word);
  //console.log('word', word);
  const url = await generatDocURL(word);
  res.send({url});
});

app.get("/getDoc", async (req, res) => {
  const doc = new Document({
      sections: [{
          properties: {},
          children: [
              new Paragraph({
                  children: [
                      new TextRun("Hello World"),
                      new TextRun({
                          text: "Foo Bar",
                          bold: true,
                      }),
                      new TextRun({
                          text: "\tGithub is the best",
                          bold: true,
                      }),
                  ],
              }),
          ],
      }],
  });

  const b64string = await Packer.toBase64String(doc);
  
  res.setHeader('Content-Disposition', 'attachment; filename=My Document.docx');
  res.send(Buffer.from(b64string, 'base64'));
});

var router = express.Router();
router.use(bodyParser.json());
app.use(express.json())

app.post("/result", async (req, res) => {
  const result = req.body;
  // console.log(`req: ${JSON.stringify(result)}`);
  // console.log(`body: ${result}`);
  
  await computeScore(result)
        .then(output => {})
        .catch(err => {throw err});
        res.send('ok');
});

/* set batch time at 23:59 */
var cron = require('node-cron');
var { getAllUnAnalysisRecords } = require('./s3-NLP.js');
var { uploadToS3 } = require('./s3-NLP.js');
var fs = require('fs');

// cron.schedule('* * * * *', () => {
//   console.log('running a task every one minute');
//   //getAllUnAnalysisRecords().catch(error => console.log(error.message));
//   uploadToS3("RecordNLP.json"); // file to upload
//   console.log('end');
// });

// cron.schedule('35 11 * * *', () => {
//   console.log('Running a job at 15:40 at Asia/Taipei timezone');
//   getAllUnAnalysisRecords().catch(error => console.log(error.message));
//   //var res = getAllUnAnalysisRecords().catch(error => console.log(error.message));
//   //console.log(res);
  
//   // if(res != "There is no new Record."){
//   //   uploadToS3("RecordNLP.json"); // file to upload
//   // }
// }, {
//   scheduled: true,
//   timezone: "Asia/Taipei"
// });

app.listen(PORT);

console.log('Running a GraphQL API server at ' + PORT);