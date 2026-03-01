const nodemailer = require('nodemailer');

// Create email transporter
let transporter = null;

function initEmailTransporter() {
  if (transporter) return transporter;

  const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // Check if email is configured
  if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️  Email not configured. Notifications will be logged but not sent.');
    return null;
  }

  transporter = nodemailer.createTransport(emailConfig);
  return transporter;
}

// Send email
async function sendEmail(to, subject, text) {
  const emailTransporter = initEmailTransporter();

  if (!emailTransporter) {
    console.log(`📧 [EMAIL NOT CONFIGURED] To: ${to}, Subject: ${subject}`);
    console.log(`   Message: ${text.substring(0, 100)}...`);
    return { success: false, reason: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
}

// Send welcome email
async function sendWelcomeEmail(email) {
  const subject = 'Welcome to Uptime Monitor!';
  const text = `
    Welcome to Uptime Monitor!

    Thank you for signing up. You can now start monitoring your websites.

    To get started:
    1. Log in to your dashboard
    2. Click "Add Monitor"
    3. Enter your website URL and name
    4. We'll notify you immediately if your site goes down

    Questions? Reply to this email anytime.

    Best regards,
    The Uptime Monitor Team
  `;

  return sendEmail(email, subject, text);
}

// Test email configuration
async function testEmail() {
  const testAddress = process.env.ADMIN_EMAIL || 'test@example.com';
  console.log(`📧 Sending test email to ${testAddress}...`);

  const result = await sendEmail(
    testAddress,
    'Test Email - Uptime Monitor',
    'This is a test email from your Uptime Monitor service. If you received this, email is configured correctly!'
  );

  if (result.success) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.log('❌ Test email failed:', result.reason || result.error);
  }
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  testEmail
};
