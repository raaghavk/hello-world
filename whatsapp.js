const axios = require('axios');

// WhatsApp notification service for India
// Works with WATI.io, Interakt, or similar services

const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_FROM_NUMBER = process.env.WHATSAPP_FROM_NUMBER;

// Send WhatsApp message
async function sendWhatsAppMessage(phoneNumber, message) {
  if (!WHATSAPP_ENABLED) {
    console.log(`📱 [WhatsApp DISABLED] Would send to ${phoneNumber}: ${message}`);
    return { success: false, reason: 'WhatsApp not enabled' };
  }

  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.warn('⚠️  WhatsApp not configured. Please set WHATSAPP_* variables in .env');
    return { success: false, reason: 'WhatsApp not configured' };
  }

  try {
    // Format phone number (remove + and spaces)
    const formattedPhone = phoneNumber.replace(/[+\s]/g, '');

    // WATI.io format (adjust for your provider)
    const payload = {
      whatsappNumber: formattedPhone,
      message: message
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ WhatsApp sent to ${phoneNumber}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error.message);
    return { success: false, error: error.message };
  }
}

// Send downtime alert via WhatsApp
async function sendWhatsAppDownAlert(phoneNumber, monitorName, url) {
  const message = `🔴 *ALERT: Website Down!*

Your website *${monitorName}* is currently DOWN.

🌐 URL: ${url}
⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

We are continuously monitoring and will notify you when it comes back online.

- Uptime Monitor`;

  return sendWhatsAppMessage(phoneNumber, message);
}

// Send recovery alert via WhatsApp
async function sendWhatsAppUpAlert(phoneNumber, monitorName, url) {
  const message = `✅ *GOOD NEWS: Website Back Online!*

Your website *${monitorName}* is now UP and running.

🌐 URL: ${url}
⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Everything is working normally now!

- Uptime Monitor`;

  return sendWhatsAppMessage(phoneNumber, message);
}

// Send welcome message via WhatsApp
async function sendWhatsAppWelcome(phoneNumber, email) {
  const message = `🎉 *Welcome to Uptime Monitor!*

Thank you for signing up!

You can now monitor your websites 24/7 and get instant WhatsApp alerts when they go down.

📧 Your email: ${email}
📱 Alerts will be sent to this WhatsApp number

Need help? Just reply to this message!

- Uptime Monitor Team`;

  return sendWhatsAppMessage(phoneNumber, message);
}

// Test WhatsApp configuration
async function testWhatsApp() {
  const testNumber = process.env.ADMIN_PHONE || '+919876543210';
  console.log(`📱 Sending test WhatsApp to ${testNumber}...`);

  const result = await sendWhatsAppMessage(
    testNumber,
    '🧪 Test message from Uptime Monitor!\n\nIf you received this, WhatsApp is configured correctly! ✅'
  );

  if (result.success) {
    console.log('✅ Test WhatsApp sent successfully!');
  } else {
    console.log('❌ Test WhatsApp failed:', result.reason || result.error);
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppDownAlert,
  sendWhatsAppUpAlert,
  sendWhatsAppWelcome,
  testWhatsApp
};
