const mongoose=require("mongoose");
const groupChatMessageSchema= new mongoose.Schema(
  {
    groupId:{
      type:mongoose.Schema.ObjectId,ref:"GroupChat"
    },
    senderId:{
         type:mongoose.Schema.ObjectId,ref:"Profile"
    },
    message:{
      type:String
    },
    messageType:{
    type:String,
    enum:["text","pdf","doc","link"],
    default:"text"
    },
    isDeleted:{
      type:Boolean,
      default:false
    }
  },{timestamps:true}
);

const GroupChatMessage= mongoose.model("GroupChatMessage");
module.exports= GroupChatMessage;