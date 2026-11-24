const { KYCApplication, User, Notification } = require('../models');
const { kycSubmitSchema } = require('../validators/schemas');

class KycController {
  static async submitKYC(req, res) {
    try {
      const validated = kycSubmitSchema.parse(req.body);

      let kyc = await KYCApplication.findOne({ userId: req.user._id });
      if (kyc && kyc.status === 'approved') {
        return res.status(400).json({ success: false, message: 'KYC is already approved' });
      }

      if (kyc) {
        kyc.documentType = validated.documentType;
        kyc.documentNumber = validated.documentNumber;
        kyc.documentFrontUrl = validated.documentFrontUrl;
        kyc.documentBackUrl = validated.documentBackUrl || '';
        kyc.selfieUrl = validated.selfieUrl;
        kyc.proofOfIncomeUrl = validated.proofOfIncomeUrl || '';
        kyc.status = 'pending';
        kyc.rejectionReason = '';
        await kyc.save();
      } else {
        kyc = new KYCApplication({
          userId: req.user._id,
          ...validated,
          status: 'pending'
        });
        await kyc.save();
      }

      req.user.kycStatus = 'pending';
      req.user.kycApplicationId = kyc._id;
      await req.user.save();

      return res.status(201).json({
        success: true,
        message: 'KYC application submitted successfully and is pending review',
        kyc
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getKYCStatus(req, res) {
    try {
      const kyc = await KYCApplication.findOne({ userId: req.user._id });
      return res.json({
        success: true,
        kycStatus: req.user.kycStatus,
        application: kyc
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Auto-verify helper for testing/development speed
  static async instantVerifyDev(req, res) {
    try {
      req.user.kycStatus = 'verified';
      await req.user.save();

      await KYCApplication.findOneAndUpdate(
        { userId: req.user._id },
        { status: 'approved', reviewedAt: new Date() },
        { upsert: true }
      );

      return res.json({
        success: true,
        message: 'Instant KYC verified for testing environment'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = KycController;
