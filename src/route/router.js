const express = require('express');
const router = express.Router();


const{createUser,userlogin,updateUserById}= require('../Controller/usercontroller.js')

const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js')


const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js');
const { authentication, authorization } = require('../middlewares/auth.js');








router.post('/register',createUser)
router.post('/login',userlogin)

router.put('/user/:userId/profile',updateUserById)

router.get('/user/:userId/profile',getUserdata)

router.get('/user/:userId/profile',authentication,getUserdata)





module.exports = router