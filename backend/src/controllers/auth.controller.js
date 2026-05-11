import { User, Volunteer, Organisation, Admin } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExist = await User.findOne({ email });

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
        name,
        email,
        password: hashedPassword,
        ageGroup,
        resume: resumeUrl,
      });
    }

    if (role === "organisation") {
      // check if organisation provided biodata
      const { biodata } = req.body;

      if (!biodata) {
        return res.status(400).json({
          message: "Biodata is required for organisations.",
        });
      }

      // create organisation User (newUser)
      newUser = new Organisation({
        name,
        email,
        password: hashedPassword,
        biodata,
      });
    }

    if (role === "admin") {
      // create admin User (newUser)
      newUser = new Admin({
        name,
        email,
        password: hashedPassword,
        approvalStatus: "approved",
      });
    }

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        approvalStatus: newUser.approvalStatus,
        ageGroup: newUser.ageGroup || "",
        resume: newUser.resume || "",
        biodata: newUser.biodata || "",
      });
    } else {
      res.status(400).json({
        message: "Invalid user data.",
      });
    }
  } catch (err) {
    console.log("Error in signup controller: ", err.message);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist. " });
    }

    // compare the password inserted by user with the hashed password stored in DB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password." });
    }

    if (user.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "User account has not been approved by admin yet",
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      ageGroup: user.ageGroup || "",
      biodata: user.biodata || "",
      approvalStatus: user.approvalStatus,
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
    // clear the jwt token
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout succesfully" });
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
}
