const express = require('express');
const viewCompanyRouter = express.Router();
const { companyAuth } = require('../middlewares/auth');
const TransportCompany = require('../models/transportCompany');


viewCompanyRouter.get('/viewCompany', companyAuth, async (req,res)=>{

   try { const companyList=await TransportCompany.find({})
   res.send(companyList);
   }
   catch(err){
    res.status(500).json({ error: "Unable to fetch Transport Companies Data" });
   }

})

viewCompanyRouter.get('/viewCompany/:companyId', companyAuth, async (req,res)=>{
    const {companyId} = req.params;

    try { const companyList=await TransportCompany.find({
        _id: companyId,
    })
    res.send(companyList);
 }
    catch(err){
     res.status(500).json({ error: "Unable to fetch this companies Data" });
    }
    })
 


module.exports=viewCompanyRouter;