# WorkZen HRMS Frontend

React frontend for HRMS system.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- Role-based authentication and routing
- Dashboard with charts and KPIs
- Employee management
- Attendance tracking
- Leave requests
- Payroll simulation
- Payslip viewing

## Mock Data

The frontend currently uses mock data. To connect to the real backend:

1. Ensure the backend is running on `http://localhost:4000`
2. Replace mock data in pages with actual API calls using the `api` instance from `src/api/http.js`

Example:
```javascript
// Instead of mock data
const [employees, setEmployees] = useState(mockData);

// Use real API
useEffect(() => {
  api.get('/employees').then(response => setEmployees(response.data));
}, []);
```

## Sample Users

Use the same credentials as the backend:
- Admin: admin@workzen.com / admin123
- Employee: employee@workzen.com / emp123
