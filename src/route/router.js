const express = require('express');
const router = express.Router();

const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js')







router.post('/register',createUser)
router.post('/login',userlogin)
router.get('/user/:userId/profile',getUserdata)




module.exports = router