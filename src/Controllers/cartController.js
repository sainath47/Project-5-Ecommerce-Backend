const { ifError } = require('assert')
const cartModel = require('../Models/cartModel')
const productModel = require('../Models/productModel')



const createCartOrPostProductsInCart = function(req,res){

    await cartModel.create(data)


//     let items= req.body.items
//     const {userId,quantity,totalPrice,totalItems,cartId} = req.body
//     let  data={userId,items}
//     if(cartId){
//      let sum =0
//         for(let i=0 ; i <items.length; i++ )
// {let productId= req.body.items[i].productId 
//        let product = await productModel.findOne({productId:JSON.stringify(productId)})
//        sum += product.price 
//     }
// data["totalPrice"]= totalPrice+sum


// }
//     else{




//     }
}


// {
//     userId: {
//         type: ObjectId,
//          refs : User, 
//          required:true, 
//          unique:true
//         },

//     items: [{
//       productId: {
//           type: ObjectId, 
//           refs: product,
//           required:true 
//         },

//       quantity: {
//           type: Number, 
//           required: true
//          // min 1
//         }
//    }],

//     totalPrice: {
//         type: Number,
//         required: true
//     // comment: "Holds total price of all the items in the cart"
//     },

//     totalItems: {
//         type: Number, 
//         required: true
//         //comment: "Holds total number of items in the cart"
//     },
   


module.exports = {createCartOrPostProductsInCart}
