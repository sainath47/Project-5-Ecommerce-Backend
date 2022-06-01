const mongoose = require('mongoose');

let validatePrice = function (price) {
    priceRegex = /^[1-9]\d{0,7}(?:\.\d{1,4})?$/
    return priceRegex.test(price)
};
const productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            required: [true, "description is required"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "price is required"],
            validation: [validatePrice, "please enter a valid price"],
            trim: true
        },
        currencyId: {
            type: String,
            required: [true, "currencyId is required"],
            trim: true
        },
        currencyFormat: {
            type: String,
            required: [true, "enter currency in Rupee"],
            trim: true
        },
        isFreeShipping: {
            type: Boolean,
            default: false
        },
        productImage: {
            type: String,
            required: [true, "product image is required"] //s3 link
        },
        style: {
            type: String,
            trim: true
        },
        availableSizes: {
            type: [String],
            // enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
        },
        installments: {
            type: Number,
            trim: true
        },
        deletedAt: {
            type: Date,
            default:null
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
        
    }, { timestamps: true });


module.exports = mongoose.model('product', productSchema);








