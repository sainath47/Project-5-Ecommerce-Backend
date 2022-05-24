const mongoose = require("mongoose")





const userchema = new mongoose.Schema({

    fname: {
        type:string, 
        required:true,
        unique: true,
    },
    lname: {
        type:string,
        required:true,
    },
    email: {
        typre:string, 
        required:true, 
         unique: true,
        },
    profileImage: {
        type:string, 
       require:true
    }, // s3 link
    phone: {
        typ:string, 
        requred:true, 
        unique: true, 
        //valid Indian mobile number
    }, 
    password: {
        type:string,
        required:true, 
        //minLen 8, maxLen 15
    }, // encrypted password
    address: {
      shipping: {
        street: {
            type:string, 
            required: true ,
        },
        city: {
            type:string, 
            required:true
        },
        pincode: {
            type:number,
            required: true
           }
      },
      billing: {
        street: {
            type:string, 
            required:true
        },
        city: {
            type:strin