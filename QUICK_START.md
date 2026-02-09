# 🚀 Meals4All - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Setup MongoDB (1 minute)

**Make sure MongoDB is running:**

```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
# Windows: net start MongoDB
```

### Step 3: Configure Backend (1 minute)

```bash
cd backend
cp .env.example .env
# Edit .env if needed (optional for quick start)
```

### Step 4: Seed Database (30 seconds)

```bash
# From root directory
npm run seed-admin
```

### Step 5: Start Application (30 seconds)

```bash
# From root directory - starts both backend and frontend
npm run dev
```

## ✅ Verify Installation

Open your browser:

1. **Frontend:** http://localhost:3000
2. **Backend Health:** http://localhost:5000/health

## 🔑 Login Credentials

### Super Admin
- URL: http://localhost:3000/admin/login
- Email: `admin@meals4all.com`
- Password: `Admin@123`

### Test User
- URL: http://localhost:3000/user/login
- Mobile: Any 10-digit number (e.g., `9876543210`)
- OTP: Check console output

## 🎯 Quick Test Flow

### 1. Create a Vendor (as Super Admin)
1. Login to admin portal
2. Click "Create Vendor"
3. Name: "Test Restaurant"
4. Email: "test@restaurant.com"
5. Check backend console for password

### 2. Setup Menu (as Vendor)
1. Login to vendor portal with credentials from console
2. Change password
3. Add category: "Pizza"
4. Add food item:
   - Name: "Margherita Pizza"
   - Price: 299
   - Category: Pizza

### 3. Place Order (as User)
1. Login to user portal with mobile + OTP
2. Allow location access
3. Browse vendors
4. Add items to cart
5. Place order

## 📁 Project Structure

```
meals4all/
├── backend/          # Node.js + Express API
├── frontend/         # React + TypeScript UI
├── README.md         # Main documentation
├── SETUP_GUIDE.md    # Detailed setup
├── API_DOCUMENTATION.md  # API reference
└── package.json      # Root scripts
```

## 🛠️ Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start both backend and frontend
npm run dev

# Start backend only
npm run backend

# Start frontend only
npm run frontend

# Seed super admin
npm run seed-admin

# Seed default categories
npm run seed-categories
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

### MongoDB Not Running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
net start MongoDB
```

### Dependencies Error
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-all
```

## 📚 Next Steps

1. ✅ Read [README.md](README.md) for overview
2. ✅ Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
3. ✅ Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
4. ✅ Explore [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture

## 🎉 You're Ready!

If you see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Can login to admin portal

**Congratulations! You're all set!** 🚀

## 💡 Tips

- **Development Mode:** OTP and passwords are logged to console
- **Hot Reload:** Both frontend and backend support hot reload
- **API Testing:** Use Postman or curl to test API endpoints
- **Database:** Use MongoDB Compass to view database

## 🆘 Need Help?

1. Check console for errors
2. Verify MongoDB is running
3. Check .env configuration
4. Review documentation files
5. Ensure all dependencies are installed

---

**Happy Coding!** 🎊

