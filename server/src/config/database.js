const mongoose= require("mongoose");

const connectDB= async()=>{
    await mongoose.connect("mongodb+srv://amru:amru_mongo@cluster0.mtx3t2d.mongodb.net/Farmxpress?retryWrites=true&w=majority&appName=Cluster0")
}

module.exports=connectDB
