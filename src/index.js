const express = require('express');
const route = require('./route/router.js');
const { default : mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const multer= require("multer");
const { AppConfig } = require('aws-sdk');
app.use( multer().any())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

mongoose.connect("mongodb+srv://SAINATH47:COOLESTBEING@cluster0.fk14j.mongodb.net/Project5-group28", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))   // it passes the function when the promises gets resolved
.catch ( err => console.log(err) )

app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});