const express=require("express");
const FriendRequest = require("../models/friendRequest");
const Profile = require("../models/profile");
const Notification = require("../models/notification");
const friendRequestRouter= express.Router();
const isAuthenticated=(req,res,next)=>{
  if(req.session.userId){
    next();
  }else{
    return res.json({msg:"UnAuthenticated!"})
  }
}
friendRequestRouter.post("/invite/:receiverId",isAuthenticated,async(req,res)=>{
  try {

    const userId= req.session.userId._id;
    const profile= await Profile.findOne({userId:userId})

    const senderId= profile._id;
    const receiverId= req.params.receiverId;

    const existing= await FriendRequest.findOne({
      sender:senderId,
      receiver:receiverId
    })

    if(existing){
      return res.json({msg:"Request Already Sent"})
    }

    const data= await FriendRequest.create({
      sender:senderId,
      receiver:receiverId
    })

    // 🔔 CREATE NOTIFICATION
    await Notification.create({
      sender:senderId,
      receiver:receiverId,
      requestId:data._id,
      type:"friend_request",
      message:"sent you a friend request"
    })

    res.status(200).json({msg:"Request Sent!",data})

  } catch (error) {
    res.status(500).json({msg:"Internal Server Error!"})
  }
})

friendRequestRouter.get("/invite/:receiverId",isAuthenticated,async(req,res)=>{
  try {

    const userId = req.session.userId._id;

    const profile = await Profile.findOne({userId:userId});

    const senderId = profile._id;

    const receiverId = req.params.receiverId;

    const request = await FriendRequest.findOne({
      sender:senderId,
      receiver:receiverId
    });

    if(!request){
      return res.json({success:false});
    }

    if(request.status === "accepted"){
      return res.json({success:true,data:request});
    }

    res.json({
      success:true,
      msg:"Request Sent",
      data:request
    });

  } catch (error) {

    res.status(500).json({msg:"Internal Server Error!"})

  }
})

friendRequestRouter.get("/requests",isAuthenticated,async(req,res)=>{
  try {
    const userId= req.session.userId._id;
     const profile= await  Profile.findOne({userId:userId});
    const receiverId= profile._id;
     const data= await FriendRequest.find({receiver:receiverId}).populate(["sender","receiver"]);
     res.status(200).json({data:data})
  } catch (error) {
    console.log(error.message)
   res.status(500).json({msg:"Internal Server Error!"}) 
  }
})


friendRequestRouter.put("/response/:requestId",isAuthenticated,async(req,res)=>{
  try {

    const userId = req.session.userId._id;

    const profile = await Profile.findOne({userId:userId});

    const receiverId = profile._id;

    const requestId = req.params.requestId;

    const request = await FriendRequest.findOne({
      _id:requestId,
      receiver:receiverId
    });

    if(!request){
      return res.json({msg:"Request not found"});
    }

    request.status = req.body.status;
    await request.save();

    // ⭐ REMOVE NOTIFICATION
    await Notification.findOneAndDelete({
      requestId: requestId,
      receiver: receiverId
    });

    res.json({msg:`${req.body.status}`});

  } catch (error) {
    res.status(500).json({msg:"Internal Server Error"});
  }
});

friendRequestRouter.delete("/request/:requestId",isAuthenticated,async(req,res)=>{
  try {
   const userId= req.session.userId._id;
     const profile= await  Profile.findOne({userId:userId})
    const senderId= profile._id;
    const requestId= req.params.requestId;
    const data= await  FriendRequest.findOneAndDelete({_id:requestId,sender:senderId})
    if(!data){
      return res.json({msg:"Your not Sent Request"})
    }
     res.status(200).json({msg:"WithDraw"});
  } catch (error) {
    res.status(500).json({msg:"Internal server Error!"})
  }
})


friendRequestRouter.get("/friends", isAuthenticated, async (req, res) => {
  try {

    const userId = req.session.userId._id;

    const profile = await Profile.findOne({ userId });

    const profileId = profile._id;

    const requests = await FriendRequest.find({
      status: "accepted",
      $or: [
        { sender: profileId },
        { receiver: profileId }
      ]
    })
      .populate("sender")
      .populate("receiver");

    const friends = requests.map((req) => {

      if (req.sender._id.toString() === profileId.toString()) {
        return req.receiver;
      }

      return req.sender;

    });

    res.json({
      success: true,
      friends
    });

  } catch (error) {

    res.status(500).json({
      msg: "Internal Server Error"
    });

  }
});

module.exports= friendRequestRouter;