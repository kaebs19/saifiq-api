const { User, Transaction, IapTransaction, sequelize } = require('../models');
const AppError = require('../utils/AppError');

// ── Product packages ──
const PACKAGES = {
  'com.saifiq.gems.50':   { gems: 50,   gold: 0 },
  'com.saifiq.gems.300':  { gems: 300,  gold: 0 },
  'com.saifiq.gems.700':  { gems: 700,  gold: 0 },
  'com.saifiq.gems.1500': { gems: 1500, gold: 200 },
  'com.saifiq.gems.5000': { gems: 5000, gold: 1000 },
};

// ── Apple verification (stub — trust client mode for MVP) ──
// TODO: Integrate with Apple App Store Server API (StoreKit 2)
// Docs: https://developer.apple.com/documentation/appstoreserverapi
const verifyWithApple = async (transactionId) => {
  // For now, we trust the client. In production:
  // 1. Sign JWT with Apple private key
  // 2. GET https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}
  // 3. Validate: bundleId, productId matches, not revoked
  return { verified: true, payload: null };
};

// ── Verify purchase ──
const verifyPurchase = async (userId, { productId, transactionId }) => {
  const pkg = PACKAGES[productId];
  if (!pkg) throw new AppError('المنتج غير معروف', 400);

  // Prevent duplicate use of same transactionId
  const existing = await IapTransaction.findOne({ where: { transactionId } });
  if (existing) throw new AppError('تم استخدام هذه المعاملة مسبقاً', 409);

  // Verify with Apple (currently trust-mode)
  const { verified, payload } = await verifyWithApple(transactionId);
  if (!verified) throw new AppError('فشل التحقق من المعاملة', 400);

  // Apply credits in a transaction
  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: true, transaction: t });
    if (!user) throw new AppError('المستخدم غير موجود', 404);

    await user.update({
      gems: user.gems + pkg.gems,
      gold: user.gold + pkg.gold,
    }, { transaction: t });

    await IapTransaction.create({
      userId,
      platform: 'apple',
      productId,
      transactionId,
      gemsAdded: pkg.gems,
      goldAdded: pkg.gold,
      status: 'verified',
      rawPayload: payload,
    }, { transaction: t });

    // Log in main Transaction table (gems)
    if (pkg.gems > 0) {
      await Transaction.create({
        userId,
        amount: pkg.gems,
        type: 'iap',
        currency: 'gems',
        description: `شراء ${productId}`,
      }, { transaction: t });
    }
    // Log gold bonus if any
    if (pkg.gold > 0) {
      await Transaction.create({
        userId,
        amount: pkg.gold,
        type: 'iap',
        currency: 'gold',
        description: `مكافأة ذهب من شراء ${productId}`,
      }, { transaction: t });
    }

    return {
      gemsAdded: pkg.gems,
      goldAdded: pkg.gold,
      newGems: user.gems + pkg.gems,
      newGold: user.gold + pkg.gold,
    };
  });

  return result;
};

// ── Handle Apple refund notification ──
const handleRefund = async (transactionId) => {
  const iap = await IapTransaction.findOne({ where: { transactionId } });
  if (!iap || iap.status === 'refunded') return null;

  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(iap.userId, { lock: true, transaction: t });
    if (user) {
      await user.update({
        gems: Math.max(0, user.gems - iap.gemsAdded),
        gold: Math.max(0, user.gold - iap.goldAdded),
      }, { transaction: t });
    }

    await iap.update({ status: 'refunded' }, { transaction: t });

    if (iap.gemsAdded > 0) {
      await Transaction.create({
        userId: iap.userId,
        amount: -iap.gemsAdded,
        type: 'refund',
        currency: 'gems',
        description: `استرداد ${iap.productId}`,
      }, { transaction: t });
    }
    if (iap.goldAdded > 0) {
      await Transaction.create({
        userId: iap.userId,
        amount: -iap.goldAdded,
        type: 'refund',
        currency: 'gold',
        description: `استرداد ${iap.productId}`,
      }, { transaction: t });
    }
  });

  return iap;
};

module.exports = { verifyPurchase, handleRefund, PACKAGES };
