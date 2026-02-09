# Meals4All - Food Ordering Platform

A production-ready food ordering web application with three portals: Super Admin, Vendor, and User.

> 📚 **New to the project?** Start with [INDEX.md](INDEX.md) for a complete documentation guide!

## 🎯 Quick Links

- 📖 [Documentation Index](INDEX.md) - Complete guide to all documentation
- ⚡ [Quick Start](QUICK_START.md) - Get running in 5 minutes
- 🔧 [Setup Guide](SETUP_GUIDE.md) - Detailed installation
- 🔌 [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- 🏗️ [Project Overview](PROJECT_OVERVIEW.md) - Architecture & design
- ✅ [Features Checklist](FEATURES_CHECKLIST.md) - All implemented features
- 🎉 [Completion Summary](PROJECT_COMPLETION_SUMMARY.md) - Project status

## 🧱 Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Twilio for OTP (SMS)
- Nodemailer for emails

## 📁 Project Structure

```
meals4all/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── vendorController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Vendor.js
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── FoodItem.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── vendorRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   ├── seedAdmin.js
│   │   └── seedDefaultCategories.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── otpService.js
│   │   └── emailService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminLogin.tsx
│   │   │   │   └── AdminDashboard.tsx
│   │   │   ├── vendor/
│   │   │   │   ├── VendorLogin.tsx
│   │   │   │   ├── VendorDashboard.tsx
│   │   │   │   └── ChangePassword.tsx
│   │   │   └── user/
│   │   │       ├── UserLogin.tsx
│   │   │       └── UserDashboard.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm install
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meals4all
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d

# Twilio (for OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Super Admin
SUPER_ADMIN_EMAIL=admin@meals4all.com
SUPER_ADMIN_PASSWORD=Admin@123

NODE_ENV=development
```

5. Start MongoDB:
```bash
mongod
```

6. Seed super admin:
```bash
node scripts/seedAdmin.js
```

7. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Default Credentials

### Super Admin
- Email: `admin@meals4all.com`
- Password: `Admin@123`

### Vendor
Vendors are created by Super Admin. Credentials are sent via email.

### User
Users login via mobile number + OTP.

## 📱 Features

### Super Admin Portal
- ✅ Email & password authentication
- ✅ Create vendor accounts with auto-generated passwords
- ✅ Enable/disable vendor accounts
- ✅ View analytics dashboard
- ✅ Track total orders and sales per vendor
- ✅ Daily and monthly sales summary

### Vendor Portal
- ✅ Email & password authentication
- ✅ Force password change on first login
- ✅ Update profile (name, location)
- ✅ Manage categories (add, edit, delete)
- ✅ Manage food items (add, edit, delete, set availability)
- ✅ View and manage orders
- ✅ Update order status (pending, accepted, delivered, cancelled)
- ✅ View sales summary (daily/monthly)

### User Portal
- ✅ Mobile number + OTP authentication
- ✅ Auto-detect user location
- ✅ Browse vendors within 20km radius
- ✅ View vendor menus by category
- ✅ Add items to cart
- ✅ Place orders (Cash on Delivery only)
- ✅ View order history
- ✅ Track order status

## 🗺️ Location Features
- GeoJSON format for storing locations
- MongoDB geospatial queries
- 20km radius vendor filtering
- Automatic location detection

## 📡 API Endpoints

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

In development mode:
- OTP is logged to console
- Email credentials are logged to console
- No actual SMS/Email sent

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure real Twilio credentials
3. Configure real email credentials
4. Build frontend: `npm run build`
5. Serve frontend build with backend
6. Use environment variables for sensitive data
7. Enable HTTPS
8. Set up MongoDB Atlas or production database

## 📝 License

MIT

## 👨‍💻 Author

Meals4All Team

