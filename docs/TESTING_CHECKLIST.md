# Full Testing Checklist

Use this list to create unit tests, integration tests, smoke tests, and manual QA steps. Mark PASS/FAIL for each.

## A. Smoke / Sanity (high priority)

- [ ] App loads homepage (dashboard route) without console errors. **Expected**: 200 HTML, no JS errors.
- [ ] Header is visible and fixed. **Expected**: header remains at top while scrolling.
- [ ] Sidebar visible on desktop and collapses on mobile. **Expected**: toggles working.

## B. Layout & Visuals (high)

- [ ] Hero full-bleed on 1440px, 1024px, 375px. **Expected**: image/gradient spans edges on desktop, responsive on mobile.
- [ ] No horizontal scroll bar appears due to layout. **Expected**: overflow-x hidden.

## C. Accessibility (high)

- [ ] Keyboard navigation: tab through header > sidebar > content; all interactive elements focusable and visible.
- [ ] ARIA labels exist for main controls (sidebar toggle, punch buttons).
- [ ] Color contrast: body text and buttons pass WCAG AA.

## D. Authentication & Authorization (high)

- [ ] Admin login sees Employees, Payroll. Employee login sees only Payslip, Attendance.
- [ ] Attempt to access admin endpoint as employee returns 403.

## E. Attendance (critical)

- [ ] Punch In creates record with `in_time` and status `IN`. **Expected**: correct ISO timestamp stored.
- [ ] Punch Out for matching day updates latest record with `out_time` and sets `duration`. **Expected**: `duration = out_time - in_time` (minutes).
- [ ] Prevent duplicate In-In or Out-Out; show descriptive error.
- [ ] Multiple In/Out across midnight handled: day-bound rules applied; test punching before midnight and out after midnight.

## F. Leaves (high)

- [ ] Submit leave: creates `leave_request` with `start_date, end_date, type, reason, status=Pending`.
- [ ] Manager approves: status flips to Approved, employee notified.
- [ ] Overlapping leave: create conflict flag on request and manager dashboard.
- [ ] Edge: start_date == end_date (single day) accepted; end_date < start_date rejected.

## G. Payroll & Payslip (critical)

- [ ] Run payroll simulator for month/year returns list of employees with `gross`, `deductions` (PF, tax), `net`, `status`.
- [ ] Formula validation: net >= 0; if net < 0, `status = requires_review` and flagged in UI.
- [ ] Payslip generated for employee-month matches payroll simulator numbers and is printable (print preview shows only payslip content).
- [ ] Download PDF trigger calls `window.print()` or export library; file displays net pay.

## H. Data Integrity & Edge Cases (critical)

- [ ] Employee with `terminated=true`: does not appear in active payroll runs.
- [ ] Employee with `0` salary: payroll calculates zero earnings but still shows deductions of 0.
- [ ] Deductions > gross: payroll marks `requires_review`.
- [ ] Missing attendance entries for entire month: payroll prorates if policy requires or flags absent days.

## I. API & Backend (integration)

- [ ] All relevant endpoints return correct schema and status codes (200 success, 400 validation, 403 unauthorized, 500 server).
- [ ] Invalid payloads return descriptive validation errors with field-level messages.
- [ ] Rate-limiting / throttling behaviors respected if implemented.

## J. Performance (medium)

- [ ] Simulate 100 employee records: dashboard loads within 2s and charts render.
- [ ] Bulk payroll run for 100 employees completes in acceptable time (document threshold).

## K. Security (high)

- [ ] No secrets in frontend bundles.
- [ ] CSRF/XSRF tokens if required on state-changing endpoints.
- [ ] Input validation to prevent SQL/NoSQL injection — validate and sanitize on server.

## L. Usability (low-medium)

- [ ] Error messages are user-friendly.
- [ ] Forms preserve user's typed data on validation failure.
- [ ] Notifications (toasts) appear and dismiss automatically.

---

## Testing Progress Summary

| Category | Total Tests | Passed | Failed | Pending |
|----------|------------|--------|---------|---------|
| Smoke    | 3          | 0      | 0       | 3       |
| Layout   | 2          | 0      | 0       | 2       |
| A11y     | 3          | 0      | 0       | 3       |
| Auth     | 2          | 0      | 0       | 2       |
| Attendance| 4         | 0      | 0       | 4       |
| Leaves   | 4          | 0      | 0       | 4       |
| Payroll  | 4          | 0      | 0       | 4       |
| Data     | 4          | 0      | 0       | 4       |
| API      | 3          | 0      | 0       | 3       |
| Performance| 2        | 0      | 0       | 2       |
| Security | 3          | 0      | 0       | 3       |
| Usability| 3          | 0      | 0       | 3       |
| **TOTAL**| **37**     | **0**  | **0**   | **37**  |
