const jwt=require('jsonwebtoken');
const TransportCompany= require('../models/transportCompany')

const companyAuth= async (req, res, next)=>{
    try{
    const {token}=req.cookies;
    if(!token){
        return res.status(401).send("Kindly Login")
    }
    const decodedData=await jwt.verify(token, 'LAD@123');
    const {_id}=decodedData;

    const company= await TransportCompany.findById(_id);
    if(!company){
        throw new Error("Company not found");
    }
    req.company=company;
    next();
}
    catch(err){
        res.status(400).send("There is some error"+ err);
    }
}

module.exports={companyAuth}