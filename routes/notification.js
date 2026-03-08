const express = require("express");
const Notification = require("../models/notification");
const Profile = require("../models/profile");

const notificationRouter = express.Router();

notificationRouter.get("/",async(req,res)=>{

  try{

    const userId = req.session.userId._id;

    const profile = await Profile.findOne({userId:userId});

    const notifications = await Notification
    .find({receiver:profile._id})
    .populate("sender")
    .sort({createdAt:-1})

    res.json({data:notifications})

  }catch(error){

    res.status(500).json({msg:"Server Error"})

  }

})

module.exports = notificationRouter;