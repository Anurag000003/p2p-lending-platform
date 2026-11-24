const jwt = require('jsonwebtoken');
const { User, UserProfile, Notification } = require('../models');
const { registerSchema, loginSchema } = require('../validators/schemas');

class AuthController {
  static async register(req, res) {
    try {
      const validated = registerSchema.parse(req.body);

      const existingUser = await User.findOne({ email: validated.email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const role = validated.role || 'borrower';
      const user = new User({
        name: validated.name,
        email: validated.email,
        password: validated.password,
        phone: validated.phone,
        roles: [role],
        activeRole: role,
        isEmailVerified: true, // Auto-verified in development
        isPhoneVerified: true
      });

      await user.save();

      // Initialize matching user profile
      await UserProfile.create({
        userId: user._id,
        employment: { status: 'employed', monthlyIncome: 45000, annualIncome: 540000 },
        creditScore: 720
      });

      // Send initial welcome notification
      await Notification.create({
        recipientId: user._id,
        title: 'Welcome to P2P Lending Platform',
        message: 'Your account is ready. Complete your KYC to unlock full borrowing and lending capabilities.',
        type: 'system_alert'
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email, roles: user.roles },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles,
          activeRole: user.activeRole,
          isPhoneVerified: !!user.isPhoneVerified,
          aadhaarStatus: user.aadhaarStatus || 'unverified',
          panStatus: user.panStatus || 'unverified',
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance
        }
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async login(req, res) {
    try {
      const validated = loginSchema.parse(req.body);

      const user = await User.findOne({ email: validated.email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
      }

      const isMatch = await user.comparePassword(validated.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, roles: user.roles },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles,
          activeRole: user.activeRole,
          isPhoneVerified: !!user.isPhoneVerified,
          aadhaarStatus: user.aadhaarStatus || 'unverified',
          panStatus: user.panStatus || 'unverified',
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance
        }
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMe(req, res) {
    try {
      const profile = await UserProfile.findOne({ userId: req.user._id });
      return res.json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          roles: req.user.roles,
          activeRole: req.user.activeRole,
          isPhoneVerified: !!req.user.isPhoneVerified,
          aadhaarStatus: req.user.aadhaarStatus || 'unverified',
          panStatus: req.user.panStatus || 'unverified',
          kycStatus: req.user.kycStatus,
          walletBalance: req.user.walletBalance,
          profile
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async switchRole(req, res) {
    try {
      const { role } = req.body;
      if (!['borrower', 'lender', 'organizer'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      if (!req.user.roles.includes(role)) {
        req.user.roles.push(role);
      }
      req.user.activeRole = role;
      await req.user.save();

      return res.json({
        success: true,
        message: `Switched active role to ${role}`,
        activeRole: req.user.activeRole,
        roles: req.user.roles
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = AuthController;
