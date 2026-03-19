# WombTo18 - Complete Features & Functions Documentation

## Table of Contents

1. [Authentication System](#authentication-system)
2. [User Management](#user-management)
3. [Child Registration](#child-registration)
4. [Dashboard Features](#dashboard-features)
5. [Vaccination Tracking](#vaccination-tracking)
6. [Development Milestones](#development-milestones)
7. [Reminders & Notifications](#reminders--notifications)
8. [Payment System](#payment-system)
9. [Admin Panel](#admin-panel)
10. [CMS System](#cms-system)
11. [Channel Partner System](#channel-partner-system)

---

## 1. Authentication System

### 1.1 OTP-Based Login (Users)

**Function**: `authService.sendOtp()`
**Location**: `backend/src/auth/auth.service.ts`

**Features**:

- Phone number-based authentication
- OTP sent via MSG91 SMS service
- Test mode: OTP is always "123456" for development
- OTP expires after 10 minutes
- Rate limiting to prevent spam

**API Endpoint**:

```
POST /auth/send-otp
Body: { phone: "9876543210" }
Response: { success: true, message: "OTP sent" }
```

### 1.2 OTP Verification

**Function**: `authService.verifyOtp()`

**Features**:

- Validates OTP against stored record
- Creates user account if first-time login
- Generates JWT token for session
- Links existing child registrations by phone/email

**API Endpoint**:

```
POST /auth/verify-otp
Body: { phone: "9876543210", otp: "123456" }
Response: {
  success: true,
  token: "jwt_token",
  user: { id, phone, email, role }
}
```

### 1.3 Admin Login

**Function**: `authService.adminLogin()`

**Features**:

- Username/password authentication
- Hardcoded credentials (username: admin, password: admin123)
- Separate admin role assignment
- JWT token with admin privileges

**API Endpoint**:

```
POST /auth/admin-login
Body: { username: "admin", password: "admin123" }
Response: {
  success: true,
  token: "jwt_token",
  user: { id, username, role: "ADMIN" }
}
```

---

## 2. User Management

### 2.1 User Profile

**Schema**: `User` in `backend/src/auth/schemas/user.schema.ts`

**Fields**:

- `phone`: Primary identifier
- `email`: Optional email address
- `role`: USER or ADMIN
- `registrationIds`: Array of linked child registrations
- `profilePictureUrl`: Cloudinary URL
- `createdAt`, `updatedAt`: Timestamps

### 2.2 Update Profile

**Function**: `dashboardService.updateProfilePicture()`

**Features**:

- Upload profile picture to Cloudinary
- Automatic image optimization
- Face-detection cropping (400x400)
- Temporary file cleanup

**API Endpoint**:

```
POST /dashboard/profile-picture/:registrationId
Content-Type: multipart/form-data
Body: profilePicture (file)
Response: {
  success: true,
  data: { profilePictureUrl: "cloudinary_url" }
}
```

---

## 3. Child Registration

### 3.1 Register Child

**Function**: `registrationService.registerChild()`
**Location**: `backend/src/registration/registration.service.ts`

**Features**:

- Generates unique registration ID (format: REG-YYYYMMDD-XXXX)
- Stores child details (name, DOB, gender, parent info)
- Calculates age group automatically
- Links to parent user account
- Auto-seeds vaccination milestones
- Sends confirmation SMS/email

**API Endpoint**:

```
POST /registration/register
Body: {
  childName: "Aarav Sharma",
  dateOfBirth: "2023-10-12",
  childGender: "Male",
  motherName: "Priya Sharma",
  fatherName: "Rajesh Sharma",
  phone: "9876543210",
  email: "priya@example.com",
  address: "123 Main St",
  state: "Maharashtra",
  pincode: "400001"
}
Response: {
  success: true,
  data: {
    registrationId: "REG-20240316-0001",
    childName: "Aarav Sharma",
    ...
  }
}
```

### 3.2 Update Child Details

**Function**: `registrationService.updateChild()`

**Features**:

- Update child information
- Update parent contact details
- Update address and location
- Maintains audit trail

**API Endpoint**:

```
PATCH /registration/update/:registrationId
Body: { childName, motherName, phone, address, ... }
Response: { success: true, data: updatedChild }
```

---

## 4. Dashboard Features

### 4.1 Child Dashboard

**Function**: `dashboardService.getChildDashboard()`

**Features**:

- Complete child profile
- Vaccination tracker summary
- Upcoming milestones
- Green cohort status
- Age calculation
- Profile picture display

**API Endpoint**:

```
GET /dashboard/child/:registrationId
Response: {
  success: true,
  data: {
    profile: { registrationId, childName, dateOfBirth, ageInYears, ... },
    vaccinationTracker: { total, completed, upcoming, missed, milestones },
    upcomingMilestones: [...]
  }
}
```

### 4.2 Family Dashboard

**Function**: `dashboardService.getFamilyDashboard()`

**Features**:

- List all children under parent account
- Quick overview of each child
- Next due milestone for each child
- Toggle between child profiles

**API Endpoint**:

```
GET /dashboard/family
Response: {
  success: true,
  data: {
    children: [
      {
        registrationId, childName, ageGroup, ageInYears,
        profilePictureUrl, nextDueMilestone
      }
    ],
    totalChildren: 2
  }
}
```

---

## 5. Vaccination Tracking

### 5.1 Vaccination Schedule

**Data**: `VACCINATION_SCHEDULE` in `backend/src/dashboard/data/vaccination-schedule.ts`

**Features**:

- Based on Indian NIS/IAP schedule
- 20+ vaccines from birth to 18 years
- Age-based due date calculation
- Vaccine name, description, and category

**Vaccines Included**:

- Birth: BCG, OPV-0, Hepatitis B-1
- 6 weeks: OPV-1, Pentavalent-1, Rotavirus-1, PCV-1
- 10 weeks: OPV-2, Pentavalent-2, Rotavirus-2, PCV-2
- 14 weeks: OPV-3, Pentavalent-3, Rotavirus-3, PCV-3
- 6 months: Influenza-1, Hepatitis B-2
- 9 months: MMR-1
- 12 months: Hepatitis A-1, Typhoid
- 15 months: MMR-2, Varicella-1, PCV Booster
- 18 months: Pentavalent Booster, OPV Booster
- 2 years: Hepatitis A-2
- 4-6 years: DPT Booster, OPV Booster, MMR-3
- 10-12 years: Tdap, HPV (for girls)

### 5.2 Seed Vaccination Milestones

**Function**: `dashboardService.seedVaccinationMilestones()`

**Features**:

- Auto-creates vaccination milestones for new child
- Calculates due dates based on DOB
- Sets initial status as UPCOMING
- Prevents duplicate seeding

**API Endpoint**:

```
POST /dashboard/vaccination/seed
Body: { registrationId, dateOfBirth }
Response: {
  success: true,
  data: milestones[],
  count: 20
}
```

### 5.3 Get Vaccination Tracker

**Function**: `dashboardService.getVaccinationTracker()`

**Features**:

- Lists all vaccination milestones
- Auto-updates overdue statuses
- Calculates completion statistics
- Sorts by due date

**Status Logic**:

- UPCOMING: Due date in future
- DUE: Due date within 30 days
- MISSED: Due date passed by 30+ days
- COMPLETED: Marked as done

**API Endpoint**:

```
GET /dashboard/vaccination/:registrationId
Response: {
  success: true,
  data: {
    total: 20,
    completed: 5,
    upcoming: 10,
    missed: 2,
    milestones: [...]
  }
}
```

### 5.4 Update Vaccination Status (Admin Only)

**Function**: `dashboardService.updateMilestoneStatus()`

**Features**:

- Mark vaccination as completed
- Record completion date
- Add notes
- Undo completion (revert to UPCOMING)

**API Endpoint**:

```
PATCH /dashboard/milestones/:milestoneId
Body: {
  status: "COMPLETED",
  completedDate: "2024-03-16",
  notes: "Given at City Hospital"
}
Response: { success: true, data: updatedMilestone }
```

### 5.5 Download Vaccination Certificate

**Function**: `certificateService.generateCertificate()`
**Location**: `backend/src/registration/certificate.service.ts`

**Features**:

- Generates PDF certificate
- Includes child details and vaccine info
- QR code for verification
- Downloadable from frontend

---

## 6. Development Milestones

### 6.1 Age Group System

**Enum**: `AgeGroupEnum` in `backend/src/dashboard/schemas/development-milestone.schema.ts`

**Age Groups**:

- INFANT: 0-1 years 👶
- TODDLER: 1-3 years 🧒
- PRESCHOOL: 3-5 years 👦
- SCHOOL: 5-12 years 🧑
- TEEN: 13-18 years 👨

### 6.2 Calculate Age Group

**Function**: `dashboardService.getChildAgeGroup()`

**Features**:

- Calculates current age from DOB
- Returns appropriate age group enum
- Used for unlocking age groups

**Logic**:

```typescript
ageInYears < 1 → INFANT
ageInYears < 3 → TODDLER
ageInYears < 5 → PRESCHOOL
ageInYears < 13 → SCHOOL
ageInYears >= 13 → TEEN
```

### 6.3 Get Available Age Groups

**Function**: `dashboardService.getAvailableAgeGroups()`

**Features**:

- Returns unlocked age groups
- Includes current and past age groups
- Excludes future age groups

**Example**:

- Child age: 2 years
- Available: [INFANT, TODDLER]
- Locked: [PRESCHOOL, SCHOOL, TEEN]

### 6.4 Milestone Types

**Enum**: `MilestoneType`

**Types**:

- PHYSICAL 💪: Motor skills, coordination, physical abilities
- COGNITIVE 🧠: Thinking, learning, problem-solving
- SOCIAL 👥: Interaction with others, friendships
- EMOTIONAL ❤️: Feelings, self-regulation, emotional awareness
- LANGUAGE 💬: Communication, speech, understanding

### 6.5 Milestone Status

**Enum**: `MilestoneStatus`

**Statuses**:

- NOT_STARTED: Default state
- IN_PROGRESS: Partially achieved
- ACHIEVED: Fully demonstrated
- DELAYED: Significantly overdue

### 6.6 Get Development Milestones

**Function**: `dashboardService.getDevelopmentMilestones()`

**Features**:

- Fetches all milestones for child
- Includes age group context
- Returns available age groups
- Sorted by age group, type, and order

**API Endpoint**:

```
GET /dashboard/development-milestones/:registrationId
Response: {
  success: true,
  data: {
    currentAgeGroup: "1-3 years",
    availableAgeGroups: ["0-1 years", "1-3 years"],
    milestones: [...]
  }
}
```

### 6.7 Seed Development Milestones

**Function**: `dashboardService.seedDevelopmentMilestones()`

**Features**:

- Creates milestones from templates
- Specific to age group
- Prevents duplicate seeding
- Sets initial status as NOT_STARTED

**API Endpoint**:

```
POST /dashboard/development-milestones/seed
Body: {
  registrationId,
  ageGroup: "1-3 years",
  templates: [...]
}
Response: {
  success: true,
  data: milestones[],
  count: 5
}
```

### 6.8 Update Milestone Status

**Function**: `dashboardService.updateDevelopmentMilestoneStatus()`

**Features**:

- Mark milestone as achieved
- Record achievement date
- Add notes
- Undo achievement

**API Endpoint**:

```
PATCH /dashboard/development-milestones/:milestoneId
Body: {
  status: "ACHIEVED",
  achievedDate: "2024-03-16",
  notes: "First time walking independently"
}
Response: { success: true, data: updatedMilestone }
```

---

## 7. Reminders & Notifications

### 7.1 Reminder System

**Service**: `RemindersService`
**Location**: `backend/src/reminders/reminders.service.ts`

**Features**:

- Schedule reminders for upcoming milestones
- Multiple channels: SMS, WhatsApp, Email
- Configurable reminder days (7 days before)
- Auto-scheduling on registration

### 7.2 Reminder Channels

**Enum**: `ReminderChannel`

**Channels**:

- SMS: Via MSG91
- WHATSAPP: Via MSG91 WhatsApp API
- EMAIL: Via email service

### 7.3 Seed Reminders

**Function**: `remindersService.seedRemindersForRegistration()`

**Features**:

- Creates reminders for all upcoming milestones
- Calculates reminder dates (7 days before due)
- Supports multiple channels
- Prevents duplicate reminders

**API Endpoint**:

```
POST /reminders/seed
Body: {
  registrationId,
  channels: ["SMS", "WHATSAPP"]
}
Response: {
  success: true,
  count: 15
}
```

### 7.4 Send Reminder

**Function**: `remindersService.sendReminder()`

**Features**:

- Sends reminder via specified channel
- Includes milestone details
- Marks reminder as sent
- Logs delivery status

---

## 8. Payment System

### 8.1 Razorpay Integration

**Service**: `PaymentsService`
**Location**: `backend/src/payments/payments.service.ts`

**Features**:

- Razorpay payment gateway integration
- Test mode for development
- Order creation and verification
- Payment status tracking

### 8.2 Create Payment Order

**Function**: `paymentsService.createOrder()`

**Features**:

- Creates Razorpay order
- Stores order details in database
- Returns order ID for frontend
- Test mode: Auto-confirms payment

**API Endpoint**:

```
POST /payments/create-order
Body: {
  registrationId,
  amount: 500,
  currency: "INR"
}
Response: {
  success: true,
  orderId: "order_xxx",
  amount: 500
}
```

### 8.3 Verify Payment

**Function**: `paymentsService.verifyPayment()`

**Features**:

- Verifies Razorpay signature
- Updates payment status
- Links payment to registration
- Generates invoice

**API Endpoint**:

```
POST /payments/verify
Body: {
  orderId,
  paymentId,
  signature
}
Response: {
  success: true,
  paymentStatus: "SUCCESS"
}
```

### 8.4 Payment Webhook

**Function**: `paymentsService.handleWebhook()`

**Features**:

- Receives Razorpay webhooks
- Auto-updates payment status
- Sends confirmation notifications
- Handles payment failures

**API Endpoint**:

```
POST /payments/webhook
Body: Razorpay webhook payload
Response: { received: true }
```

---

## 9. Admin Panel

### 9.1 Admin Dashboard

**Location**: `frontend/src/app/admin/page.tsx`

**Features**:

- System-wide statistics
- Total children count
- Vaccination completion rates
- Due vaccinations count
- Missed vaccinations count

**API Endpoint**:

```
GET /dashboard/admin/stats
Response: {
  success: true,
  data: {
    totalChildren: 150,
    totalVaccinations: 3000,
    dueVaccinations: 250,
    completedVaccinations: 2500,
    missedVaccinations: 250
  }
}
```

### 9.2 Children Management

**Location**: `frontend/src/app/admin/children/page.tsx`

**Features**:

- View all registered children
- Search by name, registration ID, phone
- Filter by payment status, state
- Export to CSV
- Delete child records

**Functions**:

- `getAllChildren()`: Fetch all children
- `deleteChild()`: Remove child and associated data
- `exportToCSV()`: Download children list

**API Endpoints**:

```
GET /dashboard/admin/all-children
Response: {
  success: true,
  data: [
    {
      registrationId, childName, childGender,
      dateOfBirth, ageGroup, state, motherName,
      phone, email, paymentStatus, profilePictureUrl
    }
  ]
}

DELETE /dashboard/admin/delete-child/:registrationId
Response: {
  success: true,
  message: "Child deleted successfully"
}
```

### 9.3 Vaccination Management

**Location**: `frontend/src/app/admin/vaccinations/page.tsx`

**Features**:

- View all children's vaccinations
- Select child from dropdown
- Search vaccines
- Filter by status
- Mark as done / Unmark
- Send reminders

**Functions**:

- `loadAllChildren()`: Load children with milestones
- `handleToggleStatus()`: Mark/unmark vaccination
- Status toggles between COMPLETED and UPCOMING

**API Endpoint**:

```
PATCH /dashboard/milestones/:milestoneId
Body: {
  status: "COMPLETED" | "UPCOMING",
  completedDate: "2024-03-16"
}
Response: { success: true, data: updatedMilestone }
```

---

## 10. CMS System

### 10.1 FAQ Management

**Service**: `CmsService.getAllFaqs()`
**Location**: `backend/src/cms/cms.service.ts`

**Features**:

- Create, read, update, delete FAQs
- Question and answer fields
- Category organization
- Order management
- Active/inactive status

**Schema**:

```typescript
{
  question: string,
  answer: string,
  category: string,
  order: number,
  isActive: boolean
}
```

**API Endpoints**:

```
GET /cms/faqs (public)
POST /cms/faqs (admin)
PATCH /cms/faqs/:id (admin)
DELETE /cms/faqs/:id (admin)
```

### 10.2 Testimonials Management

**Service**: `CmsService.getAllTestimonials()`

**Features**:

- Create, read, update, delete testimonials
- Quote, author, role fields
- Rating system (1-5 stars)
- Order management
- Active/inactive status

**Schema**:

```typescript
{
  quote: string,
  author: string,
  role: string,
  rating: number,
  order: number,
  isActive: boolean
}
```

**API Endpoints**:

```
GET /cms/testimonials (public)
POST /cms/testimonials (admin)
PATCH /cms/testimonials/:id (admin)
DELETE /cms/testimonials/:id (admin)
```

### 10.3 Vaccine Templates Management

**Service**: `CmsService.getAllVaccineTemplates()`

**Features**:

- Manage vaccination schedule templates
- Vaccine name, title, description
- Age in months
- Category (routine, optional)
- Order management

**Schema**:

```typescript
{
  vaccineName: string,
  title: string,
  description: string,
  ageInMonths: number,
  category: string,
  order: number,
  isActive: boolean
}
```

**API Endpoints**:

```
GET /cms/vaccine-templates (public)
POST /cms/vaccine-templates (admin)
PATCH /cms/vaccine-templates/:id (admin)
DELETE /cms/vaccine-templates/:id (admin)
```

### 10.4 Milestone Templates Management

**Service**: `CmsService.getAllMilestoneTemplates()`

**Features**:

- Manage development milestone templates
- Age group, title, description
- Milestone type (Physical, Cognitive, etc.)
- Tips for parents
- Order management

**Schema**:

```typescript
{
  ageGroup: string,
  title: string,
  description: string,
  type: string,
  order: number,
  isActive: boolean,
  tips: string
}
```

**API Endpoints**:

```
GET /cms/milestone-templates (public)
GET /cms/milestone-templates/:ageGroup (public)
POST /cms/milestone-templates (admin)
PATCH /cms/milestone-templates/:id (admin)
DELETE /cms/milestone-templates/:id (admin)
```

### 10.5 Seed Default Data

**Function**: `cmsService.seedDefaultData()`

**Features**:

- Seeds default FAQs (3 items)
- Seeds default testimonials (2 items)
- Seeds default vaccine templates (5 items)
- Seeds default milestone templates (25 items)
- Prevents duplicate seeding

**API Endpoint**:

```
POST /cms/seed (admin)
Response: {
  success: true,
  data: {
    faqs: 3,
    testimonials: 2,
    vaccines: 5,
    milestones: 25
  }
}
```

---

## 11. Channel Partner System

### 11.1 Channel Partner Registration

**Service**: `ChannelPartnerService`
**Location**: `backend/src/channel-partner/channel-partner.service.ts`

**Features**:

- Register schools, clinics, NGOs as partners
- Unique partner ID generation
- Commission tracking
- Referral management

**Schema**:

```typescript
{
  partnerId: string,
  partnerName: string,
  partnerType: string, // SCHOOL, CLINIC, NGO
  contactPerson: string,
  phone: string,
  email: string,
  address: string,
  state: string,
  commissionRate: number,
  isActive: boolean
}
```

### 11.2 Track Referrals

**Function**: `channelPartnerService.trackReferral()`

**Features**:

- Link child registration to partner
- Calculate commission
- Track conversion rates
- Generate partner reports

---

## 12. Additional Features

### 12.1 File Upload (Cloudinary)

**Location**: `backend/src/auth/cloudinary.ts`

**Features**:

- Image upload to Cloudinary
- Automatic optimization
- Face-detection cropping
- Folder organization
- Secure URL generation

**Configuration**:

```typescript
{
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
}
```

### 12.2 SMS Service (MSG91)

**Location**: `backend/src/notifications/sms.service.ts`

**Features**:

- Send OTP via SMS
- Send reminders
- Send confirmations
- Template-based messaging
- Test mode for development

**Configuration**:

```typescript
{
  authKey: process.env.MSG91_AUTH_KEY,
  senderId: process.env.MSG91_SENDER_ID,
  route: "4" // Transactional
}
```

### 12.3 Email Service

**Location**: `backend/src/notifications/email.service.ts`

**Features**:

- Send registration confirmations
- Send reminders
- Send certificates
- HTML email templates
- Attachment support

### 12.4 Invoice Generation

**Service**: `InvoiceService`
**Location**: `backend/src/payments/invoice.service.ts`

**Features**:

- Generate PDF invoices
- Include payment details
- Company branding
- GST calculation
- Downloadable format

---

## 13. Frontend Features

### 13.1 Dashboard Layout

**Location**: `frontend/src/app/dashboard/layout.tsx`

**Features**:

- Responsive sidebar navigation
- Header with profile picture
- Child selector dropdown
- Logout functionality
- Mobile-friendly menu

### 13.2 Vaccination Timeline

**Component**: `VaccinationTimeline`
**Location**: `frontend/src/components/dashboard/vaccinations/VaccinationTimeline.tsx`

**Features**:

- Visual timeline display
- Grouped by age periods
- Status indicators
- Certificate download
- View details modal

### 13.3 Milestone Tracking

**Location**: `frontend/src/app/dashboard/milestones/page.tsx`

**Features**:

- Age group tabs
- Lock/unlock logic
- Progress bars
- Milestone grouping by type
- Mark achieved functionality
- Real-time updates

### 13.4 Settings Page

**Location**: `frontend/src/app/dashboard/settings/page.tsx`

**Features**:

- Update profile picture
- Edit child details
- Update contact information
- Change notification preferences
- Account management

---

## 14. Security Features

### 14.1 Authentication Guards

**Guard**: `AuthGuard`
**Location**: `backend/src/auth/guards/auth.guard.ts`

**Features**:

- JWT token validation
- Request authentication
- User context injection
- Unauthorized access prevention

### 14.2 Role-Based Access Control

**Guard**: `RolesGuard`
**Location**: `backend/src/auth/guards/roles.guard.ts`

**Features**:

- Role verification
- Admin-only endpoints
- Permission checking
- Access denial for unauthorized roles

### 14.3 Data Validation

**DTOs**: Various DTO files in `backend/libs/shared/src/dto/`

**Features**:

- Input validation
- Type checking
- Required field enforcement
- Format validation
- Sanitization

---

## 15. Database Schema Summary

### Collections:

1. **users**: User accounts and authentication
2. **otp_records**: OTP storage and verification
3. **child_registrations**: Child profiles and details
4. **milestones**: Vaccination milestones
5. **development_milestones**: Development tracking
6. **reminders**: Scheduled notifications
7. **payments**: Payment records
8. **faqs**: FAQ content
9. **testimonials**: User testimonials
10. **vaccine_templates**: Vaccination schedule templates
11. **milestone_templates**: Development milestone templates
12. **channel_partners**: Partner organizations

---

## 16. Environment Variables

### Backend (.env)

```
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MSG91
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=your_sender_id

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PAYMENT_TEST_MODE=true

# Server
PORT=8000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
```

---

## 17. API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 18. Testing

### Manual Testing Checklist

- [ ] User registration and OTP login
- [ ] Admin login
- [ ] Child registration
- [ ] Vaccination tracking
- [ ] Development milestones
- [ ] Profile picture upload
- [ ] Certificate download
- [ ] Payment flow
- [ ] Admin panel access
- [ ] CMS operations
- [ ] Reminder system
- [ ] CSV export

---

**Document Version**: 1.0
**Last Updated**: March 16, 2026
**Total Features**: 100+
**Total API Endpoints**: 50+
**Total Functions**: 150+
