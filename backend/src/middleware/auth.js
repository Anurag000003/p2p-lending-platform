const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');

/**
 * Authentication Middleware verifies JWT token and attaches user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended. Please contact administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Role-Based Access Control Middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const hasRole = req.user.roles.some(role => roles.includes(role)) || roles.includes(req.user.activeRole);
    if (!hasRole && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. One of [${roles.join(', ')}] roles required.`
      });
    }

    next();
  };
};

/**
 * KYC Verification Required Guard
 */
const requireKyc = (req, res, next) => {
  if (req.user && req.user.kycStatus !== 'verified' && !req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      message: 'KYC Verification is required to perform this financial activity.',
      kycStatus: req.user.kycStatus
    });
  }
  next();
};

/**
 * Audit Logging Helper Middleware
 */
const auditTrail = (action, entityType) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            userId: req.user._id,
            action,
            entityType,
            entityId: req.params.id || req.body.loanId || req.body.groupId || null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            status: 'success',
            metadata: { method: req.method, path: req.originalUrl }
          });
        } catch (err) {
          console.error('AuditLog write error:', err.message);
        }
      }
    });
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requireKyc,
  auditTrail
};
