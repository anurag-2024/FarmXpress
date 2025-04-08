const express= require('express');
const profileRouter=express.Router();
const {validateEditData}= require('../utils/validation')
const {companyAuth} =  require('../middlewares/auth');
const TransportCompany = require('../models/transportCompany')


profileRouter.get('/profile',companyAuth, async(req, res)=>{
    try{
        const company= await req.company;
        res.send(company);
    }
    catch(err){
        res.status(400).send("There is some error"+ err);
    }
})

profileRouter.put('/profile/edit',companyAuth, async(req, res)=>{
   try { 
    validateEditData(req);
    const loggedInCompany= req.company;

    Object.keys(req.body).forEach((k)=>
        loggedInCompany[k]=req.body[k]
    )

    await loggedInCompany.save();

    res.send("Company deatils Updated Succesfully" + loggedInCompany);
}
    catch(err){
        res.status(400).send("There is some error"+ err);
    }
})


//While calling it in frontend make sure to call logout just after this!
profileRouter.delete('/profile/delete', companyAuth, async(req, res)=>{
    try{
        console.log(req.company);
        const companyId= req.company._id;
        console.log(companyId);

        const deletedCompany = await TransportCompany.findByIdAndDelete(companyId);
        if(!deletedCompany) throw new Error("Company Not Found");

        res.cookie("token", null, {expires: new Date(Date.now())});

        res.send(deletedCompany + "deleted Succesfully and User logged Out");


    }
    catch(err){
        res.status(400).send("There is some error"+ err);
    }
})

module.exports=profileRouter;