import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIds: {
          hasSome: [tokenUserId],
        },
      },
    });

    const chatsWithReceivers = await Promise.all(
      chats.map(async (chat) => {
        const receiverId = chat.userIds.find((id) => id !== tokenUserId);

        if (receiverId) {
          const receiver = await prisma.user.findUnique({
            where: {
              id: receiverId,
            },
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          });

          return { ...chat, receiver };
        } else {
          console.error('Receiver ID not found for chat:', chat);
          return { ...chat, receiver: null };
        }
      })
    );

    res.status(200).json(chatsWithReceivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Chats" });
  }
};


export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIds: {
          hasSome: [tokenUserId]
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const updatedSeenBy = Array.from(new Set([...chat.seenBy, tokenUserId]));

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: updatedSeenBy
      }
    });

    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get Chat" });
  }
}

export const addChat =  async (req,res) =>{
  const tokenUserId = req.userId;

  try {
    const newChat = await prisma.chat.create({
      data:{
        userIds: [tokenUserId,req.body.receiverId],
      }
    })
    console.log(newChat);
    res.status(200).json({message: "Chat added"})
  } catch (error) {
    console.log(error);
    res.status(500).json({message : "Failed to get Chats"});
  }
}
export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    // Retrieve the existing chat
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIds: {
          hasSome: [tokenUserId]
        }
      },
      select: {
        seenBy: true
      }
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const updatedSeenBy = Array.from(new Set([...chat.seenBy, tokenUserId]));

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: updatedSeenBy
      }
    });

    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update chat" });
  }
}
