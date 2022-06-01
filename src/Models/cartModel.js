const mongoose = require("mongoose");

let ObjectId = mongoose.Schema.Types.ObjectId;


const cartSchema = mongoose.Schema(

    {
        userId: {
            type: ObjectId,
            ref: 'User',
            required: [true, "userId is required"],
            unique: true
        },

        items: [{
            productId: {
                type: ObjectId,
                ref: 'product',
                required: [true, "productId is required"]
            },

            quantity: {
                type: Number,
                required: [true, "quantity is required"],
                min: 1,
                default:1
            }
        }],

        totalPrice: {
            type: Number,
            required: [true, "total price is required"]
            
        },

        totalItems: {
            type: Number,
            required: [true, "total items are required"]
            
        }

    }, { timestamps: true });


module.exports = mongoose.model('Cart', cartSchema);