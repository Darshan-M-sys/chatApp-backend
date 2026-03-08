const express = require("express");
const profileRouter = express.Router();
const upload =require("./imageUploadMiddleare")
const Profile = require("../models/profile");

// simple session authentication check (same as authRooute)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userId._id) {
    return next();
  }
  return res.status(401).json({ msg: "UnAuthenticated!" });
};

// multer configuration for profile picture uploads


// route to update profile picture
profileRouter.put(
  "/update",
  isAuthenticated,
  upload.single("photo"),
  async (req, res) => {
    try {
      const userId = req.session.userId._id;
      const profile = await Profile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({ msg: "Profile not found" });
      }
      profile.profilePicture = req.file? `http://${req.host}/uploads/profiles/${req.file.filename}`: profile.profilePicture;
      profile.fullName=req.body.fullName || profile.fullName;
      profile.bio= req.body.bio || profile.bio;
      await profile.save();

      res.status(200).json({ success: true, msg:"profile Updated", profile });
    } catch (err) {
      console.error(err);
      console.log(error.message)
      res.status(500).json({ msg: "Internal Server error" });
    }
  }
);

profileRouter.get("/",isAuthenticated,async(req,res)=>{
  try {
     const profileData= await Profile.findOne({userId:req.session.userId._id})
     if(!profileData){
      return res.json({msg:"Profile Not found"});
     }
     res.status(200).json({data:profileData});
  } catch (error) {
    res.status(500).json({msg:"Internal Server error"})
  }
})

profileRouter.get("/all",isAuthenticated,async(req,res)=>{
  try {
    const data = await Profile.find();
    res.status(200).json({data:data})
  } catch (error) {
   res.status(500).json({msg:"Internal Server Error!"}) 
  }
})

module.exports = profileRouter;