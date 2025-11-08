# WorkZen HRMS - Image Assets

This directory contains all image assets for the WorkZen HRMS application.

## Required Images & Recommended Sizes

### Hero Section
- **hero-hr.jpg** (1920×1080px, landscape)
  - Full-screen hero background for dashboard
  - Should show office/teamwork scene
  - Format: WebP preferred, JPG fallback
  - Optimize for web (< 300KB)

### Attendance Page
- **attendance-bg.jpg** (1200×700px, landscape)
  - Banner image for attendance page header
  - Should show clock/time management theme
  - Format: WebP preferred, JPG fallback
  - Optimize for web (< 200KB)

### Leave Request Page
- **leave-illustration.png** (800×600px)
  - Illustration for leave request form header
  - Should show vacation/calendar theme
  - Format: PNG with transparency or SVG
  - Optimize for web (< 150KB)

### Payroll Page
- **payroll-graphic.svg** (1200×800px viewBox)
  - Graphic for payroll simulation page
  - Should show financial/calculation theme
  - Format: SVG preferred for scalability
  - Keep file size minimal

### Company Branding
- **logo.png** (400×100px, transparent background)
  - Company logo for payslips and header
  - Format: PNG with transparency or SVG
  - Optimize for web (< 50KB)

## Placeholder Status

Currently using placeholder images. Replace with production assets following the specifications above.

## Optimization Tips

1. Use WebP format with JPG fallback for photos
2. Use SVG for logos and illustrations where possible
3. Compress images using tools like TinyPNG or Squoosh
4. Consider using `srcset` for responsive images
5. Use `loading="lazy"` for below-the-fold images
