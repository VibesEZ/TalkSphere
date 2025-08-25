const User = require("../models/userModel");
const Chat = require("../models/chatModel"); // Import Chat model
const generateToken = require("../config/generateToken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Fetch all users
// GET /api/user
// Protected
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

// @desc    Register a new user
// @route   POST /api/user/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, profilePic } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Please enter all required fields" });
    return;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  // Generate username from email prefix
  let baseUsername = email.split("@")[0];
  let username = baseUsername;
  let counter = 1;

  // Ensure username is unique
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter++}`;
  }

  const user = await User.create({
    name,
    email,
    username,
    password,
    profilePic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      role: user.role, // Add this line
      token: generateToken(user._id, user.username),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Auth user with Google token
// @route   POST /api/user/google-login
// @access  Public
const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        profilePic: picture,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      token: generateToken(user._id, user.username),
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid Google token" });
  }
};


// @desc    Auth user & get token
// @route   POST /api/user/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      role: user.role, // Add this line
      token: generateToken(user._id, user.username),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// POST /forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with that email does not exist." });
    }

    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset OTP</title>
      <style>
        body { margin:0; padding:0; font-family:Arial, sans-serif; background:#f8f9fa; }
        .wrapper { max-width:600px; margin:0 auto; padding:20px; }
        .card { background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; }
        .card-content { padding:30px 40px; }
        .logo { text-align:center; margin-bottom:30px; }
        h1 { font-size:24px; font-weight:600; text-align:center; color:#333; margin:0 0 20px; }
        p { font-size:16px; color:#555; line-height:1.6; }
        .otp-section { text-align:center; margin:35px 0; }
        .otp-code { background:#e9ecef; color:#0d6efd; font-size:32px; font-weight:700; letter-spacing:5px;
          padding:15px 30px; border-radius:8px; border:1px dashed #adb5bd; }
        .footer { background:#f1f3f5; padding:25px 40px; text-align:center; font-size:13px; color:#888; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="card-content">
            <div class="logo">
              <img src="https://placehold.co/150x50/4A90E2/FFFFFF?text=TalkSphere" alt="TalkSphere Logo"/>
            </div>
            <h1>Your Password Reset Code</h1>
            <p>Hello <strong>${user.username || user.name || "there"}</strong>,</p>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            <div class="otp-section">
              <span class="otp-code">${otp}</span>
            </div>
            <p style="font-size:14px;text-align:center;">This code is valid for <strong>10 minutes</strong>.</p>
            <p style="font-size:14px;text-align:center;">If you didn’t request this, ignore the email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TalkSphere. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: `"TalkSphere" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔑 Your TalkSphere Password Reset Code",
      html: htmlTemplate,
    });

    res.status(200).json({ message: "OTP has been sent to your email address." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: error.message || "An internal server error occurred." });
  }
};

// POST /verify-reset-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (String(user.resetOTP) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOTPExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.resetOTP !== otp) return res.status(400).json({ message: "Invalid OTP" });
  if (user.resetOTPExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

  user.password = newPassword;
  user.resetOTP = undefined;
  user.resetOTPExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Protected
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.profilePic = req.body.profilePic || user.profilePic;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePic: updatedUser.profilePic,
      token: generateToken(updatedUser._id, updatedUser.username),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Protected
const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(401).json({ message: "Invalid current password" });
  }
};

// @desc    Delete a user
// @route   DELETE /api/user/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne(); // Corrected line
    res.json({ message: 'User removed' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user role
// @route   PUT /api/user/admin/users/:id
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// @desc    Get Admin Stats
// @route   GET /api/user/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const chatCount = await Chat.countDocuments();
    res.json({
      users: userCount,
      chats: chatCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  allUsers,
  updateUserProfile,
  updateUserPassword,
  getAdminStats,
  getUsers,
  deleteUser,
  updateUserRole,
  googleLogin,
};
