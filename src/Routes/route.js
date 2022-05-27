const express = require('express');
const router = express.Router();


const{createUser,userlogin,getUserdata,updateUserById}= require('../Controllers/userController.js')
const{createProduct, getProductByQuery}=require('../Controllers/productController')

const { authentication, authorization } = require('../Middlewares/auth.js');


//user 
router.post('/register',createUser)
router.post('/login',userlogin)
router.get('/user/:userId/profile',authentication,getUserdata)
router.put('/user/:userId/profile',authorization,updateUserById)

//product 
router.post('/products', createProduct)
router.get('/products',getProductByQuery)


module.exports = router