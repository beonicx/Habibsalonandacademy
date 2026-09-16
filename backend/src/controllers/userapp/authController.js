const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "1h" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Refresh token expired, please login again" });
    }
    return res.status(403).json({ error: "Invalid refresh token" });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
}

async function googleAuth(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        if (picture && !user.profileImage) user.profileImage = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        profileImage: picture || "",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
}

module.exports = { register, login, refreshToken, getProfile, updateProfile, googleAuth };
