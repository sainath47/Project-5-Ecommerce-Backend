const productModel = require("../Models/productModel");
const aws = require("aws-sdk");




aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", //HERE
            Key: "abc/" + file.originalname, //HERE
            Body: file.buffer,
        };

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ error: err });
            }
            console.log(data);
            console.log("file uploaded succesfully");
            return resolve(data.Location);
        });

    });
};


const createProduct = async function (req, res) {
    try {

        let data = req.body
        
       





        let files = req.files
        if (files && files.length > 0) {
          //upload to s3 and get the uploaded link
          // res.send the link back to frontend/postman
          let uploadedproductImage = await uploadFile(files[0])
          data["productImage"] = uploadedproductImage
    
        }

        let createProduct = await productModel.create(data)
        return res.status(201).send({ status: true, msg: "product created successfully", data: createProduct })

    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }

}



const updateProductById = async function (req, res) {
    try {
      let productId = req.params.productId;
  
      // ID validation
      if (!isValidObjectId(userId))
        return res.status(400).send({ status: false, msg: "Not a valid product ID" });
      // Id verification
      let userDetails = await userModel.findById(userId);
      if (!userDetails)
        return res.status(404).send({ status: false, msg: "product not found." });
  
       let data = req.body;
  
      // if (Object.keys(req.body).length == 0 && (!req.profileImage))
      //   return res.status(400).send({ status: false, msg: "NO INPUT BY USER" }); //for update required filled can't be blank

      let { title,description,price,currencyId,currencyFormat,isFreeShipping,productImage,style,availableSizes,installments} = data;
      let findTitle = await productModel.findOne({title})
if(findTitle)return res.status(400).send({status:false,message:"product already with this title"}) 

 if(!(/^(0|[1-9][0-9]*)$/.test(price)))return res.status(400).send({status:false,message:"price is numeric"})
 if(!(/\bINR\b/.test(price)))return res.status(400).send({status:false,message:"only INR , no other currency is accepted"})
if(!(/^(S|XS|M|X|L|XXL|XL)$/.test(availableSizes))) return res.status(400).send({status:false,message:'"S", "XS", "M", "X", "L", "XXL", "XL" only this values'})
if(!(/^(0|[1-9][0-9]*)$/.test(installments)))return res.status(400).send({status:false,message:"installments is numeric"})
if(isFreeShipping !== true || false)return res.status(400).send({status:false,message:"isFreeShipping isboolean"})

    // currencyFormat: {
    //     type: String,
    //     required: [true, "enter currency in Rupee"],
    //     trim: true
    // },
  

  
  
  
   
      let files = req.files// whatever the key is , doesnt matter
      if (files && files.length > 0) {
        //upload to s3 and get the uploaded link
        // res.send the link back to frontend/postman
        var uploadedProductImage = await uploadFile(files[0])
        data["productImage"] = uploadedProductImage
  
      }
    
      let updatedProduct = await userModel.findOneAndUpdate(
        { _id: productId ,isDeleted:false},
        {
          $set: {
          ...data,

          updatedAt: Date.now(),
          },
        },
        { new: true }
      );
if(!updatedProduct) return res.status(404).send({status:false,message:"file not found"})

      return res.status(200).send({ status: true,msg:"successfully updated",data: updatedProduct });
      
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ status: false, msg: err.message });
    }
  };


  module.exports ={updateProductById,createProduct}