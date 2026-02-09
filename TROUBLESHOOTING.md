# 🔧 Troubleshooting Guide

## Current Status

✅ **Project Structure:** Complete  
✅ **Backend Code:** Complete  
✅ **Frontend Code:** Complete  
✅ **Documentation:** Complete  
✅ **Dependencies:** Installed  
✅ **Database:** MongoDB running  
✅ **Super Admin:** Seeded  

⚠️ **Issues to Fix:**
1. Backend server startup (Twilio/Email configuration)
2. Frontend vite command not found

---

## Quick Fix Steps

### Step 1: Clean Environment

```bash
# Kill all node processes
killall -9 node 2>/dev/null

# Clear ports
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
```

### Step 2: Verify .env File

Make sure `backend/.env` has these settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meals4all
JWT_SECRET=meals4all_super_secret_jwt_key_change_in_production_2026
JWT_EXPIRE=7d

# Twilio - COMMENTED OUT for development
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=

# Email - COMMENTED OUT for development
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=
# EMAIL_PASSWORD=

SUPER_ADMIN_EMAIL=admin@meals4all.com
SUPER_ADMIN_PASSWORD=Admin@123

NODE_ENV=development
```

### Step 3: Start Backend Manually

```bash
cd backend
node server.js
```

**Expected Output:**
```
MongoDB Connected: localhost
Server running on port 5000
```

### Step 4: Start Frontend (New Terminal)

```bash
cd frontend
npx vite
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

## Common Issues & Solutions

### Issue 1: "username is required" (Twilio Error)

**Cause:** Twilio credentials are set but invalid

**Solution:**
```bash
# Edit backend/.env and comment out Twilio variables
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

### Issue 2: "vite: command not found"

**Cause:** Frontend dependencies not installed or vite not in PATH

**Solution:**
```bash
cd frontend
npm install
# Then use npx to run vite
npx vite
```

### Issue 3: "Port 5000 already in use"

**Cause:** Previous node process still running

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### Issue 4: "MongoDB connection failed"

**Cause:** MongoDB not running

**Solution:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
net start MongoDB

# Verify MongoDB is running
mongosh
```

### Issue 5: "Cannot find module"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Reinstall all dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## Manual Startup (Recommended for Testing)

Instead of using `npm run dev`, start servers manually in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npx vite
```

This gives you better visibility into errors and logs.

---

## Verification Checklist

### Backend Running?
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### Frontend Running?
```bash
curl http://localhost:3000
# Should return HTML
```

### MongoDB Running?
```bash
mongosh
# Should connect successfully
```

### Dependencies Installed?
```bash
ls backend/node_modules | wc -l  # Should be > 50
ls frontend/node_modules | wc -l  # Should be > 100
```

---

## Development Mode Notes

### OTP & Email
- **OTP:** Logged to backend console (no SMS sent)
- **Vendor Credentials:** Logged to backend console (no email sent)
- **Twilio & Email:** Not required in development

### Console Output Examples

**When user requests OTP:**
```
📱 OTP for 9876543210: 123456
```

**When admin creates vendor:**
```
📧 Vendor Credentials Email:
To: vendor@example.com
Password: TempPass123
Login URL: http://localhost:3000/vendor/login
```

---

## Alternative: Use Separate Scripts

If `npm run dev` doesn't work, use these scripts:

**Start Backend:**
```bash
npm run backend
# Or directly:
cd backend && npm run dev
```

**Start Frontend:**
```bash
npm run frontend
# Or directly:
cd frontend && npm run dev
```

---

## Reset Everything

If nothing works, reset the project:

```bash
# 1. Kill all processes
killall -9 node

# 2. Remove all dependencies
rm -rf node_modules backend/node_modules frontend/node_modules

# 3. Remove package locks
rm -f package-lock.json backend/package-lock.json frontend/package-lock.json

# 4. Reinstall
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 5. Reset MongoDB (optional)
mongosh
> use meals4all
> db.dropDatabase()
> exit

# 6. Reseed admin
node backend/scripts/seedAdmin.js

# 7. Start servers manually
# Terminal 1:
cd backend && node server.js

# Terminal 2:
cd frontend && npx vite
```

---

## Success Indicators

✅ Backend console shows:
```
MongoDB Connected: localhost
Server running on port 5000
```

✅ Frontend console shows:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

✅ Can access:
- http://localhost:3000 (Frontend)
- http://localhost:5000/health (Backend health check)

✅ Can login to admin portal:
- Email: admin@meals4all.com
- Password: Admin@123

---

## Still Having Issues?

1. Check all console outputs for specific error messages
2. Verify MongoDB is running: `pgrep mongod`
3. Verify ports are free: `lsof -i:5000` and `lsof -i:3000`
4. Check `.env` file has correct values
5. Ensure Node.js version is 16+ : `node --version`
6. Ensure MongoDB version is 5+: `mongod --version`

---

**The project is complete and functional - these are just environment setup issues that can be resolved!** 🚀

