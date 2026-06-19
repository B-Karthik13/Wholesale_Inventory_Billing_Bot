import exp from "express";
import { body } from "express-validator";
import { UserModel } from "../Models/UserModel.js";
import { verifyToken, generateToken } from "../middlewares/verifyToken.js";
import { validate } from "../middlewares/validate.js";

export const authApp = exp.Router();

//Route for register
authApp.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase, and a number")
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      //check if email already exists
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists"
        });
      }

      //create new user document
      const user = await UserModel.create({ name, email, password });

      //send res
      res.status(201).json({
        success: true,
        message: "Account created successfully. Please log in.",
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Server error during registration"
      });
    }
  }
);

//Route for login
authApp.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      //find user by email
      const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      //compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Contact support."
        });
      }

      //create jwt
      const token = generateToken(user._id);

      //send res
      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Server error during login"
      });
    }
  }
);

//Get current user profile (protected route)
authApp.get("/me", verifyToken(), async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Update profile/company settings
authApp.put("/profile", verifyToken(), async (req, res) => {
  try {
    const { name, company } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      { name, company },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Change password
authApp.put("/change-password", verifyToken(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
