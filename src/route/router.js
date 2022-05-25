const express = require('express');
const router = express.Router();

const{createUser,userlogin,updateUserById}= require('../Controller/usercontroller.js')







router.post('/register',createUser)
router.post('/login',userlogin)
router.put('/user/:userId/profile',updateUserById)



module.exports = router