const mongoose=require("mongoose");
const profileSchema = new mongoose.Schema({
  userId:{
   type:mongoose.Schema.ObjectId,ref:"User",
   required:true
  },
  fullName: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "Hey there! I'm using Chat App.",
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
  },
  role: {
    type: String,
    default: "user",
  },
}, { timestamps: true });

const Profile= mongoose.model("Profile",profileSchema);

module.exports=Profile;