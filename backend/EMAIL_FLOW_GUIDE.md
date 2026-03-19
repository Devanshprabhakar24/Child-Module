# Email Flow Guide - Registration & Payment

## Overview

When a user registers a child and completes payment, they receive **2 separate emails** in sequence:

### Email 1: Welcome Email with Payment Invoice 📧

**Sent by:** `PaymentsService` (immediately after payment confirmation)
**Subject:** 🎉 Welcome to WombTo18 - Registration Successful!
**Attachments:** Payment Invoice PDF

**Content:**

- Welcome message
- Registration confirmation
- Payment confirmation (amount paid)
- Registration ID and child details
- Dashboard access link
- List of activated services
- Note about upcoming Go Green certificate

**Method:** `sendWelcomeWithInvoice()` in `NotificationsService`

---

### Email 2: Go Green Certificate 🌱

**Sent by:** `RegistrationService` (5 seconds after Email 1)
**Subject:** 🌱 Your Go Green Participation Certificate
**Attachments:** Go Green Certificate PDF

**Content:**

- Congratulations message
- Tree planting confirmation
- Tree ID
- Certificate with child's name and issue date
- Environmental initiative details

**Method:** `sendGoGreenCertificate()` in `NotificationsService`

---

## Technical Flow

### 1. Payment Captured Webhook

```
PaymentsService.handlePaymentCaptured()
  ↓
generateAndSendInvoice()
  ↓
NotificationsService.sendWelcomeWithInvoice()
  ├─ SMS: Welcome + payment confirmation
  ├─ WhatsApp: Welcome + payment invoice PDF
  └─ Email: Welcome email with invoice PDF attached
```

### 2. Post-Payment Notifications

```
RegistrationService.sendPostPaymentNotifications()
  ↓
1. Plant tree (GoGreenService.plantTree())
  ↓
2. Schedule certificate email (5 second delay)
  ↓
3. Activate all services
  ↓
NotificationsService.sendGoGreenCertificate()
  ├─ WhatsApp: Certificate PDF
  └─ Email: Go Green certificate with PDF attached
```

---

## Files Modified

### 1. `backend/src/payments/payments.service.ts`

- Updated `generateAndSendInvoice()` to call `sendWelcomeWithInvoice()` instead of `sendPaymentConfirmation()`

### 2. `backend/src/registration/registration.service.ts`

- Updated `sendPostPaymentNotifications()` to remove welcome message (now sent by PaymentsService)
- Focuses on tree planting and certificate email scheduling

### 3. `backend/src/notifications/notifications.service.ts`

- Added new method: `sendWelcomeWithInvoice()`
- Combines welcome message with payment invoice

### 4. `backend/src/notifications/email.service.ts`

- Added new method: `sendWelcomeWithInvoiceEmail()`
- Added new template: `getWelcomeWithInvoiceTemplate()`
- Beautiful HTML email with payment details and dashboard link

---

## Email Templates

### Welcome with Invoice Template Features:

- ✅ Payment confirmation badge
- 📋 Registration details
- 💰 Amount paid display
- 🔗 Dashboard access button
- 📄 Invoice PDF attachment
- 📧 Note about upcoming certificate
- 🎨 Professional green gradient design

### Go Green Certificate Template Features:

- 🌱 Tree planting confirmation
- 🆔 Unique Tree ID
- 📜 Beautiful certificate PDF
- 🌍 Environmental initiative message
- 🎨 Green-themed design

---

## Testing

To test the email flow:

1. Register a new child
2. Complete payment (test mode or real)
3. Check email inbox for:
   - **Email 1** (immediate): Welcome + Invoice PDF
   - **Email 2** (after 5 seconds): Go Green Certificate PDF

---

## Benefits

✅ **Clear separation** - Welcome and certificate are distinct communications
✅ **Better UX** - Users receive invoice immediately with welcome
✅ **Professional** - Two focused emails instead of one cluttered email
✅ **Organized** - Easy to find invoice vs certificate
✅ **Scalable** - Easy to add more emails in the sequence

---

## Future Enhancements

- Add email 3: Vaccination schedule overview
- Add email 4: Tips for first-time parents
- Add email 5: Community features introduction
