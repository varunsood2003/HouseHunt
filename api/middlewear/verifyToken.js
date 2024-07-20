import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  console.log(req.cookies);
  console.log(req.cookies.token);
  if (!token) {
    return res.status(401).json({ message: "Not Authenticated!" });
  }
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });
    req.userId = payload.id;
    console.log(payload);
    next();
  });
};
