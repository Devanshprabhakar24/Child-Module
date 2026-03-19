# Manual Testing Checklist - WombTo18

## Pre-Testing Setup

### 1. Start Backend Server

```bash
cd backend
npm run start:dev
# Should run on http://localhost:8000
```

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
# Should run on http://localhost:3000
```

### 3. Verify Environment Variables

- [ ] Backend `.env` file configured
- [ ] Frontend `.env.local` file configured
- [ ] MongoDB connection working
- [ ] Cloudinary credentials set
- [ ] MSG91 credentials set (optional for testing)
- [ ] Razorpay credentials set

---

## Test Suite 1: Admin Authentication & Setup

### Test 1.1: Admin Login

**URL**: `http://localhost:3000/admin/login`

**Steps**:

1. [ ] Navigate to admin login page
2. [ ] Enter username: `admin`
3. [ ] Enter password: `admin123`
4. [ ] Click "Login" button
5. [ ] Verify redirect to admin dashboard

**Expected Result**: Successfully logged in and redirected to `/admin`

**Actual Result**: ******\_\_\_******

---

### Test 1.2: Seed Default CMS Data

**URL**: `http://localhost:3000/admin/cms`

**Steps**:

1. [ ] Login as admin
2. [ ] Navigate to Admin → CMS
3. [ ] Click "Seed Default Data" button
4. [ ] Wait for success message
5. [ ] Verify counts: FAQs (3), Testimonials (2), Vaccines (5), Milestones (25+)

**Expected Result**: All default data seeded successfully

**Actual Result**: ******\_\_\_******

---

### Test 1.3: Verify Milestone Templates

**API Test**:

```bash
curl http://localhost:8000/cms/milestone-templates
```

**Steps**:

1. [ ] Open browser console or Postman
2. [ ] Make GET request to `/cms/milestone-templates`
3. [ ] Verify response contains 25+ templates
4. [ ] Check all age groups present (0-1, 1-3, 3-5, 5-12, 13-18 years)
5. [ ] Verify all milestone types present (PHYSICAL, COGNITIVE, SOCIAL, EMOTIONAL, LANGUAGE)

**Expected Result**: Array of 25+ milestone templates

**Actual Result**: ******\_\_\_******

---

## Test Suite 2: User Authentication

### Test 2.1: User Registration/Login (OTP)

**URL**: `http://localhost:3000/login`

**Steps**:

1. [ ] Navigate to login page
2. [ ] Enter phone number: `9876543210`
3. [ ] Click "Send OTP"
4. [ ] Enter OTP: `123456` (test mode)
5. [ ] Click "Verify OTP"
6. [ ] Verify redirect to dashboard

**Expected Result**: Successfully logged in with OTP

**Actual Result**: ******\_\_\_******

---

## Test Suite 3: Child Registration

### Test 3.1: Register New Child

**URL**: `http://localhost:3000/register` (or dashboard)

**Steps**:

1. [ ] Login as user
2. [ ] Navigate to registration page
3. [ ] Fill in child details:
   - Child Name: `Aarav Sharma`
   - Date of Birth: `2023-10-12`
   - Gender: `Male`
   - Mother Name: `Priya Sharma`
   - Father Name: `Rajesh Sharma`
   - Phone: `9876543210`
   - Email: `priya@example.com`
   - Address: `123 Main St`
   - State: `Maharashtra`
   - Pincode: `400001`
4. [ ] Submit form
5. [ ] Note the Registration ID (e.g., REG-20240316-0001)
6. [ ] Verify success message

**Expected Result**: Child registered successfully with unique ID

**Registration ID**: ******\_\_\_******

**Actual Result**: ******\_\_\_******

---

## Test Suite 4: Development Milestones

### Test 4.1: View Milestones Page

**URL**: `http://localhost:3000/dashboard/milestones`

**Steps**:

1. [ ] Login as user
2. [ ] Navigate to Dashboard → Milestones
3. [ ] Verify age group tabs display
4. [ ] Check current age group is highlighted
5. [ ] Verify future age groups show lock icon 🔒

**Expected Result**: Milestone page loads with age-based tabs

**Actual Result**: ******\_\_\_******

---

### Test 4.2: Load Milestones for Age Group

**Steps**:

1. [ ] Select current age group tab (e.g., "0-1 Years")
2. [ ] Click "Load Milestones" button
3. [ ] Wait for loading
4. [ ] Verify milestones appear grouped by type
5. [ ] Check all 5 types present: Physical 💪, Cognitive 🧠, Social 👥, Emotional ❤️, Language 💬

**Expected Result**: Milestones loaded and grouped by type

**Milestones Count**: ******\_\_\_******

**Actual Result**: ******\_\_\_******

---

### Test 4.3: Mark Milestone as Achieved

**Steps**:

1. [ ] Find a milestone with "Mark Achieved" button
2. [ ] Click "Mark Achieved"
3. [ ] Verify button changes to "Undo"
4. [ ] Check milestone status shows green checkmark ✓
5. [ ] Verify achievement date is displayed
6. [ ] Check progress percentage updates

**Expected Result**: Milestone marked as achieved, progress updates

**Progress Before**: \_**\_%
**Progress After**: \_\_**%

**Actual Result**: ******\_\_\_******

---

### Test 4.4: Undo Milestone Achievement

**Steps**:

1. [ ] Find an achieved milestone with "Undo" button
2. [ ] Click "Undo"
3. [ ] Verify button changes back to "Mark Achieved"
4. [ ] Check milestone status reverts
5. [ ] Verify progress percentage decreases

**Expected Result**: Milestone achievement undone, progress updates

**Actual Result**: ******\_\_\_******

---

### Test 4.5: Test Age Group Locking

**Steps**:

1. [ ] Try to click on a future age group tab (locked)
2. [ ] Verify it's disabled/not clickable
3. [ ] Check lock icon 🔒 is visible
4. [ ] Try to click on past/current age group
5. [ ] Verify it's clickable and switches view

**Expected Result**: Future age groups locked, past/current unlocked

**Actual Result**: ******\_\_\_******

---

### Test 4.6: Progress Tracking

**Steps**:

1. [ ] Mark 2-3 milestones as achieved
2. [ ] Check progress bar updates
3. [ ] Verify percentage calculation is correct
4. [ ] Check "X of Y milestones achieved" counter

**Expected Result**: Progress accurately reflects achievements

**Total Milestones**: ******\_\_\_******
**Achieved**: ******\_\_\_******
**Percentage**: \_\_\_\_%

**Actual Result**: ******\_\_\_******

---

## Test Suite 5: Vaccination Tracking (User View)

### Test 5.1: View Vaccination Page

**URL**: `http://localhost:3000/dashboard/vaccinations`

**Steps**:

1. [ ] Login as user
2. [ ] Navigate to Dashboard → Vaccinations
3. [ ] Verify vaccination list displays
4. [ ] Check progress bar shows
5. [ ] Verify status badges visible (Completed, Due, Upcoming, Missed)

**Expected Result**: Vaccination page loads with status badges

**Actual Result**: ******\_\_\_******

---

### Test 5.2: Verify No Mark as Done Button (User)

**Steps**:

1. [ ] Look for "Mark as Done" button on any vaccination
2. [ ] Verify button is NOT present
3. [ ] Check only status badges are shown
4. [ ] Verify "Remind Me" button is NOT present

**Expected Result**: No action buttons visible for users

**Actual Result**: ******\_\_\_******

---

### Test 5.3: Filter Vaccinations

**Steps**:

1. [ ] Click "All" filter
2. [ ] Click "Due" filter - verify only due vaccinations show
3. [ ] Click "Completed" filter - verify only completed show
4. [ ] Click "Overdue" filter - verify only missed show

**Expected Result**: Filters work correctly

**Actual Result**: ******\_\_\_******

---

## Test Suite 6: Admin Vaccination Management

### Test 6.1: Access Admin Vaccinations

**URL**: `http://localhost:3000/admin/vaccinations`

**Steps**:

1. [ ] Login as admin
2. [ ] Navigate to Admin → Vaccinations
3. [ ] Verify child dropdown displays
4. [ ] Check vaccination list loads
5. [ ] Verify "Mark as Done" buttons visible

**Expected Result**: Admin vaccination page with action buttons

**Actual Result**: ******\_\_\_******

---

### Test 6.2: Mark Vaccination as Done

**Steps**:

1. [ ] Select a child from dropdown
2. [ ] Find an UPCOMING vaccination
3. [ ] Click "Mark as Done" button
4. [ ] Verify button changes to "Unmark"
5. [ ] Check status changes to COMPLETED
6. [ ] Verify completion date is set
7. [ ] **IMPORTANT**: Check selected child dropdown remains the same

**Expected Result**: Vaccination marked as done, dropdown doesn't reset

**Selected Child Before**: ******\_\_\_******
**Selected Child After**: ******\_\_\_******

**Actual Result**: ******\_\_\_******

---

### Test 6.3: Unmark Vaccination

**Steps**:

1. [ ] Find a COMPLETED vaccination
2. [ ] Click "Unmark" button
3. [ ] Verify button changes to "Mark as Done"
4. [ ] Check status reverts to UPCOMING
5. [ ] Verify completion date is removed
6. [ ] **IMPORTANT**: Check selected child dropdown remains the same

**Expected Result**: Vaccination unmarked, dropdown doesn't reset

**Actual Result**: ******\_\_\_******

---

### Test 6.4: Search Vaccinations

**Steps**:

1. [ ] Type vaccine name in search box (e.g., "BCG")
2. [ ] Verify filtered results show
3. [ ] Clear search
4. [ ] Verify all vaccinations show again

**Expected Result**: Search filters vaccinations correctly

**Actual Result**: ******\_\_\_******

---

### Test 6.5: Filter by Status

**Steps**:

1. [ ] Select "All Status" - verify all show
2. [ ] Select "Missed" - verify only missed show
3. [ ] Select "Due" - verify only due show
4. [ ] Select "Upcoming" - verify only upcoming show
5. [ ] Select "Completed" - verify only completed show

**Expected Result**: Status filter works correctly

**Actual Result**: ******\_\_\_******

---

## Test Suite 7: Admin Children Management

### Test 7.1: View All Children

**URL**: `http://localhost:3000/admin/children`

**Steps**:

1. [ ] Login as admin
2. [ ] Navigate to Admin → Children
3. [ ] Verify children list displays
4. [ ] Check all columns visible (Name, ID, DOB, Age, State, Phone, etc.)
5. [ ] Verify search box present

**Expected Result**: All children listed in table

**Total Children**: ******\_\_\_******

**Actual Result**: ******\_\_\_******

---

### Test 7.2: Search Children

**Steps**:

1. [ ] Type child name in search box
2. [ ] Verify filtered results
3. [ ] Try searching by registration ID
4. [ ] Try searching by phone number
5. [ ] Clear search

**Expected Result**: Search works for name, ID, and phone

**Actual Result**: ******\_\_\_******

---

### Test 7.3: Export to CSV

**Steps**:

1. [ ] Click "Export to CSV" button
2. [ ] Verify file downloads
3. [ ] Open CSV file
4. [ ] Check all columns present
5. [ ] Verify phone numbers have single quote prefix (')

**Expected Result**: CSV downloads with proper formatting

**Actual Result**: ******\_\_\_******

---

### Test 7.4: Delete Child

**Steps**:

1. [ ] Click "Delete" button on a test child
2. [ ] Confirm deletion
3. [ ] Verify child removed from list
4. [ ] Check associated data deleted (milestones, reminders)

**Expected Result**: Child and all data deleted

**Actual Result**: ******\_\_\_******

---

## Test Suite 8: Admin Dashboard Stats

### Test 8.1: View Admin Dashboard

**URL**: `http://localhost:3000/admin`

**Steps**:

1. [ ] Login as admin
2. [ ] Navigate to Admin Dashboard
3. [ ] Verify statistics cards display:
   - Total Children
   - Total Vaccinations
   - Due Vaccinations
   - Completed Vaccinations
   - Missed Vaccinations
4. [ ] Check numbers are accurate

**Expected Result**: Dashboard shows correct statistics

**Total Children**: ******\_\_\_******
**Total Vaccinations**: ******\_\_\_******
**Due**: ******\_\_\_******
**Completed**: ******\_\_\_******
**Missed**: ******\_\_\_******

**Actual Result**: ******\_\_\_******

---

## Test Suite 9: CMS Management

### Test 9.1: Manage FAQs

**URL**: `http://localhost:3000/admin/cms`

**Steps**:

1. [ ] Navigate to CMS → FAQs section
2. [ ] Click "Add FAQ"
3. [ ] Fill in question and answer
4. [ ] Save FAQ
5. [ ] Edit an existing FAQ
6. [ ] Delete a test FAQ

**Expected Result**: CRUD operations work for FAQs

**Actual Result**: ******\_\_\_******

---

### Test 9.2: Manage Testimonials

**Steps**:

1. [ ] Navigate to CMS → Testimonials section
2. [ ] Click "Add Testimonial"
3. [ ] Fill in quote, author, role, rating
4. [ ] Save testimonial
5. [ ] Edit an existing testimonial
6. [ ] Delete a test testimonial

**Expected Result**: CRUD operations work for testimonials

**Actual Result**: ******\_\_\_******

---

### Test 9.3: Manage Milestone Templates

**Steps**:

1. [ ] Navigate to CMS → Milestone Templates section
2. [ ] Click "Add Template"
3. [ ] Fill in age group, title, description, type
4. [ ] Save template
5. [ ] Edit an existing template
6. [ ] Delete a test template

**Expected Result**: CRUD operations work for milestone templates

**Actual Result**: ******\_\_\_******

---

## Test Suite 10: Profile Management

### Test 10.1: Upload Profile Picture

**URL**: `http://localhost:3000/dashboard/settings`

**Steps**:

1. [ ] Login as user
2. [ ] Navigate to Settings
3. [ ] Click "Upload Profile Picture"
4. [ ] Select an image file
5. [ ] Upload image
6. [ ] Verify image appears in dashboard header
7. [ ] Check image appears in settings page

**Expected Result**: Profile picture uploaded and displayed

**Actual Result**: ******\_\_\_******

---

## Test Suite 11: API Endpoints Testing

### Test 11.1: Development Milestones API

```bash
# Get milestones
curl -X GET http://localhost:8000/dashboard/development-milestones/REG-20240316-0001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Steps**:

1. [ ] Replace REG-ID with actual registration ID
2. [ ] Replace YOUR_TOKEN with actual JWT token
3. [ ] Execute request
4. [ ] Verify response contains currentAgeGroup, availableAgeGroups, milestones

**Expected Result**: JSON response with milestone data

**Actual Result**: ******\_\_\_******

---

### Test 11.2: Seed Milestones API

```bash
# Seed milestones
curl -X POST http://localhost:8000/dashboard/development-milestones/seed \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": "REG-20240316-0001",
    "ageGroup": "1-3 years",
    "templates": []
  }'
```

**Steps**:

1. [ ] Get templates first from `/cms/milestone-templates/1-3%20years`
2. [ ] Execute seed request with templates
3. [ ] Verify milestones created

**Expected Result**: Milestones seeded successfully

**Actual Result**: ******\_\_\_******

---

## Test Suite 12: Error Handling

### Test 12.1: Invalid Login

**Steps**:

1. [ ] Try admin login with wrong password
2. [ ] Verify error message displays
3. [ ] Try OTP login with wrong OTP
4. [ ] Verify error message displays

**Expected Result**: Appropriate error messages shown

**Actual Result**: ******\_\_\_******

---

### Test 12.2: Unauthorized Access

**Steps**:

1. [ ] Logout
2. [ ] Try to access `/admin` directly
3. [ ] Verify redirect to login
4. [ ] Try to access `/dashboard` without login
5. [ ] Verify redirect to login

**Expected Result**: Unauthorized users redirected

**Actual Result**: ******\_\_\_******

---

## Test Suite 13: Responsive Design

### Test 13.1: Mobile View

**Steps**:

1. [ ] Open browser DevTools
2. [ ] Switch to mobile view (375px width)
3. [ ] Test navigation menu
4. [ ] Test milestone page
5. [ ] Test vaccination page
6. [ ] Test admin panel

**Expected Result**: All pages responsive on mobile

**Actual Result**: ******\_\_\_******

---

### Test 13.2: Tablet View

**Steps**:

1. [ ] Switch to tablet view (768px width)
2. [ ] Test all major pages
3. [ ] Verify layout adjusts properly

**Expected Result**: All pages responsive on tablet

**Actual Result**: ******\_\_\_******

---

## Test Summary

### Features Tested: **\_** / 50+

### Pass Rate: **\_**%

### Critical Issues Found:

1. ***
2. ***
3. ***

### Minor Issues Found:

1. ***
2. ***
3. ***

### Notes:

---

---

---

---

**Tester Name**: ******\_\_\_******
**Test Date**: ******\_\_\_******
**Environment**: Development / Staging / Production
**Browser**: Chrome / Firefox / Safari / Edge
**OS**: Windows / Mac / Linux

---

## Quick Test Commands

### Start Servers

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Test Credentials

- **Admin**: username: `admin`, password: `admin123`
- **User OTP**: `123456` (test mode)

### Test Data

- **Phone**: `9876543210`
- **Email**: `test@example.com`
- **Child DOB**: `2023-10-12` (for 0-1 years age group)

---

**Total Test Cases**: 50+
**Estimated Testing Time**: 2-3 hours
