const { LedgerAccount, LedgerEntry } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Double-Entry Accounting Financial Ledger Service
 * Ensures absolute traceability of every rupee across platform wallets, escrows, and payouts.
 */
class LedgerService {
  /**
   * Get or create ledger account for a user or system entity
   */
  static async getOrCreateAccount(userId, accountType, session = null) {
    let account = await LedgerAccount.findOne({ userId, accountType }).session(session);
    if (!account) {
      account = new LedgerAccount({
        accountNumber: `ACC-${accountType.toUpperCase()}-${uuidv4().substring(0, 8)}`,
        accountType,
        userId,
        balance: 0,
        status: 'active'
      });
      await account.save({ session });
    }
    return account;
  }

  /**
   * Record a double-entry ledger transaction:
   * Debit from one account, Credit to another.
   */
  static async recordDoubleEntry({
    debitAccountId,
    creditAccountId,
    amount,
    entryType,
    narrative,
    transactionId = null,
    session = null
  }) {
    if (amount <= 0) {
      throw new Error('Ledger entry amount must be greater than zero');
    }

    const debitAccount = await LedgerAccount.findById(debitAccountId).session(session);
    const creditAccount = await LedgerAccount.findById(creditAccountId).session(session);

    if (!debitAccount || !creditAccount) {
      throw new Error('Debit or Credit ledger account not found');
    }

    // Deduct from debit account, add to credit account
    debitAccount.balance = Math.round((debitAccount.balance - amount) * 100) / 100;
    creditAccount.balance = Math.round((creditAccount.balance + amount) * 100) / 100;

    await debitAccount.save({ session });
    await creditAccount.save({ session });

    const entry = new LedgerEntry({
      entryReference: `LEDGER-${Date.now()}-${uuidv4().substring(0, 6)}`,
      transactionId,
      debitAccountId,
      creditAccountId,
      amount,
      narrative,
      entryType,
      timestamp: new Date()
    });

    await entry.save({ session });
    return entry;
  }

  /**
   * Helper: System Escrow Holding Account
   */
  static async getSystemEscrowAccount(session = null) {
    let escrow = await LedgerAccount.findOne({ accountType: 'escrow_holding', userId: null }).session(session);
    if (!escrow) {
      escrow = new LedgerAccount({
        accountNumber: 'ACC-SYSTEM-ESCROW-001',
        accountType: 'escrow_holding',
        userId: null,
        balance: 0,
        status: 'active'
      });
      await escrow.save({ session });
    }
    return escrow;
  }
}

module.exports = LedgerService;
