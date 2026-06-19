import jwt from "jsonwebtoken";
import { UserModel } from "../Models/UserModel.js";

const { verify, sign } = jwt;

export const verifyToken = () => {
  return async (req, res, next) => {
    try {
      let token;

      //get token from Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      //check token existed or not
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided."
        });
      }

      //validate token (decode the token)
      const decoded = verify(token, process.env.JWT_SECRET);

      //get user from decoded token
      const user = await UserModel.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid. User not found."
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated."
        });
      }

      //add user to req
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired."
      });
    }
  };
};

//create jwt for a user id
export const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d"
  });
};
