
# 🚀 FastFeet Delivery Management API
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/cf847ba8-5850-407c-9290-85e1cbe760fe" />

**Capstone Project – Rocketseat NodeJS Specialization**

A **production-ready delivery management API** for the fictional courier company FastFeet. Built with **NodeJS**, **NestJS**, **PostgreSQL**, and **Docker**, following **Clean Architecture**, **Domain-Driven Design (DDD)**, and **Test-Driven Development (TDD)** principles.

This project showcases a **scalable, secure, and maintainable backend system** with real-world delivery workflows and robust architecture.

---

## ✨ Core Features

- **User Authentication**: Login using **Document ID** and password for **Admins** and **Couriers**.
- **Role-Based Access Control (RBAC)**: Only admins can manage critical resources.
- **CRUD Operations**:
  - **Couriers**: Full lifecycle management
  - **Deliveries**: Create, update, track, and complete deliveries
  - **Recipients**: Manage delivery destinations
- **Delivery Workflow**:
  - Mark deliveries as **awaiting**, **picked up**, **delivered**, or **returned**
  - **Photo required** for confirming delivery
  - Only the **assigned courier** can complete a delivery
- **Notifications**: Automatic email updates to recipients on status changes
- **Password Management**: Admins can reset any user’s password
- **Secure & Robust**: Full authorization, validation, and business rule enforcement

---

## 🛠 Tech Stack & Tools

| Layer | Technology |
|-------|------------|
| Backend | NodeJS, NestJS, TypeScript |
| Database | PostgreSQL |
| Testing | Jest, Supertest (Unit & E2E) |
| Authentication | JWT |
| Storage & Media | Cloudinary (delivery photo uploads) |
| Email Notifications | Nodemailer |
| API Documentation | Swagger |
| Deployment | Docker, ready for cloud environments |
| Architecture | Clean Architecture, Domain-Driven Design (DDD) |

---

## 💎 Highlights

- Enterprise-grade **Clean Architecture & DDD**
- Real-world **business rules and RBAC**
- **Photo verification** for delivery integrity
- **Automated notifications** show integration skills
- **PostgreSQL & Docker** for production-ready environment
- Fully **tested with TDD**, ensuring reliability and maintainability
- Scalable and **cloud-ready**, designed for real-world usage

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone git@github.com:thiagohrcosta/FastFeet-API.git

# Install dependencies
npm install

# Start docker
docker-compose up

# Start the development server
npm run start:dev

# Run tests
npm run test
```

## Certificate
<img width="1241" height="818" alt="image" src="https://github.com/user-attachments/assets/c6374395-9210-4a72-a1a0-dd0292f6a272" />

