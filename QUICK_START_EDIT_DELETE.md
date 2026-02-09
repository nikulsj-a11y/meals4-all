# 🚀 Quick Start: Edit & Delete Features

## 📋 Table of Contents
1. [Admin: Manage Vendors](#admin-manage-vendors)
2. [Admin: Manage Categories](#admin-manage-categories)
3. [Admin: Manage Food Items](#admin-manage-food-items)
4. [Vendor: Manage Own Data](#vendor-manage-own-data)

---

## 🔐 Getting Started

### Step 1: Login and Get Token

**Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@meals4all.com", "password": "Admin@123"}'
```

**Vendor Login:**
```bash
curl -X POST http://localhost:5000/api/auth/vendor/login \
  -H "Content-Type: application/json" \
  -d '{"email": "vendor@test.com", "password": "Vendor@123"}'
```

Save the `token` from the response!

---

## 👨‍💼 Admin: Manage Vendors

### Get All Vendors
```bash
curl http://localhost:5000/api/admin/vendors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Vendor
```bash
curl -X PUT http://localhost:5000/api/admin/vendors/VENDOR_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Vendor Name",
    "email": "newemail@example.com",
    "phone": "9876543210",
    "address": "New Address, City"
  }'
```

### Delete Vendor
```bash
curl -X DELETE http://localhost:5000/api/admin/vendors/VENDOR_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**⚠️ Note:** Cannot delete vendor if they have food items!

---

## 📂 Admin: Manage Categories

### Get All Categories
```bash
curl http://localhost:5000/api/admin/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Create Category
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desserts",
    "vendor": "VENDOR_ID"
  }'
```

### Update Category
```bash
curl -X PUT http://localhost:5000/api/admin/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sweet Desserts",
    "isActive": true
  }'
```

### Delete Category
```bash
curl -X DELETE http://localhost:5000/api/admin/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**⚠️ Note:** Cannot delete category if it has food items!

---

## 🍔 Admin: Manage Food Items

### Get All Food Items
```bash
# Get all
curl http://localhost:5000/api/admin/food-items \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by vendor
curl "http://localhost:5000/api/admin/food-items?vendor=VENDOR_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by category
curl "http://localhost:5000/api/admin/food-items?category=CATEGORY_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Food Item
```bash
curl -X PUT http://localhost:5000/api/admin/food-items/FOOD_ITEM_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Food Name",
    "description": "New description",
    "price": 299.99,
    "isAvailable": true
  }'
```

### Delete Food Item
```bash
curl -X DELETE http://localhost:5000/api/admin/food-items/FOOD_ITEM_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🏪 Vendor: Manage Own Data

### Manage Categories

**Get My Categories:**
```bash
curl http://localhost:5000/api/vendor/categories \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

**Create Category:**
```bash
curl -X POST http://localhost:5000/api/vendor/categories \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Beverages"}'
```

**Update Category:**
```bash
curl -X PUT http://localhost:5000/api/vendor/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Cold Beverages"}'
```

**Delete Category:**
```bash
curl -X DELETE http://localhost:5000/api/vendor/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

### Manage Food Items

**Get My Food Items:**
```bash
curl http://localhost:5000/api/vendor/food-items \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

**Create Food Item:**
```bash
curl -X POST http://localhost:5000/api/vendor/food-items \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Burger",
    "description": "Delicious chicken burger",
    "price": 199.99,
    "category": "CATEGORY_ID",
    "isAvailable": true
  }'
```

**Update Food Item:**
```bash
curl -X PUT http://localhost:5000/api/vendor/food-items/FOOD_ITEM_ID \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spicy Chicken Burger",
    "price": 249.99,
    "isAvailable": true
  }'
```

**Delete Food Item:**
```bash
curl -X DELETE http://localhost:5000/api/vendor/food-items/FOOD_ITEM_ID \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

---

## ✅ Success Responses

All successful operations return:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

## ❌ Error Responses

Errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `500` - Server error

---

## 🧪 Testing

Run the automated test:
```bash
node backend/scripts/testEditDelete.js
```

This will test all CRUD operations!

---

## 📚 More Information

- Full API docs: `EDIT_DELETE_API.md`
- Feature summary: `FEATURE_UPDATE_SUMMARY.md`

