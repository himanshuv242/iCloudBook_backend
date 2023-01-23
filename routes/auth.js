const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


const JWT_SECRET = 'Harryisagoodb$oy'//signature

//Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser',[

    //validations
    body('name','Enter a valid name').isLength({min:3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password','password must be atleast 5 characters').isLength({min:5}),

],async(req,res)=>{
  //If there are error, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Check whether the user with this email exists already
    try{
    let user =await User.findOne({email:req.body.email});
    if(user){
      return res.status(400).json({error:"Sorry a user with this mail already exists"})
    }
    const salt = await bcrypt.genSalt(10);//to generate salt
    const secPass = await bcrypt.hash(req.body.password,salt);//mark await cause it return promiss

    //Saving data to database and creating a new user
    user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
       });
       const data = {
        user:{
          id:user.id
        }
       }
       const authtoken = jwt.sign(data, JWT_SECRET);

    // res.json(user)
    res.json({authtoken});//sending token 

      } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error")
      }
})


//Authenticate a User using : POST"/api/auth/login". No Login Required
router.post('/login',[

  //validations
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),

],async(req,res)=>{

 //If there are error, return Bad request and the errors
 const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({error:errors.array()});
  }

  const {email, password}=req.body;

  try {
    let user = await User.findOne({email});
    //if user do not exist
    if(!user)
    {
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }

    const passwordCompare = await bcrypt.compare(password,user.password);
    if(!passwordCompare)
    {
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }

    const data = {
      user:{
        id:user.id
      }
     }
     const authtoken = jwt.sign(data, JWT_SECRET);
     res.json({authtoken});//sending token 

  } catch (error) {
    console.log(error.message);
        res.status(500).send("Internal server error")
  }

})

module.exports = router