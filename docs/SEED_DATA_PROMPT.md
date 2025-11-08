# Seed Data Generation Prompt

## Single Seed-Data Prompt (Generate 100 JSON Records)

**INSTRUCTIONS:** Copy-paste this entire prompt into your AI data-generator (ChatGPT/Claude/Copilot) and request the output as **pure JSON array** (no explanatory text).

---

```
Generate 100 synthetic HRMS dataset records in a single JSON array. Each element in the array must be an object representing a single employee profile plus nested arrays for attendance, leaves, and payroll summary. Output only valid JSON (no commentary). Use realistic-looking synthetic but non-identifying data (no real names). Observe the schema, types, distributions, and edge cases described below.

SCHEMA FOR EACH EMPLOYEE OBJECT:
{
  "employee_id": "<E###>"                         // string, unique (E001..E100)
  "first_name": "<string>",
  "last_name": "<string>",
  "email": "<string>",                           // unique, valid format
  "role": "<string>",                            // one of ["employee","manager","admin"]
  "department": "<string>",                      // sample depts: HR, Engineering, Sales, Finance, Ops
  "hire_date": "<YYYY-MM-DD>",                   // past date within last 10 years
  "terminated": <boolean>,                       // ~10% true
  "salary": <number>,                            // annual gross in integer INR or USD; distribution below
  "bank_account_last4": "<digits4>",             // string of last 4 digits
  "pay_frequency": "<string>",                   // "monthly" or "biweekly" (mostly monthly)
  "attendance": [                                // array of attendance records for last 90 days (or fewer if hire date recent)
    { "date":"YYYY-MM-DD", "in_time":"ISO", "out_time":"ISO or null", "duration_minutes": <int or null>, "notes": "<optional>" }
  ],
  "leave_requests": [                            // up to 6 items
    { "request_id":"LR-###", "start_date":"YYYY-MM-DD", "end_date":"YYYY-MM-DD", "type":"Annual|Sick|Unpaid|Maternity", "status":"Pending|Approved|Rejected", "created_at":"ISO", "conflict": <boolean> }
  ],
  "payroll": {                                   // last computed payroll summary for recent month
    "pay_month":"YYYY-MM", "gross": <number>, "pf": <number>, "tax": <number>, "other_deductions": <number>, "net": <number>, "status":"Done|RequiresReview|Failed"
  },
  "metadata": {                                   // small meta info
    "timezone": "<IANA tz e.g. Asia/Kolkata>", "office_location":"City, Country", "notes":"optional"
  }
}

DATA RULES & DISTRIBUTIONS:
1. Roles: 80% "employee", 15% "manager", 5% "admin".
2. Departments: distribute across Engineering (30%), Sales (20%), HR (10%), Finance (15%), Ops (25%).
3. Salary distribution (annual gross):
   - 15% low: 18000–24000 (intern/part-time)
   - 50% mid: 30000–120000
   - 25% high: 120000–300000
   - 10% extremely high: 300000–800000 (senior/executive)
4. Hire_date: random within last 10 years; ensure some with hire_date in last 30 days (new hires ~5%).
5. terminated true ~10%: terminated employees should have no payroll `status: Done` for the latest month.
6. Attendance: generate last 90 days of business-day attendance for the employee if hire_date older than 90 days. For each business day:
   - Normal day: in_time between 08:45–10:15 local time, out_time between 17:00–19:30; duration = minutes difference.
   - Absent: 5–10% days missing record.
   - Late arrival: 8–12% days with in_time > 10:30.
   - Missing out_time (forgot to punch): 2–5% of present days -> out_time null.
   - Overnight shifts: randomly for 2 employees create 3 overnight records (in_time before midnight, out_time next day morning).
   - Create at least 3 employees with duplicate in_time (two INs without OUT), to test dedup handling.
7. Leaves: create up to 6 leave requests per employee with realistic types. Include:
   - Approvals: 60% of requests Approved, 30% Pending, 10% Rejected.
   - Overlapping leaves: inject overlap conflict=true for ~6% of all requests.
   - Edge-case: one leave with start_date == end_date; one with end_date < start_date to test validation.
8. Payroll calculation:
   - gross = annual/monthly gross depending on pay_frequency (if monthly: monthly_gross=round(salary/12)).
   - pf = round(0.12 * monthly_gross) for employees (but for edge cases set pf=0 for interns and terminated employees).
   - tax: progressive simple bracket: 0% up to 25000 monthly, 10% for next 25000, 20% above that (apply to monthly gross).
   - other_deductions random small amounts (0–1500).
   - net = gross - (pf + tax + other_deductions).
   - If net < 0 set status "RequiresReview" and leave net negative (to detect handling).
   - Provide at least 2 payrolls where deductions > gross (to test flagging).
9. Data anomalies to include:
   - 2 employees with duplicate email addresses (to test uniqueness constraints). Mark one as `duplicate_email=true` in metadata.
   - 3 employees with extremely long names (200+ chars) to test truncation.
   - 4 entries with missing optional `bank_account_last4` or missing `department`.
   - 5 employees whose timezone differs from office_location timezone (test timezone handling).
   - 2 employees with hire_date in the future (to test validation).
10. Timestamps: use ISO 8601 with timezone offset matching employee timezone, e.g., "2025-11-08T09:15:00+05:30".

FORMAT & OUTPUT:
- Output exactly a single JSON array with 100 objects that follow the schema above.
- Do not include comments or explanation—only JSON.
- Make values realistic and internally consistent (attendance dates must be on or after hire_date; leaves within recent 12 months; payroll pay_month must be the most recent month with at least 85% attendance unless terminated).
- Include a top-level summary object is NOT allowed; output only the array.

EXAMPLES (for reference only, do not output text):
- employee_id "E001"
- sample attendance item: { "date": "2025-11-01", "in_time":"2025-11-01T09:05:00+05:30", "out_time":"2025-11-01T18:10:00+05:30", "duration_minutes": 545 }

Edge-case guidance:
- Ensure about 6% leave requests have `conflict:true`.
- Ensure at least one payroll where `net` is negative.
- Ensure both `monthly` and `biweekly` pay_frequency are represented (mostly monthly).
- Use realistic city names for office_location (Mumbai, Bengaluru, New York, London).

Return the 100-record JSON array now.
```

---

## Usage Instructions

1. **Copy the entire prompt above** (between the triple backticks)
2. **Paste into your AI agent** (ChatGPT-4, Claude, or any JSON generator)
3. **Request output format**: "Return only the JSON array, no explanations"
4. **Save the output** to `backend/seed-data/employees.json`
5. **Create a seed script** that imports this JSON and populates your MongoDB database

## Sample Seed Script Location

Create: `backend/scripts/seedDatabase.js`

```javascript
// backend/scripts/seedDatabase.js
const fs = require('fs');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const seedData = JSON.parse(fs.readFileSync('./seed-data/employees.json', 'utf8'));

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  for (const emp of seedData) {
    // Insert employee
    const employee = await Employee.create({ ...emp });
    
    // Insert attendance records
    for (const att of emp.attendance) {
      await Attendance.create({ ...att, employee: employee._id });
    }
    
    // Insert leaves
    for (const leave of emp.leave_requests) {
      await Leave.create({ ...leave, employee: employee._id });
    }
  }
  
  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed();
```

Run: `node backend/scripts/seedDatabase.js`
