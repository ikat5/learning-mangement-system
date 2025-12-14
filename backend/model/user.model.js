import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },

  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["Admin", "Instructor", "Learner"] },

  bank_account_number: { type: String, required: true, unique: true },
  bank_secret: { type: String, required: true },

  refreshToken: { type: String, default: null },
}, {
  timestamps: true,
  discriminatorKey: "role"
});

// ===============================
// Hash Password Before Save
// ===============================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// ===============================
// Compare Password
// ===============================
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// ===============================
// Generate Access Token
// ===============================
userSchema.methods.generateAccessToken = function () {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is missing");
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

// ===============================
// Generate Refresh Token
// ===============================
userSchema.methods.generateRefreshToken = function () {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is missing");
  }

  return jwt.sign(
    {
      _id: this._id,
      role: this.role, // optional but useful
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
