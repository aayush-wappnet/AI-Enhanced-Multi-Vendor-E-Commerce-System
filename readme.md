# AI-Enhanced Multi-Vendor E-Commerce System

A full-stack, AI-driven multi-vendor e-commerce platform built with **NestJS**, **Angular**, **TypeScript**, and **PostgreSQL**, designed to provide a seamless shopping experience with advanced AI features.

## 🚀 Features

### 🔑 User Authentication
- Register and Login for Customers, Vendors, and Admins
- JWT-based authentication with Role-Based Access Control (RBAC)
- Protected routes for different user roles

### 🛒 E-Commerce Functionalities
- **Customer Features**:
  - Browse products 
  - Add products to cart 
  - Place, track, and cancel orders

- **Vendor Features**:
  - Register as a vendor
  - List, edit, and remove products (physical, digital, subscriptions)
  - Manage inventory
- **Admin Features**:
  - Manage vendors, products, and orders
  - Admin dashboard with sales analytics, best-selling products, and vendor performance


### 🤖 AI-Powered Features
- **Product Recommendations**: Suggests products in products details page based on categoy of product. 
- **Chatbot Support**: AI-powered chatbot for customer support and order queries (integrated with Hugging Face API)

### 💳 Payment Integration
- Secure payments via **Stripe** for seamless checkout



---

## 🛠 Tech Stack

### Backend
- **NestJS** (v10 or higher)
- **PostgreSQL**
- **TypeORM**
- **JWT Authentication**
- **Class Validator**
- **DTOs (Data Transfer Objects)**
- **Hugging Face API** (for AI chatbot and recommendations)
- **Cloudinary** (for image storage)
- **Stripe** (for payment processing)

### Frontend
- **Angular** (v16.0.0 or higher)
- **TypeScript**
- **Angular Material**
- **RxJS**
- **Reactive Forms**
- **Angular Router**
- **HttpClient**

---

## Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **npm**
- **PostgreSQL**
- **Hugging Face API Token**
- **Cloudinary Account**
- **Stripe Account**

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
 ```bash
    npm install
```
3. Create a `.env` file in the backend directory with the following variables:
   ```
    PORT=5000
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_NAME=ecommerce
    JWT_SECRET=your_jwt_secret
    HUGGINGFACE_API_TOKEN=your_huggingface_token
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```

5. The backend API will be available at http://localhost:5000



### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment files in frontend/src/environments/:
    ```
        export const environment = {
        production: false,
        apiUrl: 'http://localhost:5000',
        stripePublicKey: 'your_stripe_public_key'
        };
    ```

4. Start the development server:
 ```bash
    ng serve
```
5. The frontend application will be available at http://localhost:4200


## API Documentation

The complete API documentation is available on Postman:
[Multi-Vendor Ecommerce API Documentation](https://documenter.postman.com/preview/43270454-c4369ae9-de7a-4b33-aac7-7b3b08ee9a89?environment=&versionTag=latest&apiName=CURRENT&version=latest&documentationLayout=classic-double-column&documentationTheme=light&logo=https%3A%2F%2Fres.cloudinary.com%2Fpostman%2Fimage%2Fupload%2Ft_team_logo%2Fv1%2Fteam%2Fanonymous_team&logoDark=https%3A%2F%2Fres.cloudinary.com%2Fpostman%2Fimage%2Fupload%2Ft_team_logo%2Fv1%2Fteam%2Fanonymous_team&right-sidebar=303030&top-bar=FFFFFF&highlight=FF6C37&right-sidebar-dark=303030&top-bar-dark=212121&highlight-dark=FF6C37)


# 📽️ Multi-Vendor Ecommerce - Demo Video  

Watch the demo of the **Multi-Vendor Ecommerce**:  
🔗 **[Click here to watch the demo](https://drive.google.com/file/d/1UOWps0XXWWmrnetPL-d8MZU6X9ce0cMU/view?usp=sharing)** 
