const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
let razorpay = null;

function initRazorpay() {
  if (razorpay) return razorpay;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('⚠️  Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    return null;
  }

  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  return razorpay;
}

// Create subscription
async function createSubscription(planId, userId, userEmail) {
  const razorpayInstance = initRazorpay();

  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }

  try {
    // Create Razorpay subscription
    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: {
        user_id: userId.toString(),
        email: userEmail
      }
    });

    return {
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url
    };
  } catch (error) {
    console.error('Razorpay subscription error:', error);
    throw error;
  }
}

// Create order for one-time payment
async function createOrder(amount, currency, userId, plan) {
  const razorpayInstance = initRazorpay();

  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise (smallest currency unit)
      currency: currency || 'INR',
      receipt: `rcpt_${userId}_${Date.now()}`,
      notes: {
        user_id: userId.toString(),
        plan: plan
      }
    });

    return order;
  } catch (error) {
    console.error('Razorpay order error:', error);
    throw error;
  }
}

// Verify payment signature
function verifyPaymentSignature(orderId, paymentId, signature) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Verify webhook signature
function verifyWebhookSignature(payload, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  Razorpay webhook secret not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return expectedSignature === signature;
}

// Cancel subscription
async function cancelSubscription(subscriptionId) {
  const razorpayInstance = initRazorpay();

  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }

  try {
    const subscription = await razorpayInstance.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Razorpay cancel subscription error:', error);
    throw error;
  }
}

// Get subscription details
async function getSubscription(subscriptionId) {
  const razorpayInstance = initRazorpay();

  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }

  try {
    const subscription = await razorpayInstance.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Razorpay fetch subscription error:', error);
    throw error;
  }
}

module.exports = {
  initRazorpay,
  createSubscription,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  cancelSubscription,
  getSubscription
};
