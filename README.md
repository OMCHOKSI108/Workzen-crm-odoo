# WorkZen HRMS

## 🚀 **Live Application**

### **Frontend (Vercel):** https://workzen-fmegwl21x-om-choksi-s-projects.vercel.app
### **Backend API (Render):** https://workzen-crm-odoo.onrender.com
### **API Documentation:** https://workzen-crm-odoo.onrender.com (visit root for endpoint details)

---

## 🎯 **Quick Start**

1. **Visit the live app:** https://workzen-fmegwl21x-om-choksi-s-projects.vercel.app
2. **Register your company** or use demo credentials
3. **Explore features:** Employee management, attendance tracking, leave management, payroll

---

## 🏗️ **Architecture**

- **Frontend:** React + Vite deployed on **Vercel**
- **Backend:** Node.js + Express deployed on **Render**
- **Database:** MongoDB Atlas (cloud)
- **Authentication:** JWT with role-based access control
- **Multi-tenant:** Company-scoped data isolation

---

### Problem Description

Modern organizations face significant challenges in managing human resources efficiently, particularly in tracking employee attendance, managing leave requests, processing payroll, and maintaining comprehensive employee records. Traditional HR systems are often fragmented, requiring multiple platforms and manual processes that lead to inefficiencies, errors, and poor employee experience. Small to medium enterprises especially struggle with expensive enterprise solutions that are either too complex or lack essential features for streamlined HR operations.

The challenge lies in creating a unified, user-friendly Human Resource Management System that can handle the complete employee lifecycle from onboarding to payroll processing. Organizations need a solution that provides real-time attendance tracking, automated leave management, integrated payroll calculations with tax considerations, and comprehensive reporting capabilities. The system must be accessible, scalable, and provide both employees and HR administrators with intuitive interfaces for their respective workflows.

Furthermore, with the increasing emphasis on digital transformation and remote work capabilities, there is a critical need for an HRMS that supports modern workplace requirements including mobile accessibility, secure authentication, role-based access control, and seamless integration capabilities. The solution should also accommodate different regional requirements such as multi-currency support and local tax regulations like GST calculations for contractor payments.

## Code Stack

### Frontend Technologies
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **JavaScript/JSX** - Component-based architecture
- **CSS3** - Custom styling with CSS variables and responsive design

### Backend Technologies
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing and encryption

### Development Tools
- **Docker** - Containerization for consistent deployment
- **Docker Compose** - Multi-container application management
- **Git** - Version control system
- **VS Code** - Development environment

### Additional Libraries
- **jsPDF** - Client-side PDF generation
- **html2pdf.js** - HTML to PDF conversion
- **CORS** - Cross-Origin Resource Sharing middleware
- **dotenv** - Environment variable management

## File Structure

```
WorkZen-HRMS/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   ├── userController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Payroll.js
│   │   └── Settings.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── leaves.js
│   │   ├── payroll.js
│   │   ├── users.js
│   │   └── settings.js
│   ├── scripts/
│   │   └── seedDatabase.js
│   ├── seed-data/
│   │   └── employees.json
│   ├── app.js
│   ├── server.js
│   ├── healthcheck.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── CurrencySelector.jsx
│   │   │   └── PayslipTemplate.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── TimeOff.jsx
│   │   │   ├── Payroll.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── api/
│   │   │   └── http.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── docs/
│   ├── ACCEPTANCE_CRITERIA.md
│   ├── TESTING_CHECKLIST.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── SEED_DATA_PROMPT.md
├── assets/
│   ├── 01.png
│   ├── 02.png
│   ├── 03.png
│   └── 04.png
├── docker-compose.yml
└── README.md
```

LINK : 
BACKEND : https://workzen-crm-odoo.onrender.com
FRONTEND : https://workzen-crm.vercel.app

## 🌐 **Deployment Information**

### **Frontend (Vercel)**
- **URL:** https://workzen-crm.vercel.app
- **Technology:** React + Vite
- **Features:** Server-side rendering, global CDN, automatic HTTPS
- **Build:** Automatic deployment from Git pushes

### **Backend (Render)**
- **URL:** https://workzen-crm-odoo.onrender.com
- **Technology:** Node.js + Express
- **Database:** MongoDB Atlas
- **Features:** Auto-deploy, health checks, environment variables
- **CORS:** Configured for frontend domain

### **API Endpoints**
Visit the backend URL for complete API documentation with all available endpoints, authentication requirements, and response formats.

---

### Dashboard Overview
![Dashboard](./assets/01.png)

### Employee Management
![Employee Management](./assets/02.png)

### Attendance Tracking
![Attendance Tracking](./assets/03.png)

### Payroll Processing
![Payroll Processing](./assets/04.png)

## Features

### Core Functionality
- User authentication and role-based access control
- Employee management with comprehensive profiles
- Real-time attendance tracking and management
- Leave request and approval workflow
- Automated payroll calculation and processing
- Professional payslip generation with PDF export
- Multi-currency support (USD, EUR, GBP, INR)
- GST calculation for contractor payments
- Comprehensive reporting and analytics

### Technical Features
- Responsive web design for desktop and mobile
- RESTful API architecture
- JWT-based secure authentication
- Database seeding with realistic test data
- Docker containerization for easy deployment
- Health checks and monitoring
- Error handling and logging
- CORS-enabled cross-origin requests

### User Roles
- **Admin**: Full system access including settings and user management
- **HR Officer**: Employee and attendance management, leave approval
- **Payroll Officer**: Payroll processing and financial reports
- **Employee**: Personal attendance, leave requests, payslip access

## Author

**Om Choksi**  
