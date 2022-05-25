const express = require('express');
const router = express.Router();

<<<<<<< HEAD
<<<<<<< HEAD
const{createUser,userlogin,updateUserById}= require('../Controller/usercontroller.js')
=======
const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js')
>>>>>>> 89fb413c96263e466dc77aa758af643d7ebb57c6
=======
const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js');
const { authentication } = require('../middlewares/auth.js');
>>>>>>> fce5ff5f71ea1dd0d5a077d7136b72c145557916







router.post('/register',createUser)
router.post('/login',userlogin)
<<<<<<< HEAD
<<<<<<< HEAD
router.put('/user/:userId/profile',updateUserById)
=======
router.get('/user/:userId/profile',getUserdata)
=======
router.get('/user/:userId/profile',authentication,getUserdata)
>>>>>>> fce5ff5f71ea1dd0d5a077d7136b72c145557916

>>>>>>> 89fb413c96263e466dc77aa758af643d7ebb57c6



module.exports = router