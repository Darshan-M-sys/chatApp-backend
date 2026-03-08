const mongoose= require("mongoose");
const notificationSchema = new mongoose.Schema({

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile"
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile"
  },
  requestId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "FriendRequest"
  },

  type: {
    type: String,
    enum: ["friend_request", "accept", "message"]
  },
  message: String,
  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const Notification = mongoose.model("Notification",notificationSchema);
module.exports=Notification;