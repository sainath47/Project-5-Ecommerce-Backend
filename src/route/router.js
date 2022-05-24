const express = require('express');
const router = express.Router();

const{createUser,userlogin}= require('../Controller/usercontroller.js')







router.post('/register',createUser)
router.post('/login',userlogin)




module.exports = router