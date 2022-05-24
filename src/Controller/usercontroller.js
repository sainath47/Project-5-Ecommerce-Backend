const userModel = require('../Model/usermodel')


const createUser = (req,res)=>{
    let createdUser = await userModel.create(req.body)
    res.status(201).send({status:true,message:"sucessfuly created the user",data:createdUser})
}
