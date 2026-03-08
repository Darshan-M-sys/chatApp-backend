const express = require("express");
const Message = require("../models/messageModel");
const Profile = require("../models/profile");
const messageRouter = express.Router();

// Get messages between two users
messageRouter.get("/:receiverId", async (req, res) => {

  try {
   
   const  profile = await Profile.findOne({userId:req.session.userId._id})
    const senderId = profile._id;
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });

  }

});

module.exports = messageRouter;