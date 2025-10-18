// controllers/auth.js

import User from '../models/User.js';

// Get token from model and send response
const sendTokenResponse = (user, statusCode, res, msg) => {
  // Create token
  const token = user.getSignedJwtToken();

  res
    .status(statusCode)
    .json({
      success: true,
      msg: msg,
      token,
    });
};

// @desc      Check if an admin account exists
// @route     GET /api/v1/auth/admin-exists
// @access    Public
export const adminExists = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({
      success: true,
      exists: count > 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc      Register user (ONLY ONE ADMIN)
// @route     POST /api/v1/auth/register
// @access    Public
export const register = async (req, res, next) => {
  try {
    const adminExists = await User.countDocuments();
    if (adminExists > 0) {
        return res.status(403).json({ success: false, error: 'Registration is closed. An admin already exists.'});
    }

    const { name, email, password } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 200, res, 'Admin registered successfully');

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch(error) {
     res.status(400).json({ success: false, error: error.message });
  }
};


// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
export const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
};


// @desc      Transfer admin ownership
// @route     POST /api/v1/auth/transfer-ownership
// @access    Private
export const transferOwnership = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide name, email, and password for the new admin.'});
        }

        // Create the new admin
        const newAdmin = await User.create({ name, email, password });

        // Delete the old admin (the one making the request)
        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({ success: true, data: `Ownership transferred to ${newAdmin.name}. The previous admin account has been deleted.` });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};