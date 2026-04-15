const iapService = require('../services/iap.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const verifyPurchase = asyncHandler(async (req, res) => {
  const result = await iapService.verifyPurchase(req.user.id, req.body);
  ApiResponse.success(res, result, 'تم الشراء بنجاح');
});

// Apple App Store Server Notifications V2 webhook
// Handles refunds and other lifecycle events
const appleNotifications = asyncHandler(async (req, res) => {
  const { signedPayload } = req.body;
  if (!signedPayload) return ApiResponse.error(res, 'invalid payload', 400);

  // TODO: Decode signed JWS payload from Apple
  // For now, accept a basic shape: { notificationType, transactionId }
  const { notificationType, transactionId } = req.body;

  if (notificationType === 'REFUND' && transactionId) {
    await iapService.handleRefund(transactionId);
  }

  // Apple expects 200 OK
  res.status(200).json({ received: true });
});

const listPackages = asyncHandler(async (req, res) => {
  const packages = Object.entries(iapService.PACKAGES).map(([productId, p]) => ({
    productId,
    gems: p.gems,
    gold: p.gold,
  }));
  ApiResponse.success(res, packages);
});

module.exports = { verifyPurchase, appleNotifications, listPackages };
