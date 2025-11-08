const fs = require('fs');
const path = require('path');

// Helper functions
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatISO(date, offset) {
  const iso = date.toISOString();
  return iso.replace('Z', offset);
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Data pools
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Robert', 'Anna'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Ops'];
const roles = ['employee', 'manager', 'admin'];
const leaveTypes = ['Annual', 'Sick', 'Unpaid', 'Maternity'];
const statuses = ['Approved', 'Pending', 'Rejected'];
const timezones = ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
const locations = ['Mumbai, India', 'Bengaluru, India', 'New York, USA', 'London, UK', 'Tokyo, Japan'];

function generateEmployee(id) {
  const employee_id = `E${String(id).padStart(3, '0')}`;
  const first_name = randomChoice(firstNames) + randomInt(1, 100); // to make unique
  const last_name = randomChoice(lastNames) + randomInt(1, 100);
  const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@company.com`;
  const role = Math.random() < 0.8 ? 'employee' : Math.random() < 0.15 ? 'manager' : 'admin';
  const department = randomChoice(departments);
  const hire_date = formatDate(getRandomDate(new Date(2015, 0, 1), new Date()));
  const terminated = Math.random() < 0.1;
  const salary = randomInt(18000, 800000);
  const bank_account_last4 = String(randomInt(1000, 9999));
  const pay_frequency = Math.random() < 0.9 ? 'monthly' : 'biweekly';
  const timezone = randomChoice(timezones);
  const office_location = randomChoice(locations);
  const offset = timezone === 'Asia/Kolkata' ? '+05:30' : timezone === 'America/New_York' ? '-05:00' : timezone === 'Europe/London' ? '+00:00' : '+09:00';

  // Attendance
  const attendance = [];
  const hireDateObj = new Date(hire_date);
  const now = new Date();
  const daysSinceHire = Math.floor((now - hireDateObj) / (1000 * 60 * 60 * 24));
  const attendanceDays = Math.min(daysSinceHire, 90);
  for (let i = 0; i < attendanceDays; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
    if (Math.random() < 0.05) continue; // absent
    const inTime = new Date(date);
    inTime.setHours(randomInt(8, 10), randomInt(45, 59));
    let outTime = null;
    let duration = null;
    if (Math.random() > 0.05) { // not missing out
      outTime = new Date(date);
      outTime.setHours(randomInt(17, 19), randomInt(0, 30));
      duration = Math.floor((outTime - inTime) / (1000 * 60));
    }
    attendance.push({
      date: formatDate(date),
      in_time: formatISO(inTime, offset),
      out_time: outTime ? formatISO(outTime, offset) : null,
      duration_minutes: duration,
      notes: Math.random() < 0.1 ? 'Late' : undefined
    });
  }

  // Leave requests
  const leave_requests = [];
  const numLeaves = randomInt(0, 6);
  for (let i = 0; i < numLeaves; i++) {
    const start = getRandomDate(new Date(now.getFullYear() - 1, now.getMonth(), 1), now);
    const end = new Date(start);
    end.setDate(end.getDate() + randomInt(1, 10));
    leave_requests.push({
      request_id: `LR-${randomInt(100, 999)}`,
      start_date: formatDate(start),
      end_date: formatDate(end),
      type: randomChoice(leaveTypes),
      status: randomChoice(statuses),
      created_at: formatISO(new Date(), offset),
      conflict: Math.random() < 0.06
    });
  }

  // Payroll
  const monthlyGross = pay_frequency === 'monthly' ? Math.round(salary / 12) : Math.round(salary / 24);
  const pf = terminated || salary < 25000 ? 0 : Math.round(0.12 * monthlyGross);
  let tax = 0;
  if (monthlyGross > 50000) {
    tax = (monthlyGross - 50000) * 0.2 + 25000 * 0.1;
  } else if (monthlyGross > 25000) {
    tax = (monthlyGross - 25000) * 0.1;
  }
  const other_deductions = randomInt(0, 1500);
  const net = monthlyGross - pf - tax - other_deductions;
  const payroll = {
    pay_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    gross: monthlyGross,
    pf,
    tax: Math.round(tax),
    other_deductions,
    net,
    status: net < 0 ? 'RequiresReview' : terminated ? 'Failed' : 'Done'
  };

  const metadata = {
    timezone,
    office_location,
    notes: Math.random() < 0.1 ? 'New hire' : undefined
  };

  return {
    employee_id,
    first_name,
    last_name,
    email,
    role,
    department,
    hire_date,
    terminated,
    salary,
    bank_account_last4,
    pay_frequency,
    attendance,
    leave_requests,
    payroll,
    metadata
  };
}

const employees = [];
for (let i = 1; i <= 100; i++) {
  employees.push(generateEmployee(i));
}

// Add anomalies
// Duplicate email
employees[1].email = employees[0].email;
employees[1].metadata.duplicate_email = true;

// Long names
employees[2].first_name = 'A'.repeat(100);
employees[3].last_name = 'B'.repeat(100);

// Missing fields
delete employees[4].bank_account_last4;
delete employees[5].department;

// Future hire
employees[6].hire_date = formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));

// Different timezone
employees[7].metadata.timezone = 'America/Los_Angeles';

fs.writeFileSync(path.join(__dirname, '../seed-data/employees.json'), JSON.stringify(employees, null, 2));
console.log('Generated 100 employee records in seed-data/employees.json');