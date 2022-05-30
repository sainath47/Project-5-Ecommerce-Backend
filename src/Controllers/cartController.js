const cartModel = require('../Models/cartModel')
const productModel = require('../Models/productModel')
const mongoose = require("mongoose");

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const createCartAndAddToCart = async function(req,res){
try{    let data = req.body
    let userId= req.params.userId
    data["userId"]= userId
    const{items,cartId}=data
    let productId = items.productId
    let quantity = items.quantity

  

    if(!isValidObjectId(productId))return  res.status(400).send({status:false,message:"invalid productId"})
if(!quantity)return  res.status(400).send({status:false,message:"product quantity is required"})
if(!Number(quantity)) return  res.status(400).send({status:false,message:"product quantity is number"})
if(quantity<1)return  res.status(400).send({status:false,message:"product quantity should be min 1"})


    let product = await productModel.findOne({_id:productId,isDeleted:false})
    let productPrice= product.price
//    console.log(productPrice)



  
    if(!cartId){
          let userCart = await cartModel.findOne({userId})
        if(userCart)return  res.status(400).send({status:false,message:"this user already have a cart created,please provide cartId"})
        data["totalItems"] = 1
        data["totalPrice"] = productPrice * quantity
    
        let cartCreated =await cartModel.create(data)
        return res.status(201).send({status:true,message:"sucessfully created cart",data:cartCreated})
    
    
    }else if (cartId){

        
if(!isValidObjectId(cartId))return  res.status(400).send({status:false,message:"invalid CartId"})

        let cart =await cartModel.findOne({_id:cartId})
        if(!cart) return  res.status(400).send({status:false,message:"no cart with thisCartId"})
let totalPrice = productPrice* quantity


       
    
let cartIemsLength =cart.items.length

      for(let i = 0 ; i<cart.items.length;i++){
      
        
        if(cart.items[i].productId==productId){
           
           cart.items[i].quantity  = cart.items[i].quantity + quantity
        
            let updatedCart = await cartModel.findOneAndUpdate({_id:cartId},{items:cart.items,totalItems:cartIemsLength,$inc:{totalPrice}},{new:true}).select({"items._id":0})

            return res.status(200).send({status:true,message:"sucessfully updated quantity of already present product in cart ",data:updatedCart})
        }
      }
   
    let updatedCart = await cartModel.findOneAndUpdate({_id:cartId},{$push:{items:{productId,quantity}},totalItems:cartIemsLength+1,$inc:{totalPrice:totalPrice}},{new:true}).select({"items._id":0})

  
    
    return res.status(200).send({status:true,message:"sucessfully added to cart ",data:updatedCart})
    }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }
}


// id should not visible
// total items in create 

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const body = req.body;

        //user
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "please enter a valid userId" })
        }

        // let user = await userModel.findOne({ _id: userId })
        // if (!user) {
        //     return res.status(404).send({ status: false, msg: "user not found" })
        // }


        const { productId, cartId, removeProduct } = req.body; //destructurig and validation

        //product

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "please enter a valid productId" })
        }
        let productSearch = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productSearch) {
            return res.status(400).send({ status: false, msg: "product not found" })
        }

        // card

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "please enter a valid cardId" })
        }

        let cartSearch = await cartModel.findOne({ _id: cartId })
        if (!cartSearch) {
            return res.status(400).send({ status: false, msg: "cartId not found" })
        }

        // remove product

        // if(removeProduct != 1 && removeProduct !=0){
        //  return res.status(400).send({status: false, msg: "removeProduct should be 1 or 0 only"})
        // }
 if(cartSearch.items==0) return res.status(400).send({ status: false, msg: "no product in cart to remove" })



        if (!(removeProduct)) {
            return res.status(400).send({ status: false, msg: "removeProduct is required" })
        }

        const cart = cartSearch.items
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].productId == productId) {
              let totalQuantity=  cart[i].quantity 
                const priceChange = cart[i].quantity * productSearch.price

                if (removeProduct == 0) {
                    

                    const productRemove = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: cartSearch.totalPrice - priceChange, totalItems: cartSearch.totalItems - totalQuantity }, { new: true }).select({"items._id":0})

                    return res.status(200).send({ status: true, msg: "Removed product successfully", data: productRemove })
                }

                if (removeProduct == 1) {
                    if (cart[i].quantity == 1 && removeProduct == 1) {
                        const priceUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId } }, totalPrice: cartSearch.totalPrice - priceChange, totalItems: cartSearch.totalItems - 1 }, { new: true }).select({"items._id":0})

                        return res.status(200).send({ status: true, msg: "Successfully removed product or cart is empty", data: priceUpdate })
                    }

                    cart[i].quantity = cart[i].quantity - 1
                    const updatedCart = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: cart, totalPrice: cartSearch.totalPrice - productSearch.price,totalItems: cartSearch.totalItems - 1 }, { new: true }).select({"items._id":0})

                    return res.status(200).send({ status: true, msg: "sucessfully decremented the product", data: updatedCart })
                }

            }

        }








    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }

}






const getCart = async function (req, res) {

    try {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })

        // let finduser = await userModel.findOne({ _id: userId })
        // if (!finduser) return res.status(404).send({ status: false, msg: "user Not Found" })

        // if (req.userId != req.params.userId) return res.status(403).send({ status: false, msg: "you are not authorized user" })

        let findcart = await cartModel.findOne({ userId: req.params.userId }).populate("items.productId").select({"items._id":0})

        if (!findcart) return res.status(400).send({ status: false, msg: "cart is not present for this user" })

        return res.status(200).send({ status: true, msg: "get cart details successful", data: findcart })


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }
}

const deleteCart = async function (req, res) {

    try {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })

        // let finduser = await userModel.findOne({ _id: userId })
        // if (!finduser) return res.status(404).send({ status: false, msg: "user Not Found" })

        // if (req.userId != req.params.userId) return res.status(403).send({ status: false, msg: "you are not authorized user" })

        let cart = await cartModel.findOne({ userId: req.params.userId })
        if (!cart) return res.status(400).send({ status: false, msg: "cart is not present for this user" })

        if (cart.items.length == 0 && cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, msg: "cart is already deleted" })

        let deletedcart = await cartModel.findOneAndUpdate({ userId: req.params.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        return res.status(204).send({ status: true, msg: "deleted cart successfully", data: deletedcart })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { getCart,deleteCart,createCartAndAddToCart,updateCart}
