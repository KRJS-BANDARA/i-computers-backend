import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import OTP from "../models/opt.js";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
})

export async function createUser(req, res) {
  
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    //const newUser = new User(req.body)
    const newUser = new User({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: passwordHash,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function loginUser(req, res) {
  
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isBlocked: user.isBlocked,
          isEmailVerified: user.isEmailVerified,
          image: user.image,
        },
        process.env.JWT_SECRET_KEY,
      );
      res
        .status(200)
        .json({ message: "User authenticated successfully", token: token, isAdmin: user.isAdmin });
        console.log(token)

    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserInfo(req, res) {

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.isBlocked) {
      res.status(403).json({ message: "User is blocked" });
      return;
    }

    res.status(200).json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      isEmailVerified: user.isEmailVerified,
      image: user.image,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updatePassword(req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(
      req.body.password,
      10
    );

    await User.updateOne(
      { email: req.user.email },
      { password: hashedPassword }
    );

    res.status(200).json({
      message: "Password updated successfully"
    });
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfile(req, res) { 
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    await User.updateOne({ email: req.user.email },{firstName: req.body.firstName, lastName: req.body.lastName, image: req.body.image});
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function googleLogin(req, res) {
  try {
    const { accessToken } = req.body;

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let user = await User.findOne({
      email: response.data.email,
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);

      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = new User({
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        password: passwordHash,
        image: response.data.picture,
        isEmailVerified: true,
      });

      await user.save();
    }

    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
        isEmailVerified: user.isEmailVerified,
        image: user.image,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function sendOTP(req, res) {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
       
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
      
    }

    await OTP.deleteMany({ email });

      const otpNumber = Math.floor(100000 + Math.random() * 900000);
      const otpHash = await bcrypt.hash(otpNumber.toString(), 10);

      const newOTP = new OTP({
        email: email,
        otp: otpHash,
      });

      await newOTP.save();

      const message = {
        from: process.env.EMAIL,
        to: email,
        subject: "OTP for password reset",
        text: `Your OTP for password reset is ${otpNumber}. It is valid for 10 minutes.`,
      };

      await transporter.sendMail(message);
    
    res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function verifyOTP(req, res) {
  try {
    const email = req.body.email;
    const otp = req.body.otp;
    const password = req.body.password;

    const otpRecord = await OTP.findOne({ email: email });

    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }

    const currentTime = new Date();
    const otpTime = new Date(otpRecord.time);
    const timeDiff = (currentTime - otpTime) / (1000 * 60);

    if (timeDiff > 10) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isVerified = await bcrypt.compare(otp, otpRecord.otp);

    if (!isVerified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne({ email: email }, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successful" });
    

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAllUsers(req, res) {

  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const pageSizeInString = req.params.pageSize || "10"
        const pageNumberInString = req.params.pageNumber || "1"
        const pageSize = parseInt(pageSizeInString)
        const pageNumber = parseInt(pageNumberInString)
        const userCount = await User.countDocuments()
        const totalPages = Math.ceil(userCount / pageSize)

        const users = await User.find().skip((pageNumber - 1) * pageSize).limit(pageSize)
        res.json({
            users: users,
            totalPages: totalPages,
            currentPage: pageNumber,
            totalUsers: userCount 
        })
        return

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function switchRole(req, res) {
  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email }); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });   
    }
    if (user.email == req.user.email) {
      return res.status(400).json({ message: "Cannot switch role for yourself" });
    }
    
      await User.updateOne({ email: email }, { isAdmin: !user.isAdmin });
      return res.status(200).json({ message: "Role switched successfully" });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUserState(req, res) {
  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });  

    if (!user) {
      return res.status(404).json({ message: "User not found" });   
    }
    if (user.email == req.user.email) {
      return res.status(400).json({ message: "Cannot update state for yourself" });
    }
    
      await User.updateOne({ email: email }, { isBlocked: !user.isBlocked });
      return res.status(200).json({ message: "User state updated successfully" });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
    }