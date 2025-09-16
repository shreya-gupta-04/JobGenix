// backend/controllers/user.controller.js
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

/**
 * Helper: get authenticated user id from request
 * Adjust according to your auth middleware (some set req.user, some set req.id)
 */
const getAuthUserId = (req) => {
  return req.user?.userId || req.user?._id || req.id || req.userId || null;
};

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "Something is missing", success: false });
    }

    // optional file
    const file = req.file;
    let avatarUrl = null;

    if (file) {
      const dataUri = getDataUri(file); // should return a data URI string or null
      if (!dataUri) {
        return res.status(400).json({ message: "Invalid file uploaded", success: false });
      }
      const cloudResponse = await cloudinary.v2.uploader.upload(dataUri);
      avatarUrl = cloudResponse?.secure_url ?? null;
    }

    // check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exist with this email.", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        avatar: avatarUrl // use `profile.avatar` consistently
      }
    });

    return res.status(201).json({ message: "Account created successfully.", success: true });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Something is missing", success: false });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password.", success: false });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Incorrect email or password.", success: false });
    }

    if (role !== user.role) {
      return res.status(400).json({ message: "Account doesn't exist with current role.", success: false });
    }

    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

    // shape user object sent to client
    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
      })
      .json({ message: `Welcome back ${user.fullname}`, user: safeUser, success: true });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    return res.status(200).json({ message: "Logged out successfully.", success: true });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const file = req.file; // may be undefined
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated", success: false });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found.", success: false });

    // normalize skills -> array of trimmed strings
    let skillsArray;
    if (typeof skills === "string" && skills.trim().length > 0) {
      skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    // apply updates safely
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skillsArray) user.profile.skills = skillsArray;

    // If file provided: upload and set appropriate field
    if (file) {
      const dataUri = getDataUri(file);
      if (!dataUri) {
        return res.status(400).json({ message: "Invalid file provided", success: false });
      }
      const cloudResponse = await cloudinary.v2.uploader.upload(dataUri);

      // decide whether file is avatar (image) or resume (pdf) based on mimetype
      if (file.mimetype && file.mimetype.startsWith("image/")) {
        user.profile.avatar = cloudResponse?.secure_url ?? user.profile.avatar;
      } else if (file.mimetype === "application/pdf") {
        user.profile.resume = cloudResponse?.secure_url ?? user.profile.resume;
        user.profile.resumeOriginalName = file.originalname;
      } else {
        // for other upload types, you can decide where to save; here we save into a generic uploads array or ignore
        user.profile.upload = cloudResponse?.secure_url ?? user.profile.upload;
      }
    }

    await user.save();

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile
    };

    return res.status(200).json({ message: "Profile updated successfully.", user: safeUser, success: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
