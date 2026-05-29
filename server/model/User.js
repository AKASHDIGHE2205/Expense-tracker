import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    mobile: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    ProfilePic: String,
    isActive: {
      type: Boolean,
      default: true
    },
    otp: String,
    isAdmin: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["A", "I", "D", "B"],
      default: "A"
    },
    plane : {
      type: String,
      enum: ["Free", "Premium"],
      default: "Free"
    }
  },
  { timestamps: true }
);

const Users = mongoose.model("User", userSchema);
export default Users;