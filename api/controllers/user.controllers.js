import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to Get Users!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to Get User!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const userTokenid = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== userTokenid) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    let updatedPassword = null;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });
    const {password:OtherPass,...restother}= updatedUser;
    console.log(restother);
    res.status(200).json(restother);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to Update User!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const userTokenid = req.userId;

  if (id !== userTokenid) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User Deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to Delete User!" });
  }
};
export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const existingSavedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId: postId,
        }
      }
    });

    if (existingSavedPost) {
      await prisma.savedPost.delete({
        where: {
          id: existingSavedPost.id
        }
      });
      res.status(200).json({ message: "Post removed from saved List" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId: postId
        }
      });
      res.status(200).json({ message: "Post saved to saved List" });
    }
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Failed to save post" });
  }
};



export const profilePosts = async(req,res)=>{
  const tokenUserId = req.params.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where:{
        userId: tokenUserId,
      }
    })
    const saved = await prisma.savedPost.findMany({
      where:{
        userId: tokenUserId,
      },
      include:{
        post: true
      }
    });
    const savedPosts = saved.map(item=> item.post);
    res.status(200).json({userPosts,savedPosts});

  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Failed to get Profile posts"});
  }
}
