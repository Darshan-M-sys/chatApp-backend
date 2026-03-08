const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  }
}, { timestamps: true });

 const FriendRequest= mongoose.model("FriendRequest", friendRequestSchema);
 module.exports=FriendRequest;