const express = require('express');
const route = require('./Routes/route.js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const multer= require('multer');
app.use( multer().any())

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://SAINATH47:COOLESTBEING@cluster0.fk14j.mongodb.net/Project5-group28", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))   // it passes the function when the promises gets resolved
.catch ( err => console.log(err) )

app.use('/', route);


app.listen( 3000, function () {
    console.log('Express app running on port ' + (3000))
});