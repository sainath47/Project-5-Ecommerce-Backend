const express = require('express');
const router = express.Router();

<<<<<<< HEAD
const{createUser,userlogin,updateUserById}= require('../Controller/usercontroller.js')
=======
const{createUser,userlogin, getUserdata}= require('../Controller/usercontroller.js')
>>>>>>> 89fb413c96263e466dc77aa758af643d7ebb57c6







router.post('/register',createUser)
router.post('/login',userlogin)
<<<<<<< HEAD
router.put('/user/:userId/profile',updateUserById)
=======
router.get('/user/:userId/profile',getUserdata)

>>>>>>> 89fb413c96263e466dc77aa758af643d7ebb57c6



module.exports = router