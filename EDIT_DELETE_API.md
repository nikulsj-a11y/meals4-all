# Edit & Delete API Endpoints

## 🎯 New Features Added

Added full CRUD (Create, Read, Update, Delete) operations for:
- ✅ Vendors
- ✅ Categories  
- ✅ Food Items (Products)

---

## 📋 Admin Endpoints

### Vendor Management

#### Update Vendor
```http
PUT /api/admin/vendors/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Vendor Name",
  "email": "newemail@example.com",
  "phone": "9876543210",
  "address": "New Address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor updated successfully",
  "vendor": {
    "id": "vendor_id",
    "name": "Updated Vendor Name",
    "email": "newemail@example.com",
    "phone": "9876543210",
    "address": "New Address",
    "isActive": true
  }
}
```

#### Delete Vendor
```http
DELETE /api/admin/vendors/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

**Note:** Cannot delete vendor if they have food items. Delete or reassign food items first.

---

### Category Management

#### Get All Categories
```http
GET /api/admin/categories
Authorization: Bearer <admin_token>
```

#### Create Category
```http
POST /api/admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Desserts",
  "vendor": "vendor_id" // Optional: null for global category
}
```

#### Update Category
```http
PUT /api/admin/categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Category Name",
  "isActive": true
}
```

#### Delete Category
```http
DELETE /api/admin/categories/:id
Authorization: Bearer <admin_token>
```

**Note:** Cannot delete category if it has food items.

---

### Food Item Management

#### Get All Food Items
```http
GET /api/admin/food-items
Authorization: Bearer <admin_token>

Query Parameters:
- vendor: Filter by vendor ID
- category: Filter by category ID
```

#### Update Food Item
```http
PUT /api/admin/food-items/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Food Name",
  "description": "Updated description",
  "price": 299.99,
  "isAvailable": true
}
```

#### Delete Food Item
```http
DELETE /api/admin/food-items/:id
Authorization: Bearer <admin_token>
```

---

## 🏪 Vendor Endpoints

### Category Management (Vendor's Own)

#### Update Category
```http
PUT /api/vendor/categories/:id
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "Updated Category Name"
}
```

#### Delete Category
```http
DELETE /api/vendor/categories/:id
Authorization: Bearer <vendor_token>
```

---

### Food Item Management (Vendor's Own)

#### Update Food Item
```http
PUT /api/vendor/food-items/:id
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "Updated Food Name",
  "description": "Updated description",
  "price": 199.99,
  "category": "category_id",
  "isAvailable": true
}
```

#### Delete Food Item
```http
DELETE /api/vendor/food-items/:id
Authorization: Bearer <vendor_token>
```

---

## 🔒 Permissions

### Admin (SuperAdmin)
- ✅ Can edit/delete ANY vendor
- ✅ Can edit/delete ANY category
- ✅ Can edit/delete ANY food item
- ✅ Full system access

### Vendor
- ✅ Can edit/delete ONLY their own categories
- ✅ Can edit/delete ONLY their own food items
- ❌ Cannot edit/delete other vendors' data
- ❌ Cannot manage vendors

---

## ⚠️ Validation Rules

### Vendor Deletion
- Cannot delete if vendor has food items
- Must delete or reassign all food items first

### Category Deletion
- Cannot delete if category has food items
- Must delete or reassign all food items first

### Email Uniqueness
- Vendor email must be unique
- Cannot update to an email already in use

---

## 🧪 Testing Examples

### Test with cURL

**Update Vendor:**
```bash
curl -X PUT http://localhost:5000/api/admin/vendors/VENDOR_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Vendor Name", "phone": "9876543210"}'
```

**Delete Food Item:**
```bash
curl -X DELETE http://localhost:5000/api/vendor/food-items/FOOD_ITEM_ID \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

---

## 📝 Summary

All edit and delete functionality has been implemented for:

1. **Vendors** - Admin can update/delete
2. **Categories** - Admin and Vendor can update/delete their own
3. **Food Items** - Admin and Vendor can update/delete their own

All endpoints include proper:
- ✅ Authentication checks
- ✅ Authorization checks
- ✅ Validation
- ✅ Error handling
- ✅ Cascade protection (prevent deletion if dependencies exist)

