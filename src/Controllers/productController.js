const productModel = require("../Models/productModel");
const aws = require("aws-sdk");
// const currency = require('currency-symbol-map');
const mongoose = require("mongoose");


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

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isvalidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}


const createProduct = async function (req, res) {
    try {

        let data = req.body

        if (!isvalidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "data not found" });
        } else {
          let availableSizes = req.body.availableSizes
            const { title, description, price, currencyId, currencyFormat,style, installments,isFreeShipping } = data;
            console.log(isFreeShipping)
            //validation for title
            if (!title) return res.status(400).send({ status: false, msg: "title is required" })

            if (!isValid(title)) return res.status(400).send({ status: false, msg: "please enter valid title" })

            let duplicateTitle = await productModel.findOne({ title: title })
            if (duplicateTitle) return res.status(400).send({ status: false, msg: "title is already present" })

            //validation for description
            if (!description) return res.status(400).send({ status: false, msg: "description is required" })

            if (!isValid(description)) return res.status(400).send({ status: false, msg: "please enter valid description" })

            //validation for price
            if (!price) return res.status(400).send({ status: false, msg: "price is required" })

            if (!Number(price)) return res.status(400).send({ status: false, msg: "please enter valid price" })

            if (Number(price) <= 0) return res.status(400).send({ status: false, msg: "price is not valid" })

            if (!/^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(price)) return res.status(400).send({ status: false, msg: "please enter valid price" })
            
            //validatio for currencyId
            if(!currencyId) return res.status(400).send({ status: false, msg: "currencyId is required" })

            if(!isValid(currencyId)) return res.status(400).send({ status: false, msg: "please enter valid currencyId "})

            if(data.currencyId !="INR") return res.status(400).send({ status: false, msg: "currencyId should be in INR only" })
            
            // validation for currency format
            if(!currencyFormat)  return res.status(400).send({ status: false, msg: "currencyFormat is required" })

            if(!isValid(currencyFormat)) return res.status(400).send({ status: false, msg: "please enter valid currencyformat "})
            
            if(data.currencyFormat != "₹") return res.status(400).send({ status: false, msg: "currencyFormat should be in ₹ only" })
            
            //validation for style
            if(!isValid(style)) return res.status(400).send({status:false,msg:"please enter valid style"})
            console.log(isFreeShipping)
// if(isFreeShipping){
//   if(isFreeShipping !== "true" || "false")return res.status(400).send({status:false,message:"isFreeShipping is boolean"})
//   if(isFreeShipping==null)return res.status(400).send({status:false,message:"isFreeShipping is boolean"})
// }
            

            //avaiable Sizes => array of strings
            if(availableSizes.length == 0 || !availableSizes) return res.status(400).send({status:false,msg: "available size cannot be empty"})
            let arr = availableSizes.split(" ")
            data["availableSizes"] = arr
          //  console.log(arr)
            for(let size of arr){
            if(!["XS", "X", "S", "M", "L", "XL", "XXL"].includes(size)) return res.status(400).send({status:false,msg:"size should be only in parmeter XS , X , S , M , L , XL , XXL "})
            }

            //validation for installments
            if(!Number(installments)) return res.status(400).send({status:false,msg:"please enter valid installments"})
            if(Number(installments) <= 0) return res.status(400).send({status:false,msg:"intallments is not valid"})
            

         }

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

const isValidName = (name) => {
  return /^[a-zA-Z ]{3,30}$/.test(name)
}

const isValidAvailableSizes = (size) => {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)==true 
}




const getProductByQuery = async (req, res) => {
  try{

    const queryParams = req.query
    let { size, name, priceGreaterThan, priceLessThan } = queryParams
      const filterQuery = { isDeleted: false,...req.query,}

   
      
     
    
   if(size) { 
     if(!size)  return res.status(400).send({ status: false, message: "provide size" })
      if (!isValidAvailableSizes(size))
        return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` }) 
        filterQuery['availableSizes'] = size 
      }
   if(priceGreaterThan) { 
    if(!(/^(0|[1-9][0-9]*)$/.test(priceGreaterThan)))
        return res.status(400).send({ status: false, message: "provide priceGreaterThan in numeric" }) 
        filterQuery['price'] ={$gt:priceGreaterThan}
      }
   if(priceLessThan) { 
    if(!(/^(0|[1-9][0-9]*)$/.test(priceLessThan)))
        return res.status(400).send({ status: false, message: "provide priceLessThan in numeric"}) 
        filterQuery['price'] = {  $lt:priceLessThan} 
      
      }

      // if (size!="S"|| "XS"|| "M"|| "X"|| "L"|| "XXL"|| "XL" ) 

      if (name) {
          if (!isValidName(name)) return res.status(400).send({ status: false, message: 'name is invalid' })
          filterQuery['title'] = name
      }


      const products = await productModel.find({...filterQuery}).sort({price: 1})
      
      // console.log(products)
      if (!(products.length)) return res.status(404).send({ status: false, message: 'No products found' })
      return res.status(200).send({ status: true, message: "Success", data: products })
  }
  catch (err) {
      return res.status(500).send({ Error: err.message })
  }
}

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}





const updateProductById = async function (req, res) {
  try {
    let productId = req.params.productId;

    // ID validation
    if (!isValidObjectId(productId))
      return res.status(400).send({ status: false, msg: "Not a valid product ID" });
    // Id verification
    let productDetails = await productModel.findById(productId);
    if (!productDetails)
      return res.status(404).send({ status: false, msg: "product not found." });

     let data = req.body;

    // if (Object.keys(req.body).length == 0 && (!req.profileImage))
    //   return res.status(400).send({ status: false, msg: "NO INPUT BY USER" }); //for update required filled can't be blank
    let availableSizes = req.body.availableSizes
    let { title,price,currencyId,currencyFormat,isFreeShipping,installments} = data;
    let findTitle = await productModel.findOne({title})
if(findTitle)return res.status(400).send({status:false,message:"product already with this title"}) 

if(price)if(!(/^(0|[1-9][0-9]*)$/.test(price)))return res.status(400).send({status:false,message:"price is numeric"})
if(currencyId)if(!(/\bINR\b/.test(currencyId)))return res.status(400).send({status:false,message:"only INR , no other currency is accepted"})
if(availableSizes)if(!(/^(S|XS|M|X|L|XXL|XL)$/.test(availableSizes))) return res.status(400).send({status:false,message:'"S", "XS", "M", "X", "L", "XXL", "XL" only this values'})


if(installments)if(!(/^(0|[1-9][0-9]*)$/.test(installments)))return res.status(400).send({status:false,message:"installments is numeric"})
if(isFreeShipping)if(isFreeShipping !== true || false)return res.status(400).send({status:false,message:"isFreeShipping isboolean"})

if(currencyFormat)if(currencyFormat != "₹") return res.status(400).send({ status: false, msg: "currencyFormat should be in ₹ only" })


if(availableSizes){

  let updateSize =productDetails.availableSizes
  productDetails.availableSizes.push(availableSizes)
 data["availableSizes"]=updateSize

// for(let i=0;i<updateSize.length;i++){
 
// if(!(availableSizes==updateSize[i])){
//    return res.status(200).send({ status: false,msg:"size already present", data:productDetails});


//   }


// }

}

 
    let files = req.files// whatever the key is , doesnt matter
    if (files && files.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      var uploadedProductImage = await uploadFile(files[0])
      data["productImage"] = uploadedProductImage

    }
  
    let updatedProduct = await productModel.findOneAndUpdate(
      { _id: productId ,isDeleted:false},
      {
         
        ...data,

        updatedAt: Date.now(),
        
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





const getProductById = async function (req, res) {
  try {
      let productId = req.params.productId
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" })

      let findProduct = await productModel.findOne({_id: productId, isDeleted: false})
      if (!findProduct) return res.status(400).send({ status: false, message: "Product Not Found" })

      return res.status(200).send({ status: true, message: "Success", data: findProduct })

  } catch (err) {
      return res.status(500).send({ status: false, Error: err.message })
  }
}





const deleteProduct = async  function(req, res)  {
  try {
      let ProductId = req.params.productId;
      if (!isValidObjectId(ProductId)) {
          return res.status(400).send({ status: false, message: "product Id is  Invalid" })
      }
      let productdata = await productModel.findOne({ _id: ProductId, isDeleted: false });
      if (!productdata) {
          return res.status(404).send({ status: false, message: "Product Data is deleted" });
      }
      let deleteproduct = await productModel.findOneAndUpdate({ _id: ProductId }, { isDeleted: true, deletedAt: Date() }, { new: true });
      return res.status(200).send({ status: true, message: 'deleted Successfully' });

  } catch (err) {
      return res.status(500).send({ message: err.message });
  }
}



module.exports = {createProduct,getProductByQuery,deleteProduct, getProductById,updateProductById}
