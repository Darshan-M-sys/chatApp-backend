const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true
  },

  message: {
    type: String,
    required: true
  },

  seen: {
    type: Boolean,
    default: false
  }

},{
  timestamps: true
});
const Message= mongoose.model("Message", messageSchema);
module.exports=Message 