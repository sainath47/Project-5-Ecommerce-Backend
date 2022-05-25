const jwt = require('jsonwebtoken')

const authentication =async function(req,res,next){

let token = req.headers("Authorization","Bearer Token")
let decodedToken=jwt.verify(token.split(" ")[1],"functionUp")
console.log(decodedToken)
}




module.exports = {authentication}