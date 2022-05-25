const express = require('express');
const router = express.Router();

const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js');
const { authentication, authorization } = require('../middlewares/auth.js');







router.post('/register',createUser)
router.post('/login',userlogin)
router.get('/user/:userId/profile',authentication,getUserdata)
router.put('/user/:userId/profile',authorization,upda)




module.exports = router