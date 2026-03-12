const twilio = require('twilio');

// Initialize Twilio client only if credentials are provided
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
exports.sendOTP = async (mobileNumber, otp) => {
  try {
    // In development or if Twilio not configured, just log the OTP
    if (!client) {
      console.log(`\n📱 OTP for ${mobileNumber}: ${otp}\n`);
      return { success: true, message: 'OTP logged in console (dev mode)' };
    }

    // In production, send via Twilio
    const message = await client.messages.create({
      body: `Your Meals4All OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber}`
    });

    return { success: true, message: 'OTP sent successfully', sid: message.sid };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
};

// Verify OTP expiry (10 minutes)
exports.isOTPValid = (otpExpiry) => {
  return new Date() < new Date(otpExpiry);
};

