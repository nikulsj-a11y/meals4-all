# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Routes

### Admin Login
```http
POST /auth/admin/login
```

**Request Body:**
```json
{
  "email": "admin@meals4all.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@meals4all.com",
    "role": "superadmin"
  }
}
```

---

### Vendor Login
```http
POST /auth/vendor/login
```

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "isFirstLogin": true,
  "user": {
    "id": "user_id",
    "name": "Vendor Name",
    "email": "vendor@example.com",
    "role": "vendor"
  }
}
```

---

### Send OTP (User)
```http
POST /auth/user/send-otp
```

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

---

### Verify OTP (User)
```http
POST /auth/user/verify-otp
```

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "mobileNumber": "9876543210",
    "name": "",
    "role": "user"
  }
}
```

---

### Get Current User
```http
GET /auth/me
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "vendor"
  }
}
```

---

## Admin Routes

All admin routes require `superadmin` role.

### Create Vendor
```http
POST /admin/vendors
```

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "email": "pizza@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor created successfully. Credentials sent to email.",
  "vendor": {
    "id": "vendor_id",
    "name": "Pizza Palace",
    "email": "pizza@example.com",
    "isActive": true
  }
}
```

---

### Get All Vendors
```http
GET /admin/vendors
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "vendors": [
    {
      "_id": "vendor_id",
      "name": "Pizza Palace",
      "email": "pizza@example.com",
      "isActive": true,
      "location": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139],
        "address": "Delhi"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Toggle Vendor Status
```http
PATCH /admin/vendors/:id/toggle-status
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor enabled successfully",
  "vendor": {
    "id": "vendor_id",
    "name": "Pizza Palace",
    "isActive": true
  }
}
```

---

### Get Analytics
```http
GET /admin/analytics?period=daily
```

**Query Parameters:**
- `period`: `daily` or `monthly`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "vendorStats": [
      {
        "vendorId": "vendor_id",
        "vendorName": "Pizza Palace",
        "totalOrders": 50,
        "totalSales": 15000
      }
    ],
    "salesSummary": {
      "totalOrders": 100,
      "totalSales": 30000
    },
    "period": "daily"
  }
}
```

---

## Vendor Routes

All vendor routes require `vendor` role.

### Update Profile
```http
PUT /vendor/profile
```

**Request Body:**
```json
{
  "name": "Updated Vendor Name",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "123 Main St, Delhi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "vendor": { ... }
}
```

---

### Change Password
```http
PUT /vendor/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

### Get Categories
```http
GET /vendor/categories
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "categories": [
    {
      "_id": "category_id",
      "name": "Veg",
      "vendor": "vendor_id",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

---

### Create Category
```http
POST /vendor/categories
```

**Request Body:**
```json
{
  "name": "Desserts"
}
```

---

### Update Category
```http
PUT /vendor/categories/:id
```

**Request Body:**
```json
{
  "name": "Updated Category Name"
}
```

---

### Delete Category
```http
DELETE /vendor/categories/:id
```

---

### Get Food Items
```http
GET /vendor/food-items?category=category_id
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "foodItems": [
    {
      "_id": "item_id",
      "name": "Margherita Pizza",
      "description": "Classic pizza with cheese",
      "price": 299,
      "category": {
        "_id": "category_id",
        "name": "Pizza"
      },
      "vendor": "vendor_id",
      "isAvailable": true
    }
  ]
}
```

---

### Create Food Item
```http
POST /vendor/food-items
```

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with cheese",
  "price": 299,
  "category": "category_id",
  "isAvailable": true
}
```

---

### Update Food Item
```http
PUT /vendor/food-items/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 349,
  "isAvailable": false
}
```

---

### Delete Food Item
```http
DELETE /vendor/food-items/:id
```

---

### Get Orders
```http
GET /vendor/orders?status=pending
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD1234567890",
      "user": {
        "mobileNumber": "9876543210",
        "name": "John Doe"
      },
      "items": [
        {
          "foodItem": "item_id",
          "name": "Margherita Pizza",
          "price": 299,
          "quantity": 2
        }
      ],
      "totalAmount": 598,
      "status": "pending",
      "deliveryAddress": "123 Main St",
      "userMobile": "9876543210",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Update Order Status
```http
PATCH /vendor/orders/:id/status
```

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Valid statuses:** `pending`, `accepted`, `delivered`, `cancelled`

---

### Get Sales Summary
```http
GET /vendor/sales-summary?period=daily
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalOrders": 25,
    "totalSales": 7500
  },
  "period": "daily"
}
```

---

## User Routes

All user routes require `user` role.

### Update Profile
```http
PUT /user/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "123 Main St, Delhi"
}
```

---

### Get Nearby Vendors
```http
GET /user/vendors/nearby?latitude=28.6139&longitude=77.2090
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "vendors": [
    {
      "_id": "vendor_id",
      "name": "Pizza Palace",
      "location": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139],
        "address": "Delhi"
      },
      "isActive": true
    }
  ]
}
```

---

### Get Vendor Menu
```http
GET /user/vendors/:vendorId/menu
```

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "vendor_id",
    "name": "Pizza Palace",
    "location": { ... }
  },
  "menu": [
    {
      "category": {
        "_id": "category_id",
        "name": "Pizza"
      },
      "items": [
        {
          "_id": "item_id",
          "name": "Margherita Pizza",
          "description": "Classic pizza",
          "price": 299,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

---

### Place Order
```http
POST /user/orders
```

**Request Body:**
```json
{
  "vendorId": "vendor_id",
  "items": [
    {
      "foodItemId": "item_id",
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 Main St, Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD1234567890",
    "totalAmount": 598,
    "status": "pending"
  }
}
```

---

### Get User Orders
```http
GET /user/orders
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "orders": [ ... ]
}
```

---

### Get Order by ID
```http
GET /user/orders/:id
```

**Response:**
```json
{
  "success": true,
  "order": { ... }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error


