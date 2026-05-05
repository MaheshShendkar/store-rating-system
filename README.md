# 🏪 Store Rating System

A full-stack web application that allows users to browse stores, give ratings & reviews, and enables store owners and admins to manage the platform.

Built using **Spring Boot (Backend)**, **React (Frontend)**, and **MySQL (Database)** with secure **JWT Authentication**.

---

## 🚀 Features

### 🔐 Authentication & Security
- User Registration & Login
- JWT-based authentication
- Role-based access control (ADMIN, USER, OWNER)

### 🏪 Store Management
- Create store (Owner/Admin)
- Update & delete own store
- View all stores
- Filter/search stores

### ⭐ Review System
- Users can add ratings & reviews
- View reviews of a store
- Owner can view reviews of their store

### 👤 User Management (Admin)
- View all users
- Manage system data

---

## 🎭 User Roles

| Role | Permissions |
|------|------------|
| ADMIN | Manage users, stores, reviews |
| OWNER | Create & manage own stores |
| USER | Browse stores & add reviews |

---

## 🛠️ Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Hibernate / JPA
- MySQL

### Frontend
- React.js
- Axios
- React Router
- CSS

---

## 🏗️ Project Structure
store-rating-system/
├── src/ # Spring Boot backend
├── store-rating-frontend/ # React frontend
├── pom.xml


---

## ⚙️ Setup Instructions

### 🔹 1. Backend Setup
mvn clean install
mvn spring-boot:run

###🔹 2. Frontend Setup
cd store-rating-frontend
npm install
npm run dev

## 🔐 API Endpoints
** Auth APIs
-POST /api/auth/register
-POST /api/auth/login

** Store APIs
GET /api/stores
POST /api/stores
PUT /api/stores/{id}
DELETE /api/stores/{id}

** Review APIs
POST /api/reviews
GET /api/reviews/store/{storeId}



