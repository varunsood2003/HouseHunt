import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const addMessage =async(req,res) =>{
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;
  try {
    const chat = await prisma.chat.findUnique({
      where:{
        id: chatId,
        userIds: {
          hasSome:[tokenUserId]
        }
      }
    })
    if(!chat)res.status(404).json({message : "Chat does not exist"});
    const message = await prisma.message.create({
      data:{
        chatId,
        userId: tokenUserId,
        text
      }
    })
    await prisma.chat.update({
      where:{
        id: chatId,
      },
      data:{
        seenBy: [tokenUserId],
        lastMessage: text
      }
    })
    res.status(200).json(message)
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to Add Message"});
  }
}