const nodemailer = require('nodemailer');

// Create transporter only if email credentials are provided
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Send vendor credentials email
exports.sendVendorCredentials = async (email, password) => {
  try {
    const mailOptions = {
      from: `"Meals4All" <${process.env.EMAIL_USER || 'noreply@meals4all.com'}>`,
      to: email,
      subject: 'Your Vendor Account Credentials - Meals4All',
      html: `
        <h2>Welcome to Meals4All!</h2>
        <p>Your vendor account has been created successfully.</p>
        <p><strong>Login Credentials:</strong></p>
        <p>Email: ${email}</p>
        <p>Temporary Password: ${password}</p>
        <p><strong>Important:</strong> You will be required to change your password on first login.</p>
        <p>Please login at: <a href="http://localhost:3000/vendor/login">Vendor Portal</a></p>
        <br>
        <p>Best regards,<br>Meals4All Team</p>
      `
    };

    // In development or if email not configured, just log the credentials
    if (process.env.NODE_ENV === 'development' || !transporter) {
      console.log('\n📧 Vendor Credentials Email:');
      console.log('To:', email);
      console.log('Password:', password);
      console.log('Login URL: http://localhost:3000/vendor/login\n');
      return { success: true, message: 'Email logged in console (dev mode)' };
    }

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

