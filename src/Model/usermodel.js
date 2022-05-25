const mongoose = require("mongoose");

let validateEmail = function (email) {
    let emailRegex = /^\w+[\.-]?\w+@\w+[\.-]?\w+(\.\w{1,3})+$/;
    return emailRegex.test(email)
};
let validatePhone = function (phone) {
    phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone)
};


const userSchema = mongoose.Schema(
    {

        fname: {
            type: String,
            required: [true, "fname is required"],
            unique: true,
            trim: true
        },
        lname: {
            type: String,
            required: [true, "lname is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "email is required"],
            validation: [validateEmail, "please enter a valid email address"],
            unique: true,
            trim: true
        },
        profileImage: {
            type: String,
            require: [true, "profile image is required"]
        },
        phone: {
            type: String,
            requred: [true, "phone is required"],
            validation: [validatePhone, "please enter a valid phone"],
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minLen: 8,
            maxLen: 15,
            trim: true
        },
        address: {
            shipping: {
                street: {
                    type: String,
                    required: [true, "street is required"],
                    trim: true
                },
                city: {
                    type: String,
                    required: [true, "city is required"],
                    trim: true
                },
                pincode: {
                    type: Number,
                    required: [true, "pincode is required"],
                    trim: true
                }
            },
            billing: {
                street: {
                    type: String,
                    required: [true, "street is required"],
                    trim: true
                },
                city: {
                    type: String,
                    required: [true, "city is required"],
                    trim: true
                },
                pincode: {
                    type: Number,
                    required: [true, "pincode is required"],
                    trim: true
                }
            }
        }
    },

    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
