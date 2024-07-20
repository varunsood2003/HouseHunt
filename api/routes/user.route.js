import express from "express";
import { savePost,deleteUser, getUser, getUsers, updateUser,profilePosts } from "../controllers/user.controllers.js";
import {verifyToken} from "../middlewear/verifyToken.js"
const router = express.Router();

router.get("/",verifyToken,getUsers)
// router.get("/:id",verifyToken,getUser)
router.put("/:id",verifyToken,updateUser)
router.delete("/:id",verifyToken,deleteUser)
router.post("/save",verifyToken,savePost)
router.get("/profilePosts",verifyToken,profilePosts)

export default router;