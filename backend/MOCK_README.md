# WorkZen API Mock Server

This mock server provides realistic API responses for testing and development using the OpenAPI 3.0 specification.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the mock server:
```bash
npm run mock
```

The mock server will run on `http://localhost:4010`

## Example API Calls

### Authentication

#### Login as Employee
```bash
curl -X POST http://localhost:4010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@workzen.com",
    "password": "password123"
  }'
```

#### Login as HR
```bash
curl -X POST http://localhost:4010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@workzen.com",
    "password": "password123"
  }'
```

#### Login as Payroll Officer
```bash
curl -X POST http://localhost:4010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "payroll@workzen.com",
    "password": "password123"
  }'
```

#### Get Current User Profile
```bash
curl -X GET http://localhost:4010/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Attendance

#### Punch In/Out
```bash
curl -X POST http://localhost:4010/attendance/punch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "in"
  }'
```

#### Get Attendance Records
```bash
curl -X GET "http://localhost:4010/attendance?employeeId=64f1a2b3c4d5e6f7g8h9i0j4&from=2024-12-01&to=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Leave Management

#### Apply for Leave
```bash
curl -X POST http://localhost:4010/leaves \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-15",
    "endDate": "2024-01-17",
    "type": "annual",
    "reason": "Family vacation"
  }'
```

#### Get Leave Requests
```bash
curl -X GET "http://localhost:4010/leaves?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Approve Leave (HR/Admin only)
```bash
curl -X POST http://localhost:4010/leaves/64f1a2b3c4d5e6f7g8h9i0j6/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Approved for family vacation"
  }'
```

### Payroll

#### Simulate Payrun
```bash
curl -X POST http://localhost:4010/payroll/payrun/simulate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 12,
    "year": 2024,
    "employeeIds": ["64f1a2b3c4d5e6f7g8h9i0j4"]
  }'
```

#### Commit Payrun
```bash
curl -X POST http://localhost:4010/payroll/payrun/commit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payrunId": "64f1a2b3c4d5e6f7g8h9i0j7"
  }'
```

#### Get Payslips
```bash
curl -X GET "http://localhost:4010/payroll/payslips?month=12&year=2024" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reports

#### Payroll Report
```bash
curl -X GET "http://localhost:4010/reports/payroll?month=12&year=2024" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Attendance Report
```bash
curl -X GET "http://localhost:4010/reports/attendance?from=2024-12-01&to=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Leave Report
```bash
curl -X GET "http://localhost:4010/reports/leaves?from=2024-12-01&to=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Sample Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workzen.com | password123 |
| HR | hr@workzen.com | password123 |
| Payroll | payroll@workzen.com | password123 |
| Employee | employee@workzen.com | password123 |

## Notes

- The mock server uses static responses defined in `mock-data.js`
- JWT tokens are mocked and not validated
- All endpoints return example data regardless of input parameters
- Use this for frontend development and API testing before implementing the real backend