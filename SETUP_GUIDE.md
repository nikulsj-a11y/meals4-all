# Meals4All - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download MongoDB installer
2. Run installer with default settings
3. MongoDB will start automatically as a service

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Clone or Navigate to Project

```bash
cd /Users/nikulsj/meals4all
```

### Step 3: Install Root Dependencies

```bash
# Install concurrently for running both servers
npm install
```

### Step 4: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file (use your preferred editor)
# For quick start, you can use the default values

# Seed super admin
node scripts/seedAdmin.js

# Start backend server
npm run dev
```

You should see:
```
MongoDB Connected: localhost:27017
Server running on port 5000
```

### Step 4: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 5: Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/health

## 🔐 Login Credentials

### Super Admin Portal
- URL: http://localhost:3000/admin/login
- Email: `admin@meals4all.com`
- Password: `Admin@123`

### Vendor Portal
- URL: http://localhost:3000/vendor/login
- Create vendors from Super Admin dashboard
- Credentials will be logged in console (dev mode)

### User Portal
- URL: http://localhost:3000/user/login
- Use any 10-digit mobile number
- OTP will be logged in console (dev mode)

## 📝 Detailed Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/meals4all

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Twilio (Optional for development)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email (Optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Super Admin
SUPER_ADMIN_EMAIL=admin@meals4all.com
SUPER_ADMIN_PASSWORD=Admin@123
```

### Setting up Twilio (Optional)

1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Update .env with credentials

**Note:** In development mode, OTP is logged to console, so Twilio is optional.

### Setting up Email (Optional)

For Gmail:
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update .env with email and app password

**Note:** In development mode, emails are logged to console, so email setup is optional.

## 🧪 Testing the Application

### 1. Test Super Admin

1. Go to http://localhost:3000/admin/login
2. Login with admin credentials
3. Create a vendor:
   - Name: "Test Restaurant"
   - Email: "test@restaurant.com"
4. Check backend console for vendor password
5. View analytics dashboard

### 2. Test Vendor

1. Go to http://localhost:3000/vendor/login
2. Login with vendor credentials from console
3. Change password (first login)
4. Add categories:
   - Pizza
   - Burgers
   - Drinks
5. Add food items:
   - Name: "Margherita Pizza"
   - Category: Pizza
   - Price: 299
6. View orders and sales

### 3. Test User

1. Go to http://localhost:3000/user/login
2. Enter mobile: "9876543210"
3. Click "Send OTP"
4. Check console for OTP
5. Enter OTP and login
6. Allow location access (or use default)
7. Browse vendors
8. Add items to cart
9. Place order
10. View order history

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
net start MongoDB
```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find and kill process on port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
```

### Frontend Build Errors

**Error:** `Cannot find module 'react'`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

**Solution:** Backend already configured with CORS. If issues persist:
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📦 Production Deployment

### Backend

1. Set environment to production:
```env
NODE_ENV=production
```

2. Use MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meals4all
```

3. Configure real Twilio and Email credentials

4. Build and deploy to:
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Render

### Frontend

1. Build for production:
```bash
cd frontend
npm run build
```

2. Deploy `dist` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Firebase Hosting

3. Update API base URL in production

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Change default admin password
- [ ] Enable HTTPS in production
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Set up rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Validate all user inputs
- [ ] Use secure session management

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check environment variables
5. Review API documentation

## 🎉 Success!

If everything is working:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Can login to all three portals
- ✅ Can create vendors, food items, and orders

You're all set! Happy coding! 🚀

