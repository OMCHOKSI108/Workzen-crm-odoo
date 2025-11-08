# WorkZen HRMS Backend

Node.js + Express REST API for HRMS system.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/workzen
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=4000
   ```

3. Start MongoDB locally or update MONGODB_URI for your database.

4. Seed the database:
   ```bash
   node seed.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (admin/hr)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (admin/hr)
- `PUT /api/employees/:id` - Update employee (admin/hr)

### Attendance
- `POST /api/attendance/punch` - Punch in/out
- `GET /api/attendance` - Get attendance records
- `PUT /api/attendance/:id` - Update attendance (admin/hr)

### Leaves
- `GET /api/leaves` - Get all leaves
- `GET /api/leaves/pending` - Get pending leaves (admin/hr)
- `POST /api/leaves` - Create leave request
- `POST /api/leaves/:id/approve` - Approve/reject leave (admin/hr)

### Payroll
- `POST /api/payroll/payrun/simulate` - Simulate payrun (admin/payroll)
- `POST /api/payroll/payrun/:id/commit` - Commit payrun (admin/payroll)
- `GET /api/payroll/payrun/:id` - Get payrun
- `GET /api/payroll/payslips` - Get payslips

## Sample Users

After seeding:
- Admin: admin@workzen.com / admin123
- HR: hr@workzen.com / hr123
- Payroll: payroll@workzen.com / payroll123
- Employee: employee@workzen.com / emp123