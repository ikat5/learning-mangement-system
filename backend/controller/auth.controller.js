// auth.controller.js
import { User } from "../model/user.model.js";
import { Learner } from "../model/learner.model.js";
import { Instructor } from "../model/instructor.model.js";
import { BankAccount } from "../model/bankAccount.model.js";
import { Admin } from "../model/Admin.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponce.js"; // kept your original filename
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * generateTokens(userId)
 * - finds user by id
 * - uses instance methods to generate tokens
 * - stores refreshToken on user and saves
 * - returns { accessToken, refreshToken }
 */
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found for token generation");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, {}, "Something went wrong in token generation");
  }
};

// ------------------------
// SIGNUP (Common Function)
// ------------------------
async function signupUser(req) {
  const {
    fullName,
    userName,
    phoneNumber,
    email,
    password,
    role,
    bank_account_number,
    bank_secret,
  } = req.body;

  // 1. Check existing user by email or username
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return { error: "Email already exists" };
  }
  const existingUserName = await User.findOne({ userName });
  if (existingUserName) {
    return { error: "Username already exists" };
  }

  // 2. Validate bank account existence and secret
  const bank = await BankAccount.findOne({ account_number: bank_account_number });
  if (!bank) return { error: "Bank account does not exist" };
  if (bank.secret_key !== bank_secret) return { error: "Invalid bank secret key" };

  // 3. Create user using role discriminator
  let roleModel;
  switch ((role || "").toLowerCase()) {
    case "learner":
      roleModel = Learner;
      break;
    case "instructor":
      roleModel = Instructor;
      break;
    case "admin":
      roleModel = Admin;
      break;
    default:
      return { error: "Invalid role provided" };
  }

  const user = await roleModel.create({
    fullName,
    userName,
    phoneNumber,
    email,
    password,
    role: role.charAt(0).toUpperCase() + role.slice(1), // normalize
    bank_account_number,
    bank_secret,
  });

  return { user };
}

// ------------------------
// LOGIN (Common Function)
// ------------------------
async function loginUser(req, role) {
  const { email, password } = req.body;

  // Find user with specific role
  const user = await User.findOne({ email, role });
  if (!user) return { error: "User not found" };

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) return { error: "Invalid password" };

  // generate tokens and save refresh token
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // return sanitized user (remove sensitive fields)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -bank_secret -bank_account_number"
  );

  return { user: loggedInUser, accessToken, refreshToken };
}

// ------------------------
// LOGOUT (Common Function)
// ------------------------
async function logoutUser(req, res) {
  const userId = req.user && req.user._id;
  if (!userId) {
    // If no user in request, just clear cookies
    const option = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    return res
      .status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  }

  // Nullify refresh token in DB
  await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } }, { new: true });

  const option = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
}

// ===========================
// EXPORT CONTROLLERS BY ROLE
// ===========================

// ---------- Learner ----------
export const learnerSignup = asyncHandler(async (req, res) => {
  const result = await signupUser(req);
  if (result.error) throw new ApiError(400, {}, result.error);

  return res
    .status(201)
    .json(new ApiResponse(201, { id: result.user._id, role: result.user.role }, "Signup successful"));
});

export const learnerLogin = asyncHandler(async (req, res) => {
  const result = await loginUser(req, "Learner");
  if (result.error) throw new ApiError(400, {}, result.error);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, cookieOptions)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        "User logged in successfully"
      )
    );
});

export const learnerLogout = asyncHandler(async (req, res) => {
  return logoutUser(req, res);
});

// ---------- Instructor ----------
export const instructorSignup = asyncHandler(async (req, res) => {
  // ensure role is Instructor in body or set it
  req.body.role = "Instructor";
  const result = await signupUser(req);
  if (result.error) throw new ApiError(400, {}, result.error);

  return res
    .status(201)
    .json(new ApiResponse(201, { id: result.user._id, role: result.user.role }, "Instructor created"));
});

export const instructorLogin = asyncHandler(async (req, res) => {
  const result = await loginUser(req, "Instructor");
  if (result.error) throw new ApiError(400, {}, result.error);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, cookieOptions)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        "Instructor logged in successfully"
      )
    );
});

export const instructorLogout = asyncHandler(async (req, res) => {
  return logoutUser(req, res);
});

// ---------- Admin ----------
export const adminSignup = asyncHandler(async (req, res) => {
  req.body.role = "Admin";
  const result = await signupUser(req);
  if (result.error) throw new ApiError(400, {}, result.error);

  return res
    .status(201)
    .json(new ApiResponse(201, { id: result.user._id, role: result.user.role }, "Admin created"));
});

export const adminLogin = asyncHandler(async (req, res) => {
  const result = await loginUser(req, "Admin");
  if (result.error) throw new ApiError(400, {}, result.error);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, cookieOptions)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        "Admin logged in successfully"
      )
    );
});

export const adminLogout = asyncHandler(async (req, res) => {
  return logoutUser(req, res);
});
