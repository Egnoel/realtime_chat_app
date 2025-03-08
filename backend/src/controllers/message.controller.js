import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.lib.js';
import { getReceiverSocketID, io } from '../lib/socket.js';

export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    console.log('My Id: ', myId);
    console.log('User to chat Id: ', userToChatId);
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages', error.message);
    res.status(404).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      text,
      image: imageUrl,
      senderId,
      receiverId,
    });
    await newMessage.save();
    const receiverSocketId = getReceiverSocketID(receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit('newMessage', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage', error);
    res.status(404).json({ message: error.message });
  }
};
