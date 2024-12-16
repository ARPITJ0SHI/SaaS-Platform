# SaaS Application with Stripe Integration

A full-stack SaaS (Software as a Service) application with subscription management using Stripe, built with React and Node.js.

## 🚀 Features

- User Authentication and Authorization
- Organization Management
- Subscription Plans Management
- Stripe Payment Integration
- Responsive Material-UI Design
- Role-based Access Control

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router DOM
- Formik & Yup for form validation
- React Query for data fetching
- Axios for API calls
- Stripe.js for payment integration
- Vite as build tool

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Stripe API Integration
- Express Validator
- CORS enabled

## 📦 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe Account
- Environment variables configured

## 🔧 Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌟 Available Scripts

### Backend
- `npm run dev`: Start development server with nodemon
- `npm start`: Start production server
- `npm run seed:superadmin`: Seed super admin user
- `npm run seed:plans`: Seed subscription plans

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## 🔐 API Endpoints

### Authentication
- POST `/api/auth/register`: Register new user
- POST `/api/auth/login`: User login

### Users
- GET `/api/users`: Get users
- PUT `/api/users/:id`: Update user

### Organizations
- POST `/api/organizations`: Create organization
- GET `/api/organizations`: Get organizations
- PUT `/api/organizations/:id`: Update organization

### Plans
- GET `/api/plans`: Get subscription plans
- POST `/api/plans`: Create plan (admin only)

### Stripe
- POST `/api/stripe/create-subscription`: Create subscription
- POST `/api/stripe/webhook`: Stripe webhook handler

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 