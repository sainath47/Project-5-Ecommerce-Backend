const mongoose = require("mongoose");
const userModel = require("../Models/userModel.js");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");

//-----------------------------configuration---------------
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})


let uploadFile = async (file) => {                          //--------------function for upload file to aws and return link-----------
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });    //---- we will be using the s3 service of aws-------------

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

//---------------------------------validation-----------------------

const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  return true;
};

const isvalidRequestBody = function (requestbody) {
  return Object.keys(requestbody).length > 0;
}

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}



//============================================================ create user controller ==========================================================================//



const createUser = async function (req, res) {

  try {

    let data = req.body;

    if (!isvalidRequestBody(data)) {
           return res.status(400).send({ status: false, message: "data not found" });

    } else {

      const { fname, lname, email, phone, password, address } = data;

      const { shipping, billing } = address;
      //-----------------------------------------------validation start from here------------------------------------------------//

      //----------validation for fname  & unique name---------------

      if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" });
      }
      let uniqueFname = await userModel.findOne({ fname });
      if (uniqueFname){
            return res.status(400).send({ status: false, message: "first name already exist" });
      }

      //-----------validation for lname-----------------

      if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required" });
      }

      //------------validation for email & unique email---------------

      if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" });
      }

      let uniqueEmail = await userModel.findOne({ email });
      if (uniqueEmail){
            return res.status(400).send({ status: false, message: "email already exist" });
      }

      if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid email" });
      }

      //---------------validation for phone & unique phone---------------------

      if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone is required" });
      }
      let uniquePhone = await userModel.findOne({ phone });
      if (uniquePhone){
            return res.status(400).send({ status: false, message: "phone already exist" });
      }

      if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
            return res.status(400).send({ status: false, message: "please enter a valid phone" });
      }

      //-----------------validation for password-----------------------------

      if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" });
      }
      if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "password must be 8-15 characters" });
      }

      //-----------------Address Validation--------------------------------

      if (!address) {
            return res.status(400).send({ status: false, message: "address is required" });
      }

      //------------------validation for shipping address---------------------

      if (!shipping) {
            return res.status(400).send({ status: false, message: "shipping address is required" })
      }
      if (!isValid(shipping)) {
            return res.status(400).send({ status: false, message: "shipping address is invalid" })
      }

      if (!shipping.street) {
            return res.status(400).send({ status: false, message: "shipping street is required" });
      }
      if (!isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: "shipping street is invalid" });
      }

      if (!shipping.city) {
            return res.status(400).send({ status: false, message: "shipping city is required" });
      }
      if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "shipping city is invalid" });
      }

      if (!shipping.pincode) {
            return res.status(400).send({ status: false, message: "shipping pincode is required" });
      }
      if (!isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "shipping pincode is invalid" });
      }
      if (!/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "shipping pincode is invalid" });
      }

      //------------------validation for billing address------------------------------------

      if (!billing) {
            return res.status(400).send({ status: false, message: "billing address is required" })
      }
      if (!isValid(billing)) {
            return res.status(400).send({ status: false, message: "billing address is invalid" })
      }

      if (!billing.street) {
            return res.status(400).send({ status: false, message: "billing street is required" });
      }
      if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: "billing street is invalid" });
      }

      if (!billing.city) {
            return res.status(400).send({ status: false, message: "billing city is required" });
      }
      if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "billing city is invalid" });
      }

      if (!billing.pincode) {
            return res.status(400).send({ status: false, message: "billing pincode is required" });
      }
      if (!isValid(billing.pincode)) {
            return res.status(400).send({ status: false, message: "billing pincode is invalid" });
      }
      if (!/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(billing.pincode)) {
            return res.status(400).send({ status: false, message: "billing pincode is invalid" })
      }

    }

    //-------------------------upload profile image to s3 and get the uploaded link------------------

    let files = req.files
    if (files && files.length > 0) {
      let uploadedprofileImage = await uploadFile(files[0])
      data["profileImage"] = uploadedprofileImage

    }

    //-------------------------for encrypted password--------------------------------
    let password = req.body.password
    const saltRounds = 10
    data["password"] = await bcrypt.hash(password, saltRounds);

    let createUser = await userModel.create(data)
          return res.status(201).send({ status: true, message: "Success", data: createUser })

  } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
  }

};



//================================================ login user controller ====================================================================//



const userlogin = async function (req, res) {

  try {

    const email = req.body.email;
    const password = req.body.password;


    if (!email) {
        return res.status(400).send({ status: false, message: "email is required" })
    }

    if (!password) {
        return res.status(400).send({ status: false, message: "password is required" })
    }

    const validEmail = validator.isEmail(email)
    if (!validEmail) {
        return res.status(400).send({ status: false, message: "email is not valid" })
    }

    const checkedUser = await userModel.findOne({ email });
    if (!checkedUser) {
        return res.status(404).send({ status: false, message: "no user with this emailId" });
    }

    let userId = checkedUser._id.toString()

    const match = await bcrypt.compare(password, checkedUser.password);
    if (!match) {
        return res.status(400).send({ status: false, message: "password wrong" });
    }

    const token = jwt.sign(
      { userId },
      "functionUp",
      { expiresIn: '4d' });

    const result = { userId, token }
       return res.status(200).send({ status: true, message: "Success", data: result });

  }
  catch (error) {
       return res.status(500).send({ status: false, message: error.message })
  }

};



//======================================================== get user controller ==============================================================//



const getUserdata = async function (req, res) {

  try {

    let userId = req.params.userId

    if (!isValidObjectId(userId))
        return res.status(400).send({ status: false, message: "UserId is invalid" })

    let finddata = await userModel.findById(userId)
    if (!finddata) return res.status(404).send({ status: false, message: "No user found" })

        return res.status(200).send({ status: true, message: "Success", data: finddata })
  }

  catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
  }

}



//=================================================== update user controller ===================================================================//



const updateUserById = async function (req, res) {

  try {

    let userId = req.params.userId;

    //-------- Id validation---------

    if (!isValidObjectId(userId))
         return res.status(400).send({ status: false, message: "Not a valid user ID" });

    //---------Id verification-----------

    let userDetails = await userModel.findById(userId);
    if (!userDetails)
         return res.status(404).send({ status: false, message: "User not found." });

    let data = req.body;


    //-------for update required filled can't be blank---------

    if (Object.keys(req.body).length == 0 && (!req.profileImage))
        return res.status(400).send({ status: false, message: "NO INPUT BY USER" });

    let { fname, lname, email, phone, password, address } = data;

    //-------validation of fname-------
    if (fname === "") return res.status(400).send({ status: false, message: "fname can't be empty" })

    if (fname) {
      if (!isValid(fname)) return res.status(400).send({ status: false, message: "first Name is not valid" });
    }

    //------- validation of lname-------
    if (lname === "") return res.status(400).send({ status: false, message: "lname can't be empty" })

    if (lname) {
      if (!isValid(lname)) return res.status(400).send({ status: false, message: "last Name is not valid" });
    }

    //--------- valiation of email-------
    if (email === "") return res.status(400).send({ status: false, message: "email can't be empty" })

    if (email) {
      if (!isValid(email)) return res.status(400).send({ status: false, message: "email Id is not valid" });

      email = email.trim()
      if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))
          return res.status(400).send({ status: false, message: "email ID is not valid" });

      let dupEmail = await userModel.findOne({ email: email });
      if (dupEmail) return res.status(400).send({ status: false, message: "email is already registered" });

    }

    //-----------validation of phone--------
    if (phone === "") return res.status(400).send({ status: false, message: "phone can't be empty" })

    if (phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).send({ status: false, message: "phone number should be valid number", });

      let dupPhone = await userModel.findOne({ phone: phone });
      if (dupPhone) return res.status(400).send({ status: false, message: "phone is already registered" });
    }

    //------------validation of pasword-------
    if (password === "") return res.status(400).send({ status: false, message: "password can't be empty" })

    if (password) {
      if (password.length < 8 || password.length > 15) return res.status(400).send({ status: false, message: "Password length should be 8 to 15" });

      const saltRounds = 10
      var encryptedPassword = await bcrypt.hash(password, saltRounds);

    }

    //--------------validation of shipping & billing address---------
    if (address) {
      if (typeof (address) == 'string') address = JSON.parse(address)
      if (address.shipping) {
        if (address.shipping.city) {
          if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: 'shipping address city is not valid' })
          var shippingCity = address.shipping.city;
        }
        if (address.shipping.street) {
          if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: 'shipping address street is not valid' })
          var shippingStreet = address.shipping.street;
        }
        if (address.shipping.pincode) {
          if (!/^[1-9][0-9]{5}$/.test(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Please enter valid Pincode for shipping", });
          var shippingPincode = address.shipping.pincode;
        }

      }
      if (address.billing) {
        if (address.billing.city) {
          if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: 'billing address city is not valid' })
          var billingCity = address.billing.city;
        }
        if (address.billing.street) {
          if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: 'billing address street is not valid' })
          var billingStreet = address.billing.street;
        }
        if (address.billing.pincode) {
          if (!/^[1-9][0-9]{5}$/.test(address.billing.pincode)) return res.status(400).send({ status: false, message: "Please enter valid Pincode for billing", });
          var billingPincode = address.billing.pincode;
        }
      }

    }

    //------------upload profile image to s3 and get the uploaded link--------

    let files = req.files      // whatever the key is , doesnt matter
    if (files && files.length > 0) {
      var uploadedprofileImage = await uploadFile(files[0])


    }

    let updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          fname, lname, email, phone, profileImage: uploadedprofileImage, password: encryptedPassword,
          "address.shipping.city": shippingCity,
          "address.shipping.street": shippingStreet,
          "address.shipping.pincode": shippingPincode,
          "address.billing.city": billingCity,
          "address.billing.street": billingStreet,
          "address.billing.pincode": billingPincode,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );
    return res.status(200).send({ status: true, message: "Success", data: updatedUser });

  } catch (err) {
       return res.status(500).send({ status: false, message: err.message });
  }
};




module.exports = { createUser, userlogin, getUserdata, updateUserById }
