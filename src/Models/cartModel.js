const mongoose = require("mongoose");
let ObjectId = mongoose.Schema.Types.ObjectId;


const cardSchema = mongoose.Schema(

{
    userId: {
        type: ObjectId,
         refs : User, 
         required:true, 
         unique:true
        },

    items: [{
      productId: {
          type: ObjectId, 
          refs: product,
          required:true 
        },

      quantity: {
          type: Number, 
          required: true
         // min 1
        }
   }],

    totalPrice: {
        type: Number,
        required: true
    // comment: "Holds total price of all the items in the cart"
    },

    totalItems: {
        type: Number, 
        required: true
        //comment: "Holds total number of items in the cart"
    },
   



  },{timestamps: true });
  
  module.exports = mongoose.model('Card', cardSchema);