const cartModel = require('../Models/cartModel')
const mongoose = require("mongoose");


const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}



const getCart = async function (req, res) {

    try {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })

        let finduser = await userModel.findOne({ _id: userId })
        if (!finduser) return res.status(404).send({ status: false, msg: "user Not Found" })

        if (req.userId != req.params.userId) return res.status(403).send({ status: false, msg: "you are not authorized user" })

        let findcart = await cartModel.findOne({ userId: req.params.userId }).populate("items.productId")

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

        let finduser = await userModel.findOne({ _id: userId })
        if (!finduser) return res.status(404).send({ status: false, msg: "user Not Found" })

        if (req.userId != req.params.userId) return res.status(403).send({ status: false, msg: "you are not authorized user" })

        let cart = await cartModel.findOne({ userId: req.params.userId })
        if (!cart) return res.status(400).send({ status: false, msg: "cart is not present for this user" })

        if (cart.items.length == 0 && cart.totalPrice == 0 && cart.totalItems == 0) return res.status(400).send({ status: false, msg: "cart is already deleted" })

        let deletedcart = await cartModel.findOneAndUpdate({ userId: req.params.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        return res.status(204).send({ status: true, msg: "deleted cart successfully", data: deletedcart })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { getCart,deleteCart }
