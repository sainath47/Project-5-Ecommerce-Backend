const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId


const orderSchema = mongoose.Schema(
  {
    userId: {
        type: ObjectId,
        ref: "User",
        required: [true, "user Id is required"]
    },
    items: [{
      productId: {
          type: ObjectId,
          ref: "Product",
          required: [true, "product Id is required"]
      },
      quantity: {
          type: Number,
          required: [true, "quantity is required"],
          min: 1
      }
    }],
    totalPrice: {
         type: Number,
         required: [true, "Holds total price of all the items in the cart"]
    },
    totalItems: {
         type: Number,
         required: [true, "Holds total number of items in the cart"]
    },
    totalQuantity: {
         type: Number,
         required: [true, "Holds total number of quantity in the cart"]
    },
    cancellable: {
         type: Boolean,
         default: true
    },
    status: {
         type: String,
         default: 'pending',
         enum: ["pending", "completed", "cancelled"]
    },
    deletedAt: {
         type: Date
    },
    isDeleted: {
         type: Boolean, 
         default: false
    },

  }, { timestamps: true })


module.exports = mongoose.model('Order', orderSchema);