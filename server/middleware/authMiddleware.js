import jwt from "jsonwebtoken";
import Users from "../model/User.js";

const authMiddleware = async (req, res, next) => {

  try {

    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });

    }

    if (token.startsWith("Bearer")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify( token, process.env.JWT_SECRET );

    const user = await Users.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }
    req.user = user;
    next();

  }
  catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }

}

export default authMiddleware;