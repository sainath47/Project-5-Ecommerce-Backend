const orderModel = require("../Models/orderModel")
const userModel = require("../Models/userModel")
const cartModel = require('../Models/cartModel')
const mongoose = require('mongoose')

const isvalidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}




const createOrder = async function(req, res){

    try {
        const userId = req.params.userId
        const requestBody = req.body
       
        
        if (!isvalidRequestBody(requestBody)) {
            return res.status(400).send({ status: false,  message: "Invalid request body. Please provide the the input to proceed.",})
        }
        
        const { cartId, cancellable, status } = requestBody

       
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }

        const searchUser = await userModel.findOne({ _id: userId })
        if (!searchUser) {
            return res.status(400).send({status: false,message: "user doesn't exists for uderId" })
        }
        

        if (!cartId) {
            return res.status(400).send({ status: false,message: "CartId is required field}",})
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Invalid cartId in request body" })
        }

        
        const searchCartDetails = await cartModel.findOne({_id: cartId, userId: userId, })

        if (!searchCartDetails) {
            return res.status(400).send({status: false, message: "Cart doesn't belongs to userId" })
        }

        
        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({status: false, message: "cancel must be boolean value true or false" })
            }
        }

        
        if (status) {
            if (!["pending","completed","cancelled"].includes(status)) {
             
                return res.status(400).send({status: false, message: "Status must be among ['pending','completed','cancelled']"})
            }
        }

        //verifying whether the cart is having any products or not.
        if (!searchCartDetails.items.length) {
            return res.status(400).send({status: false, message: "Order already placed for this cart. Please add some products in cart to make an order",})
        }

        let totalQuantity =0
        for(let i in searchCartDetails.items){
            totalQuantity += searchCartDetails.items[i].quantity
        }
        
        //object destructuring for response body.
        const orderDetails = {
            userId: userId,
            items: searchCartDetails.items,
            totalPrice: searchCartDetails.totalPrice,
            totalItems: searchCartDetails.totalItems,
            totalQuantity: totalQuantity,
            cancellable,
            status,
        }
        const savedOrder = await orderModel.create(orderDetails)

        //Empty the cart after the successfull order
        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, {
            $set: {
                items: [],
                totalPrice: 0,
                totalItems: 0,
            },
        })
        return res.status(200).send({ status: true, message: "Order placed", data: savedOrder })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

module.exports = {createOrder}