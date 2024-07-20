import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken"; // Ensure jwt is imported

// Get Posts
export const getPosts = async (req, res) => {
  const query = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 1000000,
        },
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Posts" });
  }
};

// Get Single Post
export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
        if (err) {
          return res.status(200).json({ ...post, isSaved: false });
        }

        const saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });

        res.status(200).json({ ...post, isSaved: saved ? true : false });
      });
    } else {
      res.status(200).json({ ...post, isSaved: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get Post" });
  }
};

// Get Home
export const getHome = (req, res) => {
  console.log("ye");
  res.status(200).send("Home endpoint");
};

// Update Post
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: body,
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update Post" });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }
    await prisma.post.delete({
      where: { id },
    });
    res.status(200).json({ message: "Post deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete Post" });
  }
};

// Add Post
export const addPost = async (req, res) => {
  const { postData, postDetail } = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...postData,
        userId: tokenUserId,
        postDetail: {
          create: postDetail,
        },
      },
    });
    console.log("New Post:", newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ message: "Failed to add Post" });
  }
};
