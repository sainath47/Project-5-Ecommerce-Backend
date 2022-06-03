const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


const authentication = async function (req, res, next) {
try{
   let bearerHeader = req.headers["authorization"]
   if (!bearerHeader) return res.status(401).send({ status: false, message: "please provide token " })

   let bearerToken = bearerHeader.split(' ');

   let token = bearerToken[1];


   jwt.verify(token, "functionUp",function (err, decodedToken) {
            if (err) {
                return res.status(400).send({ status: false, message: "Token is invalid" })
            }
         else{
            next()
         }
        })

}
catch(err){
   return res.status(500).send({ status: false, message: err.message })
}

}



const authorization = async function (req, res, next) {

 try{  let bearerHeader = req.headers["authorization"]
   if (!bearerHeader) return res.status(401).send({ status: false, message: "please provide token " })

   let bearerToken = bearerHeader.split(' ');

   let token = bearerToken[1];


   jwt.verify(token, "functionUp",function (err, decodedToken) {
            if (err) {
                return res.status(400).send({ status: false, message: "Token is invalid" })
            }
         else{

            let userId = req.params.userId
            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" })
           
               if (decodedToken.userId == userId) 
               next()
               else return res.status(401).send({ status: false, message: "unauthorized" })
            
         }
        })

 }
   catch(err){
      return res.status(500).send({ status: false, message: err.message })
   }

}




module.exports = { authentication, authorization }