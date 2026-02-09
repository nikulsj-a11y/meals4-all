# Meals4All - Project Overview

## 🎯 Project Summary

Meals4All is a production-ready, full-stack food ordering platform with three distinct portals:
1. **Super Admin Portal** - Vendor management and analytics
2. **Vendor Portal** - Menu and order management
3. **User Portal** - Browse vendors and place orders

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router v6 for navigation
- Axios for API communication
- Context API for state management
- Vite for build tooling

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Twilio for SMS/OTP
- Nodemailer for emails

### Design Patterns

1. **MVC Pattern** - Separation of routes, controllers, and models
2. **Repository Pattern** - Data access through Mongoose models
3. **Middleware Pattern** - Authentication and authorization
4. **Context Pattern** - React state management
5. **Protected Routes** - Role-based access control

## 📊 Database Schema

### Collections

1. **admins**
   - email (unique)
   - password (hashed)
   - role: 'superadmin'
   - isActive

2. **vendors**
   - name
   - email (unique)
   - password (hashed)
   - location (GeoJSON Point)
   - role: 'vendor'
   - isActive
   - isFirstLogin
   - createdBy (ref: Admin)

3. **users**
   - mobileNumber (unique)
   - name
   - location (GeoJSON Point)
   - role: 'user'
   - otp (temporary)
   - otpExpiry

4. **categories**
   - name
   - vendor (ref: Vendor)
   - isDefault
   - isActive
   - Unique index: (name, vendor)

5. **fooditems**
   - name
   - description
   - price
   - category (ref: Category)
   - vendor (ref: Vendor)
   - isAvailable
   - image

6. **orders**
   - orderNumber (unique)
   - user (ref: User)
   - vendor (ref: Vendor)
   - items (array of order items)
   - totalAmount
   - status: pending | accepted | delivered | cancelled
   - paymentMethod: 'cod'
   - deliveryAddress
   - deliveryLocation (GeoJSON Point)
   - userMobile

### Indexes

- **vendors.location**: 2dsphere (geospatial queries)
- **users.location**: 2dsphere (geospatial queries)
- **categories**: (name, vendor) compound unique
- **orders**: (user, createdAt), (vendor, status, createdAt)

## 🔐 Authentication & Authorization

### Authentication Methods

1. **Super Admin & Vendor**
   - Email + Password
   - JWT token (7 days expiry)
   - Password hashing with bcrypt

2. **User**
   - Mobile Number + OTP
   - 6-digit OTP (10 minutes expiry)
   - JWT token after verification

### Authorization

- **Role-based middleware** checks user role
- **Protected routes** require valid JWT
- **Route-level authorization** restricts access by role

### Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token validation
- OTP expiry mechanism
- Force password change on first login (vendors)
- Account enable/disable functionality

## 🗺️ Location Features

### Geospatial Functionality

1. **Storage**
   - GeoJSON Point format
   - Coordinates: [longitude, latitude]
   - MongoDB 2dsphere indexes

2. **Queries**
   - Find vendors within 20km radius
   - Uses `$near` operator with `$maxDistance`
   - Automatic distance calculation

3. **User Experience**
   - Browser geolocation API
   - Fallback to default location
   - Real-time vendor filtering

## 📱 Features Breakdown

### Super Admin Features

✅ **Authentication**
- Email/password login
- JWT-based sessions

✅ **Vendor Management**
- Create vendor accounts
- Auto-generate temporary passwords
- Send credentials via email
- Enable/disable vendor accounts
- View all vendors

✅ **Analytics**
- Total orders per vendor
- Total sales per vendor
- Daily sales summary
- Monthly sales summary
- Real-time statistics

### Vendor Features

✅ **Authentication**
- Email/password login
- Force password change on first login
- Secure password update

✅ **Profile Management**
- Update vendor name
- Set location (lat/long)
- Add address

✅ **Category Management**
- View categories
- Create custom categories
- Edit category names
- Delete categories (if no items)
- Default categories provided

✅ **Food Item Management**
- Add food items
- Edit item details
- Set prices
- Assign to categories
- Toggle availability
- Delete items

✅ **Order Management**
- View all orders
- Filter by status
- Update order status
- View order details
- Customer information

✅ **Sales Analytics**
- Daily sales summary
- Monthly sales summary
- Total orders count
- Total revenue

### User Features

✅ **Authentication**
- Mobile number + OTP login
- Automatic user creation
- OTP verification

✅ **Location**
- Auto-detect location
- Manual location entry
- Location-based vendor search

✅ **Vendor Discovery**
- Browse nearby vendors (20km)
- View vendor details
- View vendor menus

✅ **Menu Browsing**
- View by categories
- See item details
- Check prices
- View availability

✅ **Cart Management**
- Add items to cart
- Update quantities
- Remove items
- View total amount

✅ **Order Placement**
- Enter delivery address
- Cash on Delivery only
- Order confirmation
- Order number generation

✅ **Order Tracking**
- View order history
- Check order status
- View order details
- Real-time status updates

## 🔄 Order Flow

1. **User places order**
   - Selects items from vendor menu
   - Adds to cart
   - Enters delivery address
   - Confirms order

2. **Order created**
   - Status: 'pending'
   - Unique order number generated
   - Total amount calculated
   - Delivery location stored

3. **Vendor receives order**
   - Notification (can be implemented)
   - Views order details
   - Updates status to 'accepted'

4. **Order fulfillment**
   - Vendor prepares order
   - Updates status to 'delivered'
   - Or cancels if needed

5. **User tracking**
   - Views real-time status
   - Receives updates
   - Completes transaction (COD)

## 🎨 UI/UX Design

### Design Principles

- **Mobile-first** responsive design
- **Clean and minimal** interface
- **Consistent** color scheme
- **Accessible** components
- **Fast** loading times

### Color Scheme

- Primary: Red (#ef4444 - #dc2626)
- Success: Green
- Warning: Yellow
- Danger: Red
- Neutral: Gray scale

### Components

- Reusable Button component
- Input component with validation
- Card component for layouts
- Protected Route wrapper
- Modal dialogs

## 🚀 Performance Optimizations

1. **Database**
   - Proper indexing
   - Geospatial indexes
   - Compound indexes
   - Query optimization

2. **API**
   - Efficient queries
   - Pagination ready
   - Selective field population
   - Error handling

3. **Frontend**
   - Code splitting (React Router)
   - Lazy loading
   - Optimized re-renders
   - Vite for fast builds

## 🧪 Development vs Production

### Development Mode

- OTP logged to console
- Email credentials logged
- Detailed error messages
- No actual SMS/Email sent
- CORS enabled for localhost

### Production Mode

- Real Twilio SMS
- Real email sending
- Generic error messages
- Environment-based config
- Secure CORS settings

## 📈 Scalability Considerations

1. **Database**
   - MongoDB Atlas for cloud hosting
   - Replica sets for high availability
   - Sharding for large datasets

2. **Backend**
   - Horizontal scaling with load balancer
   - Stateless JWT authentication
   - Caching with Redis (can be added)

3. **Frontend**
   - CDN for static assets
   - Code splitting
   - Lazy loading
   - Service workers (can be added)

## 🔮 Future Enhancements

- [ ] Real-time notifications (Socket.io)
- [ ] Payment gateway integration
- [ ] Image upload for food items
- [ ] Ratings and reviews
- [ ] Delivery tracking
- [ ] Push notifications
- [ ] Admin analytics dashboard
- [ ] Vendor earnings reports
- [ ] Promotional codes/discounts
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)

## 📝 Code Quality

- TypeScript for type safety (frontend)
- ESLint configuration
- Consistent code formatting
- Modular architecture
- Separation of concerns
- Error handling
- Input validation
- Security best practices

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development
- RESTful API design
- Authentication & authorization
- Geospatial queries
- Role-based access control
- State management
- Responsive design
- Production deployment
- Security best practices
- Database design

