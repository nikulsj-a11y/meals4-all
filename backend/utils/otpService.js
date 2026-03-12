// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via 2Factor.in (voice call)
exports.sendOTP = async (mobileNumber, otp) => {
  const apiKey = process.env.TWO_FACTOR_API_KEY;

  // If no API key, use dev/fallback mode
  if (!apiKey) {
    console.log(`\n📱 OTP for ${mobileNumber}: ${otp}\n`);
    return { success: true, message: 'OTP logged in console (dev mode)' };
  }

  try {
    const response = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/${mobileNumber}/${otp}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (data.Status === 'Success') {
      console.log(`✅ OTP sent to ${mobileNumber} via 2Factor.in (voice call)`);
      return { success: true, message: 'OTP sent via voice call' };
    } else {
      console.error('2Factor.in error:', data.Details);
      console.log(`\n📱 OTP for ${mobileNumber}: ${otp} (2Factor.in failed, using fallback)\n`);
      return { success: true, message: 'OTP logged in console (fallback mode)' };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    console.log(`\n📱 OTP for ${mobileNumber}: ${otp} (2Factor.in failed, using fallback)\n`);
    return { success: true, message: 'OTP logged in console (fallback mode)' };
  }
};

// Verify OTP expiry (10 minutes)
exports.isOTPValid = (otpExpiry) => {
  return new Date() < new Date(otpExpiry);
};
