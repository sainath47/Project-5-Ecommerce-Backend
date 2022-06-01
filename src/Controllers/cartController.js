const cartModel = require('../Models/cartModel')
const productModel = require('../Models/productModel')
const mongoose = require("mongoose");


const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}



//======================================================= create cart controller ==========================================================//



const createCartAndAddToCart = async function (req, res) {

    try {

        let data = req.body
        let userId = req.params.userId
        data["userId"] = userId

        const { items, cartId } = data

        if (!items.quantity) data.items["quantity"] = 1
        let productId = items.productId
        let quantity = items.quantity

      
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })

        //-----------validation for quantity-----------
        if (!Number(quantity)) return res.status(400).send({ status: false, message: "product quantity is number" })

        if (quantity < 1) return res.status(400).send({ status: false, message: "product quantity should be min 1" })

        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        let productPrice = product.price
        
        //if cart is not present in request body & not have any cart Id---
        if (!cartId) {
            let userCart = await cartModel.findOne({ userId })
            if (userCart) return res.status(400).send({ status: false, message: "this user already have a cart created,please provide cartId" })

            data["totalItems"] = 1
            data["totalPrice"] = productPrice * quantity

            let cartCreated = await cartModel.create(data)
            return res.status(201).send({ status: true, message: "Cart created Successfully", data: cartCreated })
        
        //if cart Id is present then validate cart Id & update cart------
        } else if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "invalid Cart Id" })

            let cart = await cartModel.findOne({ _id: cartId })
            if (!cart) return res.status(404).send({ status: false, message: "no cart with this Cart Id" })


            if (cart.userId != userId) return res.status(401).send({ status: false, message: "userId of cart not matched with user,unauthorized" })

            let totalPrice = productPrice * quantity
            let cartIemsLength = cart.items.length
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    cart.items[i].quantity = cart.items[i].quantity + quantity

                    let updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { items: cart.items, totalItems: cartIemsLength, $inc: { totalPrice } }, { new: true }).select({ "items._id": 0, __v: 0 })

                    return res.status(200).send({ status: true, message: "Cart updated successfull", data: updatedCart })
                }

            }

            let updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { items: { productId, quantity } }, totalItems: cartIemsLength + 1, $inc: { totalPrice: totalPrice } }, { new: true }).select({ "items._id": 0, __v: 0 })

            return res.status(200).send({ status: true, message: "Cart updated successfull", data: updatedCart })
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}



//=========================================== update cart controller =====================================================================//



const updateCart = async function (req, res) {

    try {

        const userId = req.params.userId;
        const body = req.body;

        //-----user Id validation-----
        if (!isValidObjectId(userId)) {
             return res.status(400).send({ status: false, message: "please enter a valid userId" })
        }

        const { productId, cartId, removeProduct } = body; //destructurig and validation

        //----product Id validation-----
        if (!isValidObjectId(productId)) {
             return res.status(400).send({ status: false, message: "please enter a valid product Id" })
        }

        let productSearch = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productSearch) {
             return res.status(404).send({ status: false, message: "product not found" })
        }

        //-----card Id validation-----
        if (!isValidObjectId(cartId)) {
             return res.status(400).send({ status: false, message: "please enter a valid card Id" })
        }

        let cartSearch = await cartModel.findOne({ _id: cartId })
        if (!cartSearch) {
             return res.status(404).send({ status: false, message: "cart Id not found" })
        }

        if (cartSearch.userId != userId) return res.status(401).send({ status: false, message: "userId of cart not matched with user,unauthorized" })

        //-----removed product---
        if (cartSearch.items == 0) return res.status(400).send({ status: false, message: "no product in cart to remove" })

        if (!(removeProduct)) {
             return res.status(400).send({ status: false, message: "remove product is required" })
        }

        const cart = cartSearch.items
        let count = 0

        for (let i = 0; i < cart.length; i++) {
            if (cart[i].productId == productId) {
                count++

                let totalquantity = cart[i].quantity
                const priceChange = cart[i].quantity * productSearch.price


                if (removeProduct == 0) {
                    const productRemove = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: cartSearch.totalPrice - priceChange, totalItems: cartSearch.totalItems - totalquantity }, { new: true }).select({ "items._id": 0, __v: 0 })

                    return res.status(200).send({ status: true, message: "Cart updated successfull", data: productRemove })
                }

                if (removeProduct == 1) {
                    if (cart[i].quantity == 1 && removeProduct == 1) {
                        const priceUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId } }, totalPrice: cartSearch.totalPrice - priceChange, totalItems: cartSearch.totalItems - 1 }, { new: true }).select({ "items._id": 0, __v: 0 })

                        return res.status(200).send({ status: true, message: "Cart updated successfull", data: priceUpdate })
                    }

                    cart[i].quantity = cart[i].quantity - 1
                    const updatedCart = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: cart, totalPrice: cartSearch.totalPrice - productSearch.price, totalItems: cart.length }, { new: true }).select({ "items._id": 0, __v: 0 })

                    return res.status(200).send({ status: true, message: "Cart updated successfull", data: updatedCart })
                }

            }

        }

        if (count == 0) return res.status(404).send({ status: false, message: "productId is not present in cart" })

    } catch (err) {
         return res.status(500).send({ status: false, message: err.message })

    }

}




//============================================ get cart detail controller ================================================================//



const getCart = async function (req, res) {

    try {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

        let findcart = await cartModel.findOne({ userId: req.params.userId }).populate("items.productId").select({ "items._id": 0, __v: 0 })

        if (findcart.userId != userId) return res.status(401).send({ status: false, message: "userId of cart not matched with user,unauthorized" })

        if (!findcart) return res.status(404).send({ status: false, message: "cart is not present for this user" })

        return res.status(200).send({ status: true, message: "Cart details", data: findcart })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}



//============================================= delete cart controller ===================================================================//



const deleteCart = async function (req, res) {

    try {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

        let cart = await cartModel.findOne({ userId: req.params.userId })
        if (!cart) return res.status(404).send({ status: false, message: "cart is not present for this user" })

        if (cart.userId != userId) return res.status(401).send({ status: false, message: "userId of cart not matched with user,unauthorized" })

        if (cart.items.length == 0 && cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, message: "cart is already deleted" })


        let deletedcart = await cartModel.findOneAndUpdate({ userId: req.params.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })

        return res.status(204).send({ status: true, message: "Cart deleted successfull", data: deletedcart })

    } catch (err) {
         return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { getCart, deleteCart, createCartAndAddToCart, updateCart }
