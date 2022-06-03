const productModel = require("../Models/productModel");
const aws = require("aws-sdk");
const mongoose = require("mongoose");

//----------------configuration----------------
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile = async (file) => {                           //-----------------function for upload file to aws and return the link---
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });   // -----------we will be using the s3 service of aws----

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "abc/" + file.originalname,
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

//------------------------validation-------------------------------------

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isvalidRequestBody = function (requestbody) {
  return Object.keys(requestbody).length > 0;
}

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}



//============================================================ create product controller ==================================================================//



const createProduct = async function (req, res) {

  try {

       let data = req.body

       if (!isvalidRequestBody(data)) {
          return res.status(400).send({ status: false, message: "data not found" });

       } else {

       let availableSizes = req.body.availableSizes


       const { title, description, price, currencyId, currencyFormat, style, isFreeShipping, installments } = data;

       //---------------------------validation start from here--------------------------------------------------------------//

       //--------validation for title & unique title-------------

       if (!title) return res.status(400).send({ status: false, message: "title is required" })

       if (!isValid(title)) return res.status(400).send({ status: false, message: "please enter valid title" })

       let duplicateTitle = await productModel.findOne({ title: title })

       if (duplicateTitle) return res.status(400).send({ status: false, message: "title is already present" })

       //----------validation for description-----

       if (!description) return res.status(400).send({ status: false, message: "description is required" })

       if (!isValid(description)) return res.status(400).send({ status: false, message: "please enter valid description" })

       //-----------validation for price---------

       if (!price) return res.status(400).send({ status: false, message: "price is required" })

       if (!Number(price)) return res.status(400).send({ status: false, message: "please enter valid price" })

       if (Number(price) <= 0) return res.status(400).send({ status: false, message: "price is not valid" })

       if (!/^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(price)) return res.status(400).send({ status: false, message: "price should be valid number/decimal" })

       //------------validatio for currencyId---------

       if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" })

       if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "please enter valid currencyId " })

       if (data.currencyId != "INR") return res.status(400).send({ status: false, message: "currencyId should be in INR only" })

       //-------------validation for currency format---------

       if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is required" })

       if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "please enter valid currencyformat " })

       if (data.currencyFormat != "₹") return res.status(400).send({ status: false, message: "currencyFormat should be in ₹ only" })

       //---------------validation for style----------------

       if (!isValid(style)) return res.status(400).send({ status: false, message: "please enter valid style" })

       //---------------validation for is free shipping-----------

       if (isFreeShipping === "") return res.status(400).send({ status: false, message: "isFreeShipping is not empty string" })

       if (isFreeShipping) {
         if (!["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping is boolean" })
       }

       //-------------validation for avaiable Sizes--(available sizes=> array of strings)--------------

       if (availableSizes.length == 0 || !availableSizes) return res.status(400).send({ status: false, message: 'available size cannot be empty' })
       let arr = availableSizes.split(",").map(el => el.trim())
       for (let size of arr) {
         if (!["XS", "X", "S", "M", "L", "XL", "XXL"].includes(size)) return res.status(400).send({ status: false, message: "size parmeter can only take XS , X , S , M , L , XL , XXL these values" })
       }
       data["availableSizes"] = arr

       //-------------validation for installments------------

       if (!Number(installments)) return res.status(400).send({ status: false, message: "please enter valid installments" })
       if (Number(installments) <= 0) return res.status(400).send({ status: false, message: "intallments is not valid" })


    }
     //-----------------upload to s3 and get the uploaded link--------

     let files = req.files
     if (files && files.length > 0) {
       let uploadedproductImage = await uploadFile(files[0])
       data["productImage"] = uploadedproductImage

     }

     let createProduct = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Product created successfully", data: createProduct })

  } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
  }

}



//============================================== get product by query controller =========================================================================//



const isValidName = (name) => {
  return /^[a-zA-Z ]{3,30}$/.test(name)
}

const isValidAvailableSizes = (size) => {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size) == true
}

const getProductByQuery = async (req, res) => {
  try {

      const queryParams = req.query

      let { size, name, priceGreaterThan, priceLessThan,priceSort } = queryParams

      const filterQuery = { isDeleted: false, ...req.query }

      if (size) {
        if (!size) return res.status(400).send({ status: false, message: "provide size" })

        if (!isValidAvailableSizes(size))
            return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
        filterQuery['availableSizes'] = size

      }

      if (priceGreaterThan) {
        if (!(/^(0|[1-9][0-9]*)$/.test(priceGreaterThan)))
            return res.status(400).send({ status: false, message: "provide priceGreaterThan in numeric" })
        filterQuery['price'] = { $gt: priceGreaterThan }
      }

      if (priceLessThan) {
        if (!(/^(0|[1-9][0-9]*)$/.test(priceLessThan)))
           return res.status(400).send({ status: false, message: "provide priceLessThan in numeric" })
        filterQuery['price'] = { $lt: priceLessThan }
      }

      if (name) {
        if (!isValidName(name))
           return res.status(400).send({ status: false, message: 'name is invalid' })
        filterQuery['title'] = name
      }



  
      if(priceSort==1){
        const products = await productModel.find({ ...filterQuery }).sort({ price: 1 })


      if (!(products.length)) return res.status(404).send({ status: false, message: 'No products found' })
          return res.status(200).send({ status: true, message: "Product details", data: products })
        }

     if(priceSort==-1){      
       const products = await productModel.find({ ...filterQuery }).sort({ price: -1 })


      if (!(products.length)) return res.status(404).send({ status: false, message: 'No products found' })
          return res.status(200).send({ status: true, message: "Product details", data: products })
        }

      const products = await productModel.find({ ...filterQuery })


      if (!(products.length)) return res.status(404).send({ status: false, message: 'No products found' })
          return res.status(200).send({ status: true, message: "Product details", data: products })

   } catch (err) {
       return res.status(500).send({ status: false, Error: err.message })
  }

}



//======================================= get product by Id controller =========================================================================//



const getProductById = async function (req, res) {

  try {

      let productId = req.params.productId

      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" })

      let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })

      if (!findProduct) return res.status(400).send({ status: false, message: "Product Not Found" })

      return res.status(200).send({ status: true, message: "Product details", data: findProduct })

  } catch (err) {
      return res.status(500).send({ status: false, Error: err.message })
  }

}



//=============================================== update product controller =================================================================//



const updateProductById = async function (req, res) {

  try {

      let productId = req.params.productId;

      //-------------------Id validation-----------

      if (!isValidObjectId(productId))
          return res.status(400).send({ status: false, message: "Not a valid product ID" });

       //-------------Id verification---------------

      let productDetails = await productModel.findById(productId);
      if (!productDetails)
          return res.status(404).send({ status: false, message: "product not found." });

      let data = req.body;


      let availableSizes = req.body.availableSizes

      let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, installments } = data;

      //------------checking for title alreay exits or not-------------
      if (title === "") return res.status(400).send({ status: false, message: "title can't be empty" })

      let findTitle = await productModel.findOne({ title })
      if (findTitle) return res.status(400).send({ status: false, message: "product already with this title" })

      //-----------validation for description----------
      if (description === "") return res.status(400).send({ status: false, message: "description can't be empty" })

      //-----------validation for price----------------
      if (price === "") return res.status(400).send({ status: false, message: "price can't be empty" })

      if (price) {
        if (!Number(price)) return res.status(400).send({ status: false, message: "please enter valid price" })
        if (Number(price) <= 0) return res.status(400).send({ status: false, message: "price is not valid" })
      }

      if (price) if (!(/^[1-9]\d{0,7}(?:\.\d{1,4})?$/.test(price))) return res.status(400).send({ status: false, message: "price should be in numeric/decimal" })

      //------------validation for currencyId-----------
      if (currencyId === "") return res.status(400).send({ status: false, message: "currencyId can't be empty" })

      if (currencyId) if (!(/\bINR\b/.test(currencyId))) return res.status(400).send({ status: false, message: "only INR , no other currency is accepted" })

      //------------validation for currency format----------
      if (currencyFormat === "") return res.status(400).send({ status: false, message: "currencyFormat can't be empty" })

      if (currencyFormat) if (currencyFormat != "₹") return res.status(400).send({ status: false, message: "currencyFormat should be in ₹ only" })

      //-------------validation for isfree shipping--------
      if (isFreeShipping === "") return res.status(400).send({ status: false, message: "isFreeShipping is not empty string" })

      if (isFreeShipping) {
        if (!["true", "false"].includes(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping is boolean" })
      }

      //-------------validation for style----------------
      if (style === "") return res.status(400).send({ status: false, message: "style can't be empty" })

      //------------validation for available sizes-------
      if (availableSizes === "") return res.status(400).send({ status: false, message: "availableSizes can't be empty" })

      if (availableSizes) {
        let arr = availableSizes.split(",").map(el => el.trim())
        for (let availableSizes of arr) {
          if (!["XS", "X", "S", "M", "L", "XL", "XXL"].includes(availableSizes)) return res.status(400).send({ status: false, message: "size parmeter can only take XS , X , S , M , L , XL , XXL these values" })
        }

        data["availableSizes"] = arr
      }

      //------------validation for installments-----------
      if (installments === "") return res.status(400).send({ status: false, message: "installments can't be empty" })

      if (installments) if (!(/^(0|[1-9][0-9]*)$/.test(installments))) return res.status(400).send({ status: false, message: "installments is numeric" })


      //------------upload to s3 and get the uploaded link----

      let files = req.files                   // whatever the key is , doesnt matter
      if (files && files.length > 0) {
        var uploadedProductImage = await uploadFile(files[0])
        data["productImage"] = uploadedProductImage

      }

      let updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { ...data, updatedAt: Date.now() }, { new: true });

      if (!updatedProduct) return res.status(404).send({ status: false, message: "product not found" })

      return res.status(200).send({ status: true, message: "Product updated successfull", data: updatedProduct });

   } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
  }

};



//================================================ delete product controller ====================================================================//



const deleteProduct = async function (req, res) {

  try {

      let ProductId = req.params.productId;

      if (!isValidObjectId(ProductId)) {
          return res.status(400).send({ status: false, message: "product Id is  Invalid" })
      }

      let productdata = await productModel.findOne({ _id: ProductId, isDeleted: false });

      if (!productdata) {
          return res.status(404).send({ status: false, message: "Product Data is deleted" });
      }
      await productModel.findOneAndUpdate({ _id: ProductId }, { isDeleted: true, deletedAt: Date() }, { new: true });

          return res.status(200).send({ status: true, message: "Product deleted successfull" });

   } catch (err) {
          return res.status(500).send({ status: false, message: err.message });
   }

 }



module.exports = { createProduct, getProductByQuery, deleteProduct, getProductById, updateProductById }
