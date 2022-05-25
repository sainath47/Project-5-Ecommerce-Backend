const express = require('express');
const router = express.Router();

const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js');
const { authentication } = require('../middlewares/auth.js');







router.post('/register',createUser)
router.post('/login',userlogin)
router.get('/user/:userId/profile',authentication,getUserdata)




module.exports = router