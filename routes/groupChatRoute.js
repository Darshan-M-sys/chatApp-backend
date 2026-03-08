const express= require("express");
const groupChatRoute=express.Router();

const upload=require("./imageUploadMiddleare");
const GroupChat = require("../models/groupChat");
const Profile = require("../models/profile");
const isAuthenticated= (req,res,next)=>{
  if(req.session.userId){
    next();
  }else{
    res.json({msg:"UnAuthenticated!"})
  }
}

groupChatRoute.post("/create",isAuthenticated,upload.single("groupImage"),async(req,res)=>{
  try {
    const userId=req.session.userId._id;
    const profile = await Profile.findOne({userId:userId})
    const createdBy= profile._id;
    const groupImage=req.file?"http://"+req.host+"/uploads/profiles/"+req.file.filename:null;
    const {groupName,groupBio}=req.body;
    const data= await GroupChat.create({groupImage:groupImage, createdBy:createdBy,admins:createdBy,groupName:groupName,groupBio:groupBio})
  res.status(200).json({success:true,msg:"Group Created Success",data:data})
  } catch (error) {
    res.status(500).json({msg:"Internal server error!"})
  }
})

groupChatRoute.delete("/delete/:groupId",isAuthenticated,async(req,res)=>{
try{
  const groupId=req.params.groupId;
   const userId= req.session.userId._id;
    const profile = await Profile.findOne({userId:userId})
    const createdBy= profile._id;
   const  data= await  GroupChat.findOne({_id:groupId,createdBy:createdBy});
   if(!data){
    return  res.json({msg:"you not to access"})
   }
   await  GroupChat.findOneAndDelete({_id:groupId,createdBy:createdBy});
   res.status(200).json({msg:"Deleted Success!"});
  }catch (error) {
   res.status(500).json({msg:"Internal Server error"});
  }
})

groupChatRoute.put("/update/:groupId",isAuthenticated,upload.single("groupImage"),async(req,res)=>{
  try {
    const  userId= req.session.userId._id;
 const profile = await Profile.findOne({userId:userId})
    const profileId= profile._id;
    const groupId= req.params.groupId;
    const data= await GroupChat.findOne({_id:groupId,admins:{$in:profileId}})
   if(!data){
    return res.json({msg:"Access not allowed"})
   }
    data.groupBio= req.body.groupBio || data.groupBio;
    data.groupName= req.body.groupName ||  data. groupName;
    data.groupImage= req.file?"http://"+req.host+"/uploads/profiles/"+req.file.filename: data.groupImage;
    await data.save();
    res.status(200).json({success:true,msg:"Updated!"})
  } catch (error) {
    res.status(500).json({msg:"Internal Server Error!"})
  }
})
groupChatRoute.put("/adding/:groupId/:memberId",isAuthenticated,async(req,res)=>{
  try {
     const userId= req.session.userId._id;
    const profile = await Profile.findOne({userId:userId})
     const profileId=profile._id;
     const groupId= req.params.groupId;
     const memberId=req.params.memberId;
     const data= await GroupChat.findOne({_id:groupId,admins:{$in:profileId}})
     if(!data){
      return res.json({msg:"Your not a admin"})
     }
     const existingMember= await GroupChat.findOne({_id:groupId,admins:{$in:profileId},members:{$in:memberId}});

     if(existingMember){
      return res.json({msg:"Member is Already joined"})
     }
   const updatedData= await GroupChat.findByIdAndUpdate({_id:groupId,admins:{$in:profileId}},{new:true,$push:{members:memberId}});
    res.status(200).json({ success:true,msg:"Added",updatedData})
    } catch (error) {
      console.log(error.message)
    res.status(500).json({msg:"Internal Server Error"})
  }
})


groupChatRoute.put("/removing/:groupId/:memberId",isAuthenticated,async(req,res)=>{
  try {
   const userId= req.session.userId._id;
    const profile = await Profile.findOne({userId:userId})
     const profileId=profile._id;
     const groupId= req.params.groupId;
     const memberId=req.params.memberId;
     const data= await GroupChat.findOne({_id:groupId,admins:{$in:profileId}})
     if(!data){
      return res.json({msg:"Your not a admin"})
     }
   const updatedData= await GroupChat.findByIdAndUpdate({_id:groupId,admins:{$in:profileId}},{new:true,$pull:{members:memberId}});
   res.status(200).json({success:true,msg:"Removed",updatedData})
  } catch (error) {
     res.status(500).json({msg:"Internal Server error!"})
  }
})


groupChatRoute.put("/exiting/:groupId",isAuthenticated,async(req,res)=>{
try {
    const userId=req.session.userId._id;
    const profile = await Profile.findOne({userId:userId})
   const profileId=profile._id;
  const groupId= req.params.groupId;
  
const isAdmin= await GroupChat.findOne({_id:groupId,admins:{$in:profileId}});

 if(isAdmin){
  return res.json({msg:"Admin not permission to exit"});
 }

 const updatedData= await GroupChat.findByIdAndUpdate({_id:groupId,members:{$in:profileId}},{new:true,$pull:{members:profileId}})
   res.status(200).json({success:true,msg:"exited"},updatedData)
} catch (error) {
  res.status(500).json({msg:"Internal Server error!"})
}
});
groupChatRoute.get("/",isAuthenticated,async(req,res)=>{
  try {
    const userId= req.session.userId._id;
     const profile = await Profile.findOne({userId:userId})
   const profileId=profile._id;
  const groupData= await GroupChat.find({$or:[
    {createdBy:profileId},
      {members:{$in:profileId}},
      {admins:{$in:profileId}},
  ]})
  res.status(200).json({data:groupData});
  } catch (error) {
   res.status(500).json({msg:"Internal Server Error!"}) 
  }
})

// groupChatRoute.get("/chat/:groupId",isAuthenticated,async(req,res)=>{
//   try {
   
//   } catch (error) {
//     res.status(500).json({msg:"Internal Server Error!"})
//   }
// })
module.exports=groupChatRoute;


