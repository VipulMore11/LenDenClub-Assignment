# LumaPay - Peer-to-Peer Lending Platform


## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Project Overview

LumaPay peer-to-peer wallet application that simulates real-time fund transfers between users while maintaining a mandatory, immutable audit log of all transactions. It enables users to:
- Create secure user accounts
- Track their lending and borrowing activities
- Transfer funds to other users securely
- View transaction history with real-time balance updates
- Monitor transaction status (Success/Failed)


## ✨ Features

### Authentication & Authorization
- User registration with email validation
- Secure login with JWT (JSON Web Token) authentication
- Password hashing with industry-standard algorithms
- Protected API endpoints with token-based authorization
- Logout functionality with token invalidation

### Transaction Management
- Send money to other users via email
- Real-time balance updates
- Transaction history with filtering and sorting
- Status tracking (Success/Failed)
- Support for sent and received transactions
- Transaction timestamps for audit trail

### User Interface
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS for modern styling
- Real-time form validation
- Error and success notifications
- Loading states for better UX
- Dashboard with balance card and transaction table

### Security
- CORS (Cross-Origin Resource Sharing) protection
- SQL injection prevention via ORM
- Secure password storage
- JWT token expiration
- Environment-based configuration

## 🛠 Tech Stack

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Authentication**: SimpleJWT (JSON Web Tokens)
- **Database**: SQLite (development)

### Frontend
- **Framework**: React 19
- **Routing**: React Router
- **HTTP Client**: Axios with interceptor
- **Styling**: Tailwind CSS
- **State Management**: React Context API


## 📁 Project Structure

```
LumaPay/
├── backend/
│   ├── api/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py          # User & Transaction models
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── views.py           # API endpoints
│   │   └── __pycache__/
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── db.sqlite3
│   ├── manage.py
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   ├── Dockerfile
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # HTTP client with interceptor
│   │   ├── components/
│   │   │   ├── TransferForm.jsx
│   │   │   └── TransactionTable.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── setupTests.js
│   ├── package.json
│   ├── .env                   # Environment variables
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
├── .gitignore
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LumaPay
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   if windows:
        venv\Scripts\activate
    else:
        source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional, for Django admin)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file
   echo "REACT_APP_API_BASE_URL=http://127.0.0.1:8000" > .env
   ```

3. **Run development server**
   ```bash
   npm start
   ```
   Frontend will be available at `http://localhost:3000`


## 📡 API Documentation

### Postman Collection :- 
```
https://pocket-book-developers.postman.co/workspace/AlignTurtle~0d185443-c0ba-4089-a37e-f383e9833312/collection/32954460-a00b62cb-f221-424c-8d64-26d550f6f00e?action=share&creator=32954460
```

### Base URL
```
http://127.0.0.1:8000
```

### Authentication Endpoints

#### Sign Up
```
POST /signup/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "secure_password"
}

Response (201):
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe"
}
```

#### Login
```
POST /login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response (200):
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "balance": 1000.00
  }
}
```

### Transaction Endpoints

#### Get All Transactions
```
GET /transactions/
Authorization: Bearer <access_token>

Response (200):
[
  {
    "id": 1,
    "sender": "user1@example.com",
    "receiver": "user2@example.com",
    "amount": 500.00,
    "timestamp": "2025-12-21T10:30:00Z",
    "status": "SUCCESS",
    "balance": 500.00
  },
  ...
]
```

#### Get Transactions with Filters
```
GET /transactions/?type=SENT&status=SUCCESS
Authorization: Bearer <access_token>

Query Parameters:
- type: SENT | RECEIVED | ALL (default: ALL)
- status: SUCCESS | FAILED | ALL (default: ALL)
```

#### Send Money
```
POST /transfer/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "receiver_email": "recipient@example.com",
  "amount": 250.50
}

Response (201):
{
  "id": 2,
  "sender": "user1@example.com",
  "receiver": "recipient@example.com",
  "amount": 250.50,
  "timestamp": "2025-12-21T11:00:00Z",
  "status": "SUCCESS",
  "balance": 249.50
}

Error (400):
{
  "error": "Insufficient balance" | "Invalid receiver email" | "Cannot send to yourself"
}
```

## 💾 Database Schema

![alt text](image.png)

## 🔧 Environment Configuration

### Backend (.env)
```env
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key-here


### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```
