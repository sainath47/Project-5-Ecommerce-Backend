const express = require('express');
const router = express.Router();


const{createUser,userlogin,getUserdata,updateUserById}= require('../Controllers/userController.js')
const{createProduct, getProductByQuery, getProductById, deleteProduct, updateProductById}=require('../Controllers/productController')
const{ getCart,deleteCart } =require('../Controllers/cartController')

const { authentication, authorization } = require('../Middlewares/auth.js');


//user 
router.post('/register',createUser)
router.post('/login',userlogin)
router.get('/user/:userId/profile',authentication,getUserdata)
router.put('/user/:userId/profile',authorization,updateUserById)

//product 
router.post('/products', createProduct)
router.get('/products',getProductByQuery)
router.get('/products/:productId',getProductById)
router.delete('/products/:productId',deleteProduct)
router.put('/products/:productId',updateProductById)

//cart
router.get('/users/:userId/cart',authentication,getCart)
router.delete('/users/:userId/cart',authorization,deleteCart )



module.exports = router