# Acceptance Criteria (must all pass for project to be accepted)

## UI / UX

1. Header and sidebar are fixed; hero and page content are full-bleed (no left/right gutters on desktop).
2. Sidebar hides on small screens and toggles with the header button.
3. CTA on hero smoothly scrolls to overview.
4. All interactive elements (buttons, inputs, links) are keyboard-focusable and labeled.
5. Text contrast passes WCAG AA for body text and UI elements.

## Functionality

6. **Attendance**: Punch In creates an `attendance` row with `in_time`; Punch Out adds `out_time` and duration. Duplicate punches (two Ins in a row) are prevented with a clear error message.
7. **Leaves**: Leave request must accept start/end/date, type, and reason; overlapping leaves generate conflict flag for manager.
8. **Payroll simulator**: Given a month/year, returns gross, deductions (PF, tax), and net pay for each active employee. Net = gross − deductions. Net cannot be negative; if formula results negative, payroll should mark as `requires_review`.
9. **Payslip**: For an employee and a month, downloadable printable payslip must generate and match simulated payroll numbers.

## Data & Integration

10. All API endpoints return standard status codes and JSON error payloads. No sensitive data is exposed in UI (e.g., raw salary breakdown for unauthorized roles).
11. Role-based access: employee role cannot access admin-only endpoints (like payroll run). Admin can view all.
12. Images load and fall back to gradient/background when unavailable.

## Performance & Reliability

13. Dashboard initial load ≤ 2s on local dev machine with 100 seed records.
14. Animations respect `prefers-reduced-motion`.
15. Build is deployable (static build outputs without errors).

## Security & Quality

16. No debug logs in production builds.
17. Form inputs are validated on both client and server (dates, numeric ranges).
18. Sensitive tokens or secrets not hard-coded.

**Acceptance = all the above pass in QA.**
