const express=require("express");
const authRouter=express.Router();
const bcrypt=require("bcryptjs");
const User = require("../models/user");
const Profile = require("../models/profile");

const isAuthenticated=(req,res,next)=>{
   if(req.session.userId && req.session.userId._id){
    next()
   }else{
    return res.json("UnAuthenticated!")
   }
}

authRouter.post("/register",async(req,res)=>{
  try {
    const {userName,email,password}=req.body;
    const existingUser=await User.findOne({email:email});
    if(existingUser){
      return res.json({msg:"Email Is Already Registered!"})
    }
    const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if(!emailPattern.test(email)){
      return res.json({msg:"Invalid Email Format!"})
    }
    
    const salt= await bcrypt.genSalt(10);
    const hashPass= await bcrypt.hash(password,salt)
    const authData= User.create({userName,email,password:hashPass});

     const createProfile= await Profile.create({ userId:(await authData)._id,fullName:userName,email:email})
    res.status(200).json({msg:"Registered Successful!",success:true,data:authData,profileData:createProfile});
  
  } catch (error) {
    res.status(500).json({msg:"Internal Server error"})
  }
})

authRouter.post("/login", async(req,res)=>{
  try {
    const {email,password}=req.body;
    
    if(!email || !password){
      return res.json({msg:"Email and Password are required!"})
    }
    
    const user=await User.findOne({email:email});
    if(!user){
      return res.json({msg:"User Not Found!"})
    }
    
    const isPasswordMatch=await bcrypt.compare(password,user.password);
    if(!isPasswordMatch){
      return res.json({msg:"Invalid Password!"})
    }

     req.session.userId=user;
    res.status(200).json({
      msg:"Login Successful!",
      success:true,
      data:user,
   
    });
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({msg:"Internal Server error"})
  }
})

authRouter.get("/",isAuthenticated,async(req,res)=>{
  try {
    const userId= req.session.userId._id;
    const user= await User.findOne({_id:userId});
    res.status(200).json({data:user})
  } catch (error) {
    res.status(500).json({msg:"Internal Server error!"})
  }
})

authRouter.post("/logout",isAuthenticated,async(req,res)=>{
  try {
    req.session.destroy((err)=>{
      if(err){
        return res.status(500).json({msg:"Logout Failed!"})
      }
      res.status(200).json({msg:"Logout Successful!",success:true})
    })
  } catch (error) {
    res.status(500).json({msg:"Internal Server error!"})
  }
})
module.exports=authRouter;
