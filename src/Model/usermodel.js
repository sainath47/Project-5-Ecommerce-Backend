const mongoose = require("mongoose")





const userchema = new mongoose.Schema({

    fname: {
        type:String, 
        required:true,
        unique: true,
    },
    lname: {
        type:String,
        required:true,
    },
    email: {
        type:String, 
        required:true, 
         unique: true,
        },
    profileImage: {
        type:String, 
       require:true
    }, // s3 link
    phone: {
        type:String, 
        requred:true, 
        unique: true, 
        //valid Indian mobile number
    }, 
    password: {
        type:String,
        required:true, 
        //minLen 8, maxLen 15
    }, // encrypted password
    address: {
      shipping: {
        street: {
            type:String, 
            required: true ,
        },
        city: {
            type:String, 
            required:true
        },
        pincode: {
            type:Number,
            required: true
           }}
      },
      billing: {
        street: {
            type:String, 
            required:true
        },
        city: {
            type:String, 
            required:true
        },
        pincode: {
            type:Number,
            required: true
           }
      }
    }, {timestamps:true})


    module.exports = mongoose.model('user',userchema)
    
     