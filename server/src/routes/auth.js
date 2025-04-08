const express= require('express');
const authRouter= express.Router();
const {validateSignupData}=require('../utils/validation')
const bcrypt = require('bcrypt');
const TransportCompany= require('../models/transportCompany');


authRouter.post('/signup', async (req, res)=>{
    try{
      validateSignupData(req);
      const {name, emailId, password, registrationNumber}= req.body;
      console.log(req.body);
      const Hashpassword= await bcrypt.hash(password, 10)
  
      const company= new TransportCompany({
          name, emailId, password:Hashpassword, registrationNumber
      });
      
      await company.save();
      const token= await company.getJWT();
      res.cookie("token", token);
      
      res.json({message: "Comapny Added Successfully", data: company})
     } 
  
     catch(err){
      res.status(400).send("There is an error" + err);
     }
  })

  authRouter.post('/login', async(req, res)=>{
    try{
        const {emailId, password}= req.body;
        const company= await TransportCompany.findOne({emailId: emailId});

        if(!company){
            throw new Error("Invalid Credentials")
        }
        const isPasswordValid= await company.validatePassword(password);

        if(isPasswordValid){
            const token= await company.getJWT();

            res.cookie("token", token);
            res.send(company);
        }

        else{
            throw new Error("Invalid Credentials")
        }
    }
    catch(err){
        res.status(400).send("There is some error" + err);
    }
})

authRouter.post('/logout', async(req, res)=>{
    res.cookie("token", null, {expires: new Date(Date.now())});
    res.send("LoggedOut Successfully");
})


module.exports= authRouter;