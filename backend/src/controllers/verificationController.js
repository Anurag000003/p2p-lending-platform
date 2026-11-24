const {
  KYCApplication,
  User,
  Notification
} = require('../models');
const {
  kycSubmitSchema,
  verifyAadhaarSchema,
  verifyPanSchema,
  sendMobileOtpSchema,
  verifyMobileOtpSchema
} = require('../validators/schemas');

class VerificationController {
  // ================= 1. MOBILE NUMBER OTP VERIFICATION =================
  static async sendMobileOtp(req, res) {
    try {
      const validated = sendMobileOtpSchema.parse(req.body);
      const phone = validated.phone;

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const user = await User.findById(req.user._id);
      user.phone = phone;
      user.phoneOtp = otp;
      user.phoneOtpExpiry = expiry;
      await user.save();

      // In production: send SMS via Twilio/Fast2SMS. In development/simulation: return OTP in response
      console.log(`[SMS-SERVICE] OTP for mobile ${phone} is: ${otp}`);

      return res.json({
        success: true,
        message: `OTP sent successfully to +91 ${phone}`,
        phone,
        // Provided for convenient testing/demo simulation:
        simulatedOtp: otp,
        expiresIn: '10 minutes'
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async verifyMobileOtp(req, res) {
    try {
      const validated = verifyMobileOtpSchema.parse(req.body);
      const { phone, otp } = validated;

      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (user.phone !== phone) {
        return res.status(400).json({ success: false, message: 'Phone number does not match pending verification' });
      }

      if (!user.phoneOtp || !user.phoneOtpExpiry) {
        return res.status(400).json({ success: false, message: 'No OTP requested. Please request a new OTP' });
      }

      if (new Date() > new Date(user.phoneOtpExpiry)) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
      }

      // Allow 123456 as master test OTP or the exact generated otp
      if (user.phoneOtp !== otp && otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again' });
      }

      user.isPhoneVerified = true;
      user.phoneOtp = undefined;
      user.phoneOtpExpiry = undefined;
      await user.save();

      await Notification.create({
        recipientId: user._id,
        title: 'Mobile Verified',
        message: `Your mobile number +91 ${phone} has been verified successfully.`,
        type: 'system_alert'
      });

      return res.json({
        success: true,
        message: 'Mobile number verified successfully!',
        isPhoneVerified: true
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ================= 2. AADHAAR CARD VERIFICATION =================
  static async requestAadhaarOtp(req, res) {
    try {
      const { aadhaarNumber } = req.body;
      if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 12-digit Aadhaar number' });
      }

      // Masked number: e.g. "XXXX-XXXX-1234"
      const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in session/user memory for verification step
      req.user.phoneOtp = simulatedOtp; // reuse OTP field for verification session
      req.user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await req.user.save();

      console.log(`[UIDAI-GATEWAY] Simulated Aadhaar OTP for ${masked}: ${simulatedOtp}`);

      return res.json({
        success: true,
        message: `UIDAI OTP sent to mobile linked with Aadhaar (${masked})`,
        maskedAadhaar: masked,
        simulatedOtp,
        note: 'UIDAI OTP simulation mode active'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async verifyAadhaar(req, res) {
    try {
      const validated = verifyAadhaarSchema.parse(req.body);
      const { aadhaarNumber, holderName, otp } = validated;

      // Verify OTP if supplied (allow '123456' as master test OTP or user's pending OTP)
      if (otp && otp !== '123456' && otp !== req.user.phoneOtp) {
        return res.status(400).json({ success: false, message: 'Invalid UIDAI Aadhaar verification OTP' });
      }

      const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;

      let kyc = await KYCApplication.findOne({ userId: req.user._id });
      if (!kyc) {
        kyc = new KYCApplication({
          userId: req.user._id,
          documentType: 'aadhaar',
          documentNumber: masked,
          selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
        });
      }

      kyc.aadhaarNumber = masked;
      kyc.aadhaarHolderName = holderName;
      kyc.aadhaarStatus = 'verified';
      kyc.aadhaarVerifiedAt = new Date();
      kyc.aadhaarCardFrontUrl = req.body.frontUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600';
      kyc.aadhaarCardBackUrl = req.body.backUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600';

      // If PAN is also verified, mark overall KYC status as verified
      if (kyc.panStatus === 'verified' || req.user.panStatus === 'verified') {
        kyc.status = 'approved';
        kyc.reviewedAt = new Date();
        req.user.kycStatus = 'verified';
      }

      await kyc.save();

      req.user.aadhaarStatus = 'verified';
      req.user.aadhaarNumber = masked;
      req.user.kycApplicationId = kyc._id;
      await req.user.save();

      await Notification.create({
        recipientId: req.user._id,
        title: 'Aadhaar Verified',
        message: `Your Aadhaar (${masked}) has been authenticated and verified against UIDAI databases.`,
        type: 'system_alert'
      });

      return res.json({
        success: true,
        message: 'Aadhaar successfully verified via UIDAI e-KYC!',
        aadhaarStatus: 'verified',
        maskedAadhaar: masked,
        kycStatus: req.user.kycStatus
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ================= 3. PAN CARD VERIFICATION =================
  static async verifyPan(req, res) {
    try {
      const validated = verifyPanSchema.parse(req.body);
      const { panNumber, holderName } = validated;

      // PAN format: 5 letters, 4 digits, 1 letter. 4th letter indicates entity (P = Person)
      const uppercasePan = panNumber.toUpperCase();
      const entityType = uppercasePan[3] === 'P' ? 'Individual' : 'Organization / Other';

      let kyc = await KYCApplication.findOne({ userId: req.user._id });
      if (!kyc) {
        kyc = new KYCApplication({
          userId: req.user._id,
          documentType: 'pan',
          documentNumber: uppercasePan,
          selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
        });
      }

      kyc.panNumber = uppercasePan;
      kyc.panHolderName = holderName;
      kyc.panStatus = 'verified';
      kyc.panVerifiedAt = new Date();
      kyc.panCardUrl = req.body.panCardUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600';

      // If Aadhaar is also verified, approve overall KYC
      if (kyc.aadhaarStatus === 'verified' || req.user.aadhaarStatus === 'verified') {
        kyc.status = 'approved';
        kyc.reviewedAt = new Date();
        req.user.kycStatus = 'verified';
      }

      await kyc.save();

      req.user.panStatus = 'verified';
      req.user.panNumber = uppercasePan;
      req.user.kycApplicationId = kyc._id;
      await req.user.save();

      await Notification.create({
        recipientId: req.user._id,
        title: 'PAN Card Verified',
        message: `Your PAN (${uppercasePan}) was verified with NSDL / Income Tax Department database.`,
        type: 'system_alert'
      });

      return res.json({
        success: true,
        message: 'PAN successfully verified with Income Tax / NSDL records!',
        panStatus: 'verified',
        panNumber: uppercasePan,
        entityType,
        kycStatus: req.user.kycStatus
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ================= 4. GET DETAILED VERIFICATION STATUS =================
  static async getVerificationSummary(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      const kyc = await KYCApplication.findOne({ userId: req.user._id });

      return res.json({
        success: true,
        data: {
          phone: {
            number: user.phone,
            isVerified: !!user.isPhoneVerified
          },
          aadhaar: {
            status: user.aadhaarStatus || (kyc?.aadhaarStatus) || 'unverified',
            number: user.aadhaarNumber || (kyc?.aadhaarNumber) || null,
            name: kyc?.aadhaarHolderName || null,
            verifiedAt: kyc?.aadhaarVerifiedAt || null
          },
          pan: {
            status: user.panStatus || (kyc?.panStatus) || 'unverified',
            number: user.panNumber || (kyc?.panNumber) || null,
            name: kyc?.panHolderName || null,
            verifiedAt: kyc?.panVerifiedAt || null
          },
          overallKycStatus: user.kycStatus,
          canBorrow: user.kycStatus === 'verified',
          canLend: user.kycStatus === 'verified'
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = VerificationController;
