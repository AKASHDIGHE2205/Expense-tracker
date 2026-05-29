import Users from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const registerUser = async (req, res) => {
  try {

    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    //check existing user
    const userExists = await Users.findOne({
      $or: [
        { email },
        { mobile }
      ]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "User Registered",
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // email field contains email OR mobile

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Mobile & Password required"
      });
    }

    const user = await Users.findOne({
      $or: [
        { email: email },
        { mobile: email }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is deactivated. Please contact support."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // JWT token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      success: true,
      message: `Login Success! Welcome back, ${user.name}`,
      token,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        isAdmin: user.isAdmin || false
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { userId, email, newPassword, confirmPassword, oldPassword } = req.body;

    if ((!userId && !email) || !newPassword || !confirmPassword || !oldPassword) {
      return res.status(400).json({
        success: false,
        message:
          "UserId or Email/Mobile, old password, new password and confirm password are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Find user
    const user = await Users.findOne({
      $or: [
        ...(userId ? [{ _id: userId }] : []),
        ...(email ? [{ email: email }, { mobile: email }] : [])
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is deactivated. Please contact support."
      });
    }

    // ✅ STEP 1: Check OLD password is correct
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password"
      });
    }

    // ✅ STEP 2: Prevent same password reuse
    const isSameAsOld = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password"
      });
    }

    // ✅ STEP 3: Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};