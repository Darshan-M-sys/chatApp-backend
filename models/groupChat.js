const mongoose=require("mongoose");
const groupChatSchema= new mongoose.Schema({
   createdBy:{type:mongoose.Schema.ObjectId,ref:"Profile"},
   admins:[{
    type:mongoose.Schema.ObjectId,ref:"Profile"
   }],
   members:[{
    type:mongoose.Schema.ObjectId,ref:"Profile"
   }],
   groupName:{
    type:String,required:true
   },
   groupImage:{
    type:String,
   },
   groupBio:{
    type:String,
    default:"Hey there this is for you!"
   },
  isDeleted:{
  type:Boolean,
  default:false
 }
},{timestamps:true})


const GroupChat= mongoose.model("GroupChat",groupChatSchema);
module.exports=GroupChat;