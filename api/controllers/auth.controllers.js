import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log(newUser);
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  //db
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(500).json({ message: "User not found" });
    }
    const age = 1000 * 60 * 60 * 24 * 7;
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: true
      },
      process.env.JWT_KEY,
      { expiresIn: age }
    );
    const { password: userPassword, ...userInfo } = user;
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: age,

      })
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.log("Failed to Login");
    res.status(500).json({ message: "Failed to Login" });
  }
};
export const logout = (req, res) => {
  try {
    res.clearCookie("token").status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.error("Failed to clear token cookie:", error);
    res.status(500).json({ message: "Failed to logout" });
  }
};
