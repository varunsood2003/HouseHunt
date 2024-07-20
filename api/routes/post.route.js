import express from "express";
import {verifyToken} from "../middlewear/verifyToken.js"
import {getHome, addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.controllers.js";
const router = express.Router();

router.get("/",getPosts);
router.get("/home",getHome);
router.get("/:id",getPost);
router.post("/",verifyToken,addPost);
router.put("/:id",updatePost);
router.delete("/:id",deletePost);

export default router;