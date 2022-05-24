const mongoose = require("mongoose");
const usermodel = require("../model/usermodel.js");
const validator= require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const aws= require("aws-sdk");




aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})



let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     // this function will upload file to aws and return the link
     let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  //HERE
         Key: "abc/" + file.originalname, //HERE 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             return reject({"error": err})
         }
         console.log(data)
         console.log("file uploaded succesfully")
         return resolve(data.Location)
     })
 
     // let data= await s3.upload( uploadParams)
     // if( data) return data.Location
     // else return "there is an error"
 
    })
 }

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isvalidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}


const createUser = async function (req, res) {
    try {

        let data = req.body

        if (!isvalidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "data not found" })

        }else{
            const {fname, lname, email, profileImage, phone, password, street, city, pincode}=data

            if(!isValid(fname)){
                return res.status(400).send({status:false, msg: "first name is required"})
            }

            if(!isValid(lname)){
                return res.status(400).send({status:false, msg: "last name is required"})
            }

            if(!isValid(email)){
                return res.status(400).send({status:false, msg: "email is required"})
            }

            if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
                return res.status(400).send({status:false, msg: "Please enter a valid email"})
            }

            if(!isValid(profileImage)){
                return res.status(400).send({status:false, msg: "profileImage is required"})
            }

            if(!isValid(phone)){
                return res.status(400).send({status:false, msg: "phone is required"})
            }

            if(! /^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)){
                return res.status(400).send({status:false, msg: "please enter a valid email"})
            }

            
            if(!isValid(password)){
                return res.status(400).send({status:false, msg: "password is required"})
            }

            
            if(!isValid(street)){
                return res.status(400).send({status:false, msg: "street is required"})
            }

            if(!isValid(city)){
                return res.status(400).send({status:false, msg: "street is required"})
            }

            if(!isValid(pincode)){
                return res.status(400).send({status:false, msg: "street is required"})
            }
        }
    
        const saltRounds = 10;
        var password = "pranali@123";

        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                // Store hash in database here
                console.log(hash)
            
            });

        });

            if(profileImage && profileImage.length>0){
                //upload to s3 and get the uploaded link
                // res.send the link back to frontend/postman
                let uploadedprofileImage= await uploadFile( profileImage[0] )
                res.status(201).send({msg: "file uploaded succesfully", data: uploadedprofileImage})}


            let saveData = await usermodel.create(data)
            return res.status(201).send({ status: true, msg: "User created successfully", data:saveData })
    
       
        
    

   } catch (error) {
        res.status(500).send({ msg: error.message }) 
    }
}






const userlogin = async function (req, res) {

    try {
      const email = req.body.email;
      const password = req.body.password;
  
      if (!password) {
        return res.status(400).send({ status: false, msg: "password is required" })
      }
  
      if (!email) {
        return res.status(400).send({ status: false, msg: "email is required" })
      }

      const validEmail = validator.isEmail(email)
      if (!validEmail) {
        return res.status(400).send({ status: false, msg: "email is not valid" })
      }
  
      const checkedUser = await usermodel.findOne({ email: email, password: password });
      if (!checkedUser) {
        return res.status(404).send({ status: false, msg: "email or password is not correct" });
      }
  
      else {
        const token = jwt.sign({ userId: checkedUser._id.toString() }, "functionUp", { expiresIn: '6000s' });
        return res.status(201).send({ status: true, msg:"User login succesfull", data: token });
      }
  
    }
    catch (error) { res.status(500).send({ msg: error.message }) }
  };
  
  
  




module.exports = { createUser , userlogin}
