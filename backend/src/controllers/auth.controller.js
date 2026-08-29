import { User, Volunteer, Organisation } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

const PUBLIC_SIGNUP_ROLES = ["volunteer", "organisation"];

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!normalizedName) {
      return res.status(400).json({ message: "Name is required." });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    if (typeof password !== "string" || !passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
    }

    if (!PUBLIC_SIGNUP_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role. Public signup is only available for volunteers and organisations.",
      });
    }

    const userExist = await User.findOne({ email: normalizedEmail, deletedAt: null });

    if (userExist) {
      return res.status(400).json({
        message: "User already exist.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;

    if (role === "volunteer") {
      // check if volunteer provided age group and resume
      const { ageGroup } = req.body;

      if (!ageGroup) {
        return res.status(400).json({
          message: "Age group is required for volunteers.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Resume PDF is required for volunteers.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "resumes",
            resource_type: "image",
            public_id: `resume-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            // format: 'pdf',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        stream.end(req.file.buffer);
      });

      const resumeUrl = result.secure_url;

      // create volunteer User (newUser)
      newUser = new Volunteer({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        ageGroup,
        resume: resumeUrl,
      });
    }

    if (role === "organisation") {
      // check if organisation provided biodata
      const { biodata } = req.body;

      if (typeof biodata !== "string" || !biodata.trim()) {
        return res.status(400).json({
          message: "Biodata is required for organisations.",
        });
      }

      // create organisation User (newUser)
      newUser = new Organisation({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        biodata: biodata.trim(),
      });
    }

    if (newUser) {
      await newUser.save();

      if (newUser.approvalStatus === "approved") {
        generateToken(newUser._id, res);
      }

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        approvalStatus: newUser.approvalStatus,
        avatar: newUser.avatar || "",
        ageGroup: newUser.ageGroup || "",
        resume: newUser.resume || "",
        biodata: newUser.biodata || "",
        skills: Array.isArray(newUser.skills) ? newUser.skills : [],
        availability: Array.isArray(newUser.availability)
          ? newUser.availability
          : [],
      });
    } else {
      res.status(400).json({
        message: "Invalid user data.",
      });
    }
  } catch (err) {
    console.log("Error in signup controller: ", err.message);
    const status = err.name === "ValidationError" || err.code === 11000 ? 400 : 500;
    res.status(status).json({
      message: status === 400 ? err.message : "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    const user = await User.findOne({ email: normalizedEmail, deletedAt: null }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // compare the password inserted by user with the hashed password stored in DB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "User account has not been approved by admin yet",
        approvalStatus: user.approvalStatus,
        role: user.role,
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ageGroup: user.ageGroup || "",
      biodata: user.biodata || "",
      approvalStatus: user.approvalStatus,
      avatar: user.avatar || "",
      resume: user.resume || "",
      skills: Array.isArray(user.skills) ? user.skills : [],
      availability: Array.isArray(user.availability) ? user.availability : [],
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.log("Error in logout controller: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
