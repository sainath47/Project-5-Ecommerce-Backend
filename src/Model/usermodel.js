const mongoose = require("mongoose")



const userchema = new mongoose.Schema({

    fname: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },

    lname: {
        type: String,
        required: true,
        trim:true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: "please enter a valid email"
        }
    },

    profileImage: {
        type: String,
        require: true
    }, // s3 link

    phone: {
        type: String,
        requred: true,
        unique: true,
        trim: true,
        validator: function (phone) {
            return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone);
        }
        //valid Indian mobile number
    },

    password: {
        type: String,
        required: true,
        trim:true
        //minLen 8, maxLen 15
    }, // encrypted password

    address: {
        shipping: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            }
        },

        billing: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                rquired: true
            }

        }
    }
    // createdAt: {timestamp},
    // updatedAt: {timestamp},

}, { timestamps: true })

module.exports = mongoose.model('UserData', userchema)