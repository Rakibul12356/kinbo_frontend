# Kinbo E-Commerce API Documentation for Frontend Team

> **Base URL:** `https://kinbo-backend.onrender.com/api/v1` (Development)  
> **Production Base URL:** [`https://your-domain.com/api/v1](https://kinbo-backend.onrender.com/api/v1)`  
> **Static Files Base URL:** `https://kinbo-backend.onrender.com/api/v1`

## Standard Response Structures

### 1. Success Response
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}
```

### 2. Error Response
```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error string (optional)"
}
```

### 3. Common Headers
| Header | Description |
| :--- | :--- |
| `Content-Type` | `application/json` (or `multipart/form-data` for file upload) |
| `Authorization` | `Bearer <JWT_ACCESS_TOKEN>` (for protected routes) |

---

## Table of Contents
1. [Authentication & Profile](#1-authentication--profile)
2. [Categories & Subcategories](#2-categories--subcategories)
3. [Products & Inventory](#3-products--inventory)
4. [Customer Delivery Addresses](#4-customer-delivery-addresses)
5. [Shopping Cart](#5-shopping-cart)
6. [Wishlist](#6-wishlist)
7. [Stock Alerts (Restock Waitlist)](#7-stock-alerts-restock-waitlist)
8. [Checkout & Delivery Calculation](#8-checkout--delivery-calculation)
9. [Orders & Lifecycle (COD Only)](#9-orders--lifecycle-cod-only)
10. [Reviews & Ratings](#10-reviews--ratings)
11. [Customer Management (Admin View)](#11-customer-management-admin-view)
12. [Support Tickets, Complaints & Refunds](#12-support-tickets-complaints--refunds)
13. [Careers & Job Applications](#13-careers--job-applications)
14. [Notifications & Preferences](#14-notifications--preferences)
15. [Admin Analytics & Dashboard](#15-admin-analytics--dashboard)

---

## 1. Authentication & Profile

### 1.1 Register Customer
* **Method:** `POST`
* **URL:** `/auth/register`
* **Access:** Public
* **Request Body:**
```json
{
  "name": "Rakibul Hasan",
  "email": "customer@example.com",
  "password": "Password123",
  "phone": "+8801700000000"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "e2e8e3d6-4444-48f8-b32b-10fbbdfca58e",
    "email": "customer@example.com",
    "name": "Rakibul Hasan",
    "phone": "+8801700000000",
    "avatar": null,
    "gender": null,
    "dateOfBirth": null,
    "role": "USER",
    "firstOrderFreeDeliveryUsed": false,
    "createdAt": "2026-11-26T12:00:00.000Z"
  }
}
```

---

### 1.2 Login (User / Admin)
* **Method:** `POST`
* **URL:** `/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "Password123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "e2e8e3d6-4444-48f8-b32b-10fbbdfca58e",
    "email": "customer@example.com",
    "name": "Rakibul Hasan",
    "phone": "+8801700000000",
    "avatar": "/uploads/avatars/avatar-123.jpg",
    "gender": "MALE",
    "dateOfBirth": "1998-05-20",
    "role": "USER",
    "firstOrderFreeDeliveryUsed": false
  }
}
```

---

### 1.3 Get Current User Profile
* **Method:** `GET`
* **URL:** `/auth/me` *(or `/users/profile`)*
* **Access:** Protected (`USER`, `ADMIN`)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "e2e8e3d6-4444-48f8-b32b-10fbbdfca58e",
    "email": "customer@example.com",
    "name": "Rakibul Hasan",
    "phone": "+8801700000000",
    "avatar": "/uploads/avatars/avatar-123.jpg",
    "gender": "MALE",
    "dateOfBirth": "1998-05-20",
    "role": "USER",
    "firstOrderFreeDeliveryUsed": false,
    "createdAt": "2026-11-26T12:00:00.000Z",
    "updatedAt": "2026-11-26T12:30:00.000Z"
  }
}
```

---

### 1.4 Update Profile (with Image Upload)
* **Method:** `PUT` or `PATCH`
* **URL:** `/users/profile` *(or `/auth/profile`)*
* **Access:** Protected (`USER`)
* **Headers:** `Authorization: Bearer <token>`
* **Content-Type:** `multipart/form-data`
* **Form-Data Fields:**
  * `avatar`: File (image file - jpg, png, webp)
  * `name`: Text (e.g., `Rakibul Hasan`)
  * `gender`: Text (`MALE`, `FEMALE`, or `OTHER`)
  * `dateOfBirth`: Text (`1998-05-20`)
  * `phone`: Text (`+8801328524369`)
  * `email`: Text (`new_email@example.com` - optional)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "e2e8e3d6-4444-48f8-b32b-10fbbdfca58e",
    "email": "customer@example.com",
    "name": "Rakibul Hasan",
    "phone": "+8801328524369",
    "avatar": "/uploads/avatars/avatar-1795540991.png",
    "gender": "MALE",
    "dateOfBirth": "1998-05-20",
    "role": "USER",
    "firstOrderFreeDeliveryUsed": false,
    "updatedAt": "2026-11-26T14:15:00.000Z"
  }
}
```

---

### 1.5 Change Password
* **Method:** `PUT`
* **URL:** `/users/change-password`
* **Access:** Protected (`USER`, `ADMIN`)
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewStrongPassword456",
  "confirmPassword": "NewStrongPassword456"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. Categories & Subcategories

### 2.1 Get All Categories with Subcategories
* **Method:** `GET`
* **URL:** `/categories`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-uuid-1",
      "name": "Men's Fashion",
      "slug": "mens-fashion",
      "image": "/uploads/categories/mens.png",
      "description": "Men's clothing and accessories",
      "subcategories": [
        {
          "id": "subcat-uuid-1",
          "name": "T-Shirts",
          "slug": "t-shirts",
          "categoryId": "cat-uuid-1"
        },
        {
          "id": "subcat-uuid-2",
          "name": "Polo Shirts",
          "slug": "polo-shirts",
          "categoryId": "cat-uuid-1"
        }
      ]
    }
  ]
}
```

---

### 2.2 Get Single Category Details
* **Method:** `GET`
* **URL:** `/categories/:id`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cat-uuid-1",
    "name": "Men's Fashion",
    "slug": "mens-fashion",
    "image": "/uploads/categories/mens.png",
    "description": "Men's clothing and accessories",
    "subcategories": [...]
  }
}
```

---

### 2.3 Create Category (Admin Only)
* **Method:** `POST`
* **URL:** `/categories`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "name": "Electronics",
  "slug": "electronics",
  "image": "https://example.com/electronics.jpg",
  "description": "Gadgets and devices"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat-uuid-2",
    "name": "Electronics",
    "slug": "electronics",
    "image": "https://example.com/electronics.jpg",
    "description": "Gadgets and devices",
    "createdAt": "2026-11-26T12:00:00.000Z"
  }
}
```

---

### 2.4 Update Category (Admin Only)
* **Method:** `PUT`
* **URL:** `/categories/:id`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "name": "Smart Electronics",
  "description": "Smart devices & wearables"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

---

### 2.5 Delete Category (Admin Only)
* **Method:** `DELETE`
* **URL:** `/categories/:id`
* **Access:** Admin (`ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 2.6 Create Subcategory (Admin Only)
* **Method:** `POST`
* **URL:** `/subcategories`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "categoryId": "cat-uuid-1",
  "name": "Casual Shirts",
  "slug": "casual-shirts"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Subcategory created successfully",
  "data": { ... }
}
```

---

## 3. Products & Inventory

### 3.1 Get Product List (Public)
* **Method:** `GET`
* **URL:** `/products`
* **Access:** Public
* **Query Parameters:**
  * `page` (default `1`)
  * `limit` (default `12`)
  * `search` (searches name & description)
  * `category` (category ID or slug)
  * `subcategory` (subcategory ID or slug)
  * `minPrice` & `maxPrice`
  * `sort` (`newest`, `price-low-high`, `price-high-low`, `featured`)
* **Note:** `buyPrice` is strictly hidden from this response.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-uuid-1",
      "name": "Premium Cotton Polo Shirt",
      "slug": "premium-cotton-polo-shirt",
      "description": "100% breathable organic cotton polo shirt.",
      "price": 1200.00,
      "discountPercent": 15,
      "finalPrice": 1020.00,
      "stock": 25,
      "isOutOfStockManual": false,
      "isFeatured": true,
      "brand": "Kinbo Signature",
      "category": {
        "id": "cat-uuid-1",
        "name": "Men's Fashion",
        "slug": "mens-fashion"
      },
      "subcategory": {
        "id": "subcat-uuid-2",
        "name": "Polo Shirts",
        "slug": "polo-shirts"
      },
      "images": [
        {
          "id": "img-uuid-1",
          "url": "/uploads/products/polo-navy-front.jpg",
          "isPrimary": true
        },
        {
          "id": "img-uuid-2",
          "url": "/uploads/products/polo-navy-back.jpg",
          "isPrimary": false
        }
      ]
    }
  ],
  "meta": {
    "total": 48,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  }
}
```

---

### 3.2 Get Product Details by ID or Slug
* **Method:** `GET`
* **URL:** `/products/:idOrSlug`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid-1",
    "name": "Premium Cotton Polo Shirt",
    "slug": "premium-cotton-polo-shirt",
    "description": "100% breathable organic cotton polo shirt.",
    "price": 1200.00,
    "discountPercent": 15,
    "finalPrice": 1020.00,
    "stock": 25,
    "isOutOfStockManual": false,
    "isFeatured": true,
    "brand": "Kinbo Signature",
    "category": { ... },
    "subcategory": { ... },
    "images": [ ... ],
    "reviews": [
      {
        "id": "rev-1",
        "rating": 5,
        "comment": "Outstanding quality!",
        "user": {
          "name": "Rakibul Hasan",
          "avatar": "/uploads/avatars/avatar-123.jpg"
        },
        "createdAt": "2026-11-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3.3 Create Product (Admin Only)
* **Method:** `POST`
* **URL:** `/admin/products`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "name": "Classic Denim Jacket",
  "slug": "classic-denim-jacket",
  "description": "Heavyweight vintage wash denim jacket",
  "price": 2800.00,
  "discountPercent": 10,
  "stock": 15,
  "categoryId": "cat-uuid-1",
  "subcategoryId": "subcat-uuid-3",
  "brand": "Kinbo Vintage",
  "isFeatured": true,
  "images": [
    {
      "url": "/uploads/products/denim-1.jpg",
      "isPrimary": true
    },
    {
      "url": "/uploads/products/denim-2.jpg",
      "isPrimary": false
    }
  ]
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

---

### 3.4 Toggle Out of Stock Manually (Admin Only)
* **Method:** `PATCH`
* **URL:** `/admin/products/:id/out-of-stock`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "isOutOfStockManual": true
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product stock status updated",
  "data": {
    "id": "prod-uuid-1",
    "isOutOfStockManual": true
  }
}
```

---

## 4. Customer Delivery Addresses

### 4.1 Get Customer Addresses
* **Method:** `GET`
* **URL:** `/addresses`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "addr-uuid-1",
      "customerName": "Rakibul Hasan",
      "phone": "+8801328524369",
      "streetAddress": "House 12, Road 5, Block B, Mirpur-10",
      "city": "Dhaka",
      "deliveryArea": "INSIDE_DHAKA",
      "isDefault": true,
      "createdAt": "2026-11-25T10:00:00.000Z"
    }
  ]
}
```

---

### 4.2 Add New Address
* **Method:** `POST`
* **URL:** `/addresses`
* **Access:** Protected (`USER`)
* **Request Body:**
```json
{
  "customerName": "Rakibul Hasan",
  "phone": "+8801328524369",
  "streetAddress": "House 12, Road 5, Block B, Mirpur-10",
  "city": "Dhaka",
  "deliveryArea": "INSIDE_DHAKA",
  "isDefault": true
}
```
> **Note on `deliveryArea`:** Must be either `INSIDE_DHAKA` (Charge: ৳70) or `OUTSIDE_DHAKA` (Charge: ৳120).
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": { ... }
}
```

---

### 4.3 Set Default Address
* **Method:** `PATCH`
* **URL:** `/addresses/:id/default`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Default address updated"
}
```

---

## 5. Shopping Cart

### 5.1 Get Cart
* **Method:** `GET`
* **URL:** `/cart`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cart-uuid-1",
    "totalItems": 2,
    "subtotal": 2040.00,
    "items": [
      {
        "id": "item-uuid-1",
        "productId": "prod-uuid-1",
        "quantity": 2,
        "product": {
          "id": "prod-uuid-1",
          "name": "Premium Cotton Polo Shirt",
          "slug": "premium-cotton-polo-shirt",
          "price": 1200.00,
          "discountPercent": 15,
          "finalPrice": 1020.00,
          "stock": 25,
          "isOutOfStock": false,
          "image": "/uploads/products/polo-navy-front.jpg"
        },
        "itemTotal": 2040.00
      }
    ]
  }
}
```

---

### 5.2 Add Item to Cart
* **Method:** `POST`
* **URL:** `/cart/items`
* **Access:** Protected (`USER`)
* **Request Body:**
```json
{
  "productId": "prod-uuid-1",
  "quantity": 1
}
```
* **Success Response (200 OK / 201 Created):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": { ... }
}
```

---

### 5.3 Update Item Quantity
* **Method:** `PUT`
* **URL:** `/cart/items/:itemId`
* **Access:** Protected (`USER`)
* **Request Body:**
```json
{
  "quantity": 3
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": { ... }
}
```

---

### 5.4 Remove Item from Cart
* **Method:** `DELETE`
* **URL:** `/cart/items/:itemId`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 5.5 Clear Entire Cart
* **Method:** `DELETE`
* **URL:** `/cart`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 6. Wishlist

### 6.1 Get Wishlist
* **Method:** `GET`
* **URL:** `/wishlist`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "wish-uuid-1",
      "productId": "prod-uuid-1",
      "product": {
        "id": "prod-uuid-1",
        "name": "Premium Cotton Polo Shirt",
        "price": 1200.00,
        "finalPrice": 1020.00,
        "stock": 25,
        "image": "/uploads/products/polo-navy-front.jpg"
      },
      "createdAt": "2026-11-26T10:00:00.000Z"
    }
  ]
}
```

---

### 6.2 Add to Wishlist
* **Method:** `POST`
* **URL:** `/wishlist/:productId`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product added to wishlist"
}
```

---

### 6.3 Remove from Wishlist
* **Method:** `DELETE`
* **URL:** `/wishlist/:productId`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

---

## 7. Stock Alerts (Restock Waitlist)

### 7.1 Subscribe to Restock Alert
* **Method:** `POST`
* **URL:** `/notified-products/:productId`
* **Access:** Protected (`USER`)
* **Description:** Used when a product is `Out of Stock` so customer gets notified upon restock.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "You will be notified as soon as this item is back in stock"
}
```

---

### 7.2 Get My Subscribed Restock Alerts
* **Method:** `GET`
* **URL:** `/notified-products`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-1",
      "productId": "prod-uuid-1",
      "status": "OUT_OF_STOCK",
      "product": { ... }
    }
  ]
}
```

---

## 8. Checkout & Delivery Calculation

### 8.1 Calculate Checkout Summary
* **Method:** `POST`
* **URL:** `/checkout/calculate-summary`
* **Access:** Protected (`USER`)
* **Description:** Pre-calculates exact fees before placing an order.
* **Delivery Rates:**
  * `INSIDE_DHAKA`: ৳70
  * `OUTSIDE_DHAKA`: ৳120
* **First Order Benefit:** If `user.firstOrderFreeDeliveryUsed === false`, delivery fee becomes ৳0!
* **Request Body:**
```json
{
  "deliveryArea": "INSIDE_DHAKA",
  "items": [
    {
      "productId": "prod-uuid-1",
      "quantity": 2
    }
  ]
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalProductPrice": 2400.00,
    "discountAmount": 360.00,
    "subtotal": 2040.00,
    "regularDeliveryCharge": 70.00,
    "deliveryDiscount": 70.00,
    "finalDeliveryCharge": 0.00,
    "isFirstOrderFreeDelivery": true,
    "finalOrderAmount": 2040.00
  }
}
```

---

## 9. Orders & Lifecycle (COD Only)

> **Important Rule:** There is **NO** online payment gateway (no card, bKash, SSLCommerz). Every order is **100% Cash On Delivery (COD)**.

### 9.1 9-Stage Order Status Pipeline
1. `PENDING`
2. `PROCESSING`
3. `CONFIRMED` *(Stock is deducted here)*
4. `PACKING` *(First order free delivery benefit is preserved if cancelled here or earlier)*
5. `PACKED`
6. `DELIVERING`
7. `DELIVERED` *(Payment status automatically turns to `PAID`)*
8. `CANCELLED` *(Restores product stock)*
9. `RETURNED` *(Allowed within 3 days after delivery upon Admin approval)*

---

### 9.2 Place New Order
* **Method:** `POST`
* **URL:** `/orders`
* **Access:** Protected (`USER`)
* **Request Body:**
```json
{
  "deliveryArea": "INSIDE_DHAKA",
  "shippingAddress": {
    "customerName": "Rakibul Hasan",
    "phone": "+8801328524369",
    "streetAddress": "House 12, Road 5, Block B, Mirpur-10",
    "city": "Dhaka",
    "deliveryArea": "INSIDE_DHAKA"
  },
  "items": [
    {
      "productId": "prod-uuid-1",
      "quantity": 2
    }
  ]
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": "order-uuid-1",
    "orderNumber": "KB-20261126-8942",
    "status": "PENDING",
    "paymentMethod": "COD",
    "paymentStatus": "UNPAID",
    "totalProductPrice": 2400.00,
    "discountAmount": 360.00,
    "regularDeliveryCharge": 70.00,
    "deliveryDiscount": 70.00,
    "finalDeliveryCharge": 0.00,
    "isFirstOrderFreeDelivery": true,
    "finalOrderAmount": 2040.00,
    "createdAt": "2026-11-26T15:30:00.000Z"
  }
}
```

---

### 9.3 Get Customer Orders (Order History)
* **Method:** `GET`
* **URL:** `/orders/my-orders`
* **Access:** Protected (`USER`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid-1",
      "orderNumber": "KB-20261126-8942",
      "status": "DELIVERING",
      "paymentMethod": "COD",
      "paymentStatus": "UNPAID",
      "finalOrderAmount": 2040.00,
      "itemsCount": 2,
      "createdAt": "2026-11-26T15:30:00.000Z"
    }
  ]
}
```

---

### 9.4 Get Single Order Details & Tracking Timeline
* **Method:** `GET`
* **URL:** `/orders/:id`
* **Access:** Protected (`USER`, `ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid-1",
    "orderNumber": "KB-20261126-8942",
    "status": "DELIVERING",
    "paymentMethod": "COD",
    "paymentStatus": "UNPAID",
    "finalOrderAmount": 2040.00,
    "shippingAddress": { ... },
    "items": [
      {
        "id": "item-1",
        "productName": "Premium Cotton Polo Shirt",
        "quantity": 2,
        "unitPrice": 1200.00,
        "discountPercent": 15,
        "finalUnitPrice": 1020.00,
        "totalPrice": 2040.00
      }
    ],
    "statusHistory": [
      {
        "status": "PENDING",
        "note": "Order received",
        "createdAt": "2026-11-26T15:30:00.000Z"
      },
      {
        "status": "PROCESSING",
        "note": "Order verified by manager",
        "createdAt": "2026-11-26T16:00:00.000Z"
      },
      {
        "status": "CONFIRMED",
        "note": "Stock reserved",
        "createdAt": "2026-11-26T16:30:00.000Z"
      },
      {
        "status": "DELIVERING",
        "note": "Handed over to courier",
        "createdAt": "2026-11-27T09:00:00.000Z"
      }
    ]
  }
}
```

---

### 9.5 Cancel Order (Customer)
* **Method:** `POST`
* **URL:** `/orders/:id/cancel`
* **Access:** Protected (`USER`)
* **Request Body:**
```json
{
  "reason": "Ordered by mistake"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

### 9.6 Request Order Return (Within 3 Days of Delivery)
* **Method:** `POST`
* **URL:** `/orders/:id/return`
* **Access:** Protected (`USER`)
* **Request Body:**
```json
{
  "reason": "Size is too large and fabric color mismatch"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Return request submitted. Admin will review your request shortly."
}
```

---

### 9.7 Advance Order Status (Admin Only)
* **Method:** `PATCH`
* **URL:** `/admin/orders/:id/status`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "status": "CONFIRMED",
  "note": "Confirmed by phone call with customer"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated to CONFIRMED"
}
```

---

## 10. Reviews & Ratings

### 10.1 Submit Product Review (Verified Buyers Only)
* **Method:** `POST`
* **URL:** `/reviews`
* **Access:** Protected (`USER`)
* **Requirement:** Must have an order containing this product in `DELIVERED` status.
* **Request Body:**
```json
{
  "orderId": "order-uuid-1",
  "productId": "prod-uuid-1",
  "rating": 5,
  "comment": "Color and fabric quality exceeded my expectations!"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending admin approval."
}
```

---

### 10.2 Get Published Reviews for a Product
* **Method:** `GET`
* **URL:** `/products/:productId/reviews`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "rev-1",
      "rating": 5,
      "comment": "Color and fabric quality exceeded my expectations!",
      "user": {
        "name": "Rakibul Hasan",
        "avatar": "/uploads/avatars/avatar-123.jpg"
      },
      "createdAt": "2026-11-26T16:00:00.000Z"
    }
  ]
}
```

---

### 10.3 Publish / Approve Review (Admin Only)
* **Method:** `PATCH`
* **URL:** `/admin/reviews/:id/publish`
* **Access:** Admin (`ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Review published successfully"
}
```

---

## 11. Customer Management (Admin View)

### 11.1 List All Customers
* **Method:** `GET`
* **URL:** `/admin/customers`
* **Access:** Admin (`ADMIN`)
* **Query Parameters:** `page`, `limit`, `search` (name, email, phone)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-1",
      "name": "Rakibul Hasan",
      "email": "customer@example.com",
      "phone": "+8801328524369",
      "totalOrders": 5,
      "lifetimeSpend": 12500.00,
      "lastOrderDate": "2026-11-26T15:30:00.000Z",
      "firstOrderFreeDeliveryUsed": true,
      "createdAt": "2026-11-01T10:00:00.000Z"
    }
  ],
  "meta": { "total": 120, "page": 1, "limit": 10 }
}
```

---

### 11.2 Customer Dossier Details
* **Method:** `GET`
* **URL:** `/admin/customers/:id`
* **Access:** Admin (`ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "addresses": [ ... ],
    "orders": [ ... ],
    "totalSpent": 12500.00,
    "totalOrders": 5
  }
}
```

---

## 12. Support Tickets, Complaints & Refunds

### 12.1 Submit Support Ticket / Complaint
* **Method:** `POST`
* **URL:** `/support`
* **Access:** Public & Registered Users
* **Request Body:**
```json
{
  "name": "Rakibul Hasan",
  "email": "customer@example.com",
  "phone": "+8801328524369",
  "orderId": "order-uuid-1",
  "type": "COMPLAINT",
  "subject": "Missing button on delivered shirt",
  "message": "One sleeve button was missing upon arrival."
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Ticket submitted successfully",
  "data": {
    "ticketNumber": "TK-84920",
    "status": "OPEN"
  }
}
```

---

### 12.2 Issue Partial / Full Refund on Disputed Order (Admin Only)
* **Method:** `POST`
* **URL:** `/admin/support/:id/refund`
* **Access:** Admin (`ADMIN`)
* **Request Body:**
```json
{
  "refundAmount": 200.00,
  "adminRemarks": "Approved partial discount refund for missing button"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Refund recorded successfully"
}
```

---

## 13. Careers & Job Applications

### 13.1 List Open Job Postings (Public)
* **Method:** `GET`
* **URL:** `/jobs`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-1",
      "title": "Senior Frontend Developer (React / Next.js)",
      "department": "Engineering",
      "location": "Dhaka, Bangladesh",
      "type": "FULL_TIME",
      "description": "We are seeking an experienced developer...",
      "requirements": "- 3+ years experience in React/Next.js..."
    }
  ]
}
```

---

### 13.2 Submit Job Application (Public)
* **Method:** `POST`
* **URL:** `/jobs/:id/apply`
* **Access:** Public
* **Request Body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+8801811111111",
  "resumeUrl": "https://drive.google.com/file/d/your-resume",
  "coverLetter": "Excited to apply for this role..."
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

---

## 14. Notifications & Preferences

### 14.1 Get User / Admin Notifications
* **Method:** `GET`
* **URL:** `/notifications`
* **Access:** Protected (`USER`, `ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-1",
      "title": "Order Status Update",
      "message": "Your order KB-20261126-8942 has been dispatched for delivery!",
      "type": "ORDER_STATUS_UPDATE",
      "entityId": "order-uuid-1",
      "isRead": false,
      "createdAt": "2026-11-26T16:00:00.000Z"
    }
  ]
}
```

---

### 14.2 Mark Notification as Read
* **Method:** `PATCH`
* **URL:** `/notifications/:id/read`
* **Access:** Protected (`USER`, `ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 15. Admin Analytics & Dashboard

### 15.1 Overview KPI Metrics
* **Method:** `GET`
* **URL:** `/admin/analytics/overview`
* **Access:** Admin (`ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalDeliveredSales": 154200.00,
      "deliveredOrdersCount": 82,
      "totalNetRevenue": 149800.00,
      "totalCustomers": 145,
      "returnedOrdersCount": 3
    },
    "recentOrders": [ ... ],
    "recentReturnRequests": [ ... ]
  }
}
```

---

### 15.2 Sales & Revenue Chart Data
* **Method:** `GET`
* **URL:** `/admin/analytics/charts?filter=7d`
* **Access:** Admin (`ADMIN`)
* **Query Parameters:** `filter` = `7d` | `1m` | `3m` | `6m` | `12m`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "filter": "7d",
  "data": [
    { "date": "2026-11-20", "sales": 18200.00, "orders": 12 },
    { "date": "2026-11-21", "sales": 24500.00, "orders": 15 },
    { "date": "2026-11-22", "sales": 15000.00, "orders": 9 },
    { "date": "2026-11-23", "sales": 32000.00, "orders": 21 },
    { "date": "2026-11-24", "sales": 28900.00, "orders": 18 },
    { "date": "2026-11-25", "sales": 21000.00, "orders": 14 },
    { "date": "2026-11-26", "sales": 31400.00, "orders": 20 }
  ]
}
```

---

### 15.3 Status Breakdown & Reports
* **Method:** `GET`
* **URL:** `/admin/analytics/reports`
* **Access:** Admin (`ADMIN`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "statusCounts": {
      "PENDING": 4,
      "PROCESSING": 2,
      "CONFIRMED": 5,
      "PACKING": 3,
      "PACKED": 2,
      "DELIVERING": 8,
      "DELIVERED": 82,
      "CANCELLED": 6,
      "RETURNED": 3
    },
    "averageOrderValue": 1880.48,
    "cancellationRate": "6.3%",
    "returnRate": "3.1%",
    "topProducts": [
      {
        "productId": "prod-uuid-1",
        "name": "Premium Cotton Polo Shirt",
        "unitsSold": 142,
        "revenue": 144840.00
      }
    ]
  }
}
```
