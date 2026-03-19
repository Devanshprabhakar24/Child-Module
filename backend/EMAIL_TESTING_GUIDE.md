# Email Sequence Testing Guide

## Overview

After registration and payment confirmation, users should receive 2 emails:

1. **Email 1 (Immediate):** Welcome message with payment invoice PDF
2. **Email 2 (5 seconds later):** Go Green participation certificate PDF

## Quick Test

### Step 1: Verify Email Implementation

```bash
cd backend
node test-email-sequence.js
```

This will check:

- ✅ Email 1 implementation exists
- ✅ Email 2 implementation exists
- ✅ 5-second delay is configured
- ✅ SMTP configuration status

### Step 2: Trigger Test Emails

```bash
# Find a registration ID
node list-all-registrations.js

# Trigger emails for that registration
node trigger-test-emails.js CHD-UP-20220607-000001
```

This will:

- Confirm payment (if not already confirmed)
- Send Email 1 immediately
- Send Email 2 after 5 seconds
- Show expected email details

### Step 3: Check Results

**Backend Logs:**
Look for these messages:

```
✅ Welcome email with invoice sent for CHD-XX-XXXXXXXX-XXXXXX
✅ Go Green certificate sent for CHD-XX-XXXXXXXX-XXXXXX with tree ID: TREE-2026-XXXXX
```

**Email Inbox:**
Check for 2 emails:

1. "🎉 Welcome to WombTo18 - Registration Successful!" (with invoice PDF)
2. "🌱 [Child Name]'s Go Green Participation Certificate" (with certificate PDF)

## SMTP Configuration

### Check Current Configuration

```bash
cd backend
node test-email-sequence.js
```

Look for "SMTP Configuration Check" section.

### Configure SMTP (Gmail Example)

Add to `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@wombto18.com
```

**Note:** For Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the app password in SMTP_PASS

### Test SMTP Connection

After configuring SMTP, trigger test emails:

```bash
node trigger-test-emails.js CHD-UP-20220607-000001
```

Check your email inbox for both emails.

## Email Flow Diagram

```
User Completes Registration
         ↓
Payment Confirmed (Razorpay webhook or test mode)
         ↓
PaymentsService.handlePaymentCaptured()
         ↓
PaymentsService.generateAndSendInvoice()
         ├─→ Generate invoice PDF
         └─→ NotificationsService.sendWelcomeWithInvoice()
                  ↓
             📧 EMAIL 1 SENT (Immediate)
                  Subject: "🎉 Welcome to WombTo18 - Registration Successful!"
                  Attachment: Invoice PDF

RegistrationService.sendPostPaymentNotifications()
         ├─→ GoGreenService.plantTree()
         ├─→ scheduleCertificateEmail() ← 5 SECOND DELAY
         └─→ activateAllServicesForRegistration()

After 5 seconds:
         ↓
NotificationsService.sendGoGreenCertificate()
         ↓
    📧 EMAIL 2 SENT
         Subject: "🌱 [Child Name]'s Go Green Participation Certificate"
         Attachment: Certificate PDF
```

## Email Templates

### Email 1: Welcome + Invoice

**Subject:** 🎉 Welcome to WombTo18 - Registration Successful!

**Content:**

- Welcome message
- Registration details (ID, child name)
- Payment confirmation (₹999)
- Dashboard access link
- Service activation list
- Note about upcoming Go Green certificate
- **Attachment:** Invoice PDF

**Template File:** `backend/src/notifications/email.service.ts`
**Method:** `sendWelcomeWithInvoiceEmail()`

### Email 2: Go Green Certificate

**Subject:** 🌱 [Child Name]'s Go Green Participation Certificate - WombTo18

**Content:**

- Congratulations message
- Go Green cohort enrollment
- Tree planting confirmation
- Tree ID
- Environmental initiative message
- **Attachment:** Certificate PDF

**Template File:** `backend/src/notifications/email.service.ts`
**Method:** `sendGoGreenCertificateEmail()`

## Testing Scenarios

### Scenario 1: New Registration (Test Mode)

1. Set `PAYMENT_TEST_MODE=true` in `.env`
2. Complete registration via frontend
3. Call test payment confirmation:
   ```bash
   curl -X POST http://localhost:8000/registration/confirm-test-payment/CHD-XX-XXXXXXXX-XXXXXX
   ```
4. Check backend logs for email sending messages
5. Check email inbox for both emails

### Scenario 2: Existing Registration

1. Find a completed registration:
   ```bash
   node list-all-registrations.js
   ```
2. Trigger emails:
   ```bash
   node trigger-test-emails.js CHD-UP-20220607-000001
   ```
3. Check logs and inbox

### Scenario 3: Production Webhook

1. Set `PAYMENT_TEST_MODE=false` in `.env`
2. Configure Razorpay webhook URL: `https://your-domain.com/registration/webhook`
3. Complete real payment via Razorpay
4. Razorpay sends webhook to your server
5. Backend processes webhook and sends emails
6. Check logs and inbox

## Verification Checklist

- [ ] Backend server is running
- [ ] SMTP is configured in `.env`
- [ ] Test mode is enabled (for testing)
- [ ] Registration exists with COMPLETED payment status
- [ ] Email 1 sent immediately after payment confirmation
- [ ] Email 2 sent 5 seconds after Email 1
- [ ] Both emails received in inbox
- [ ] Invoice PDF attached to Email 1
- [ ] Certificate PDF attached to Email 2
- [ ] Backend logs show success messages
- [ ] No errors in backend logs

## Troubleshooting

### Issue: No emails received

**Check 1: SMTP Configuration**

```bash
node test-email-sequence.js
```

Look for "SMTP Configuration Check" - should show "✅ SMTP is configured"

**Check 2: Backend Logs**
Look for email sending messages:

```
✅ Welcome email with invoice sent for [registrationId]
✅ Go Green certificate sent for [registrationId]
```

If you see these, emails were sent. Check spam folder.

**Check 3: Email Service Errors**
Look for error messages:

```
❌ Failed to send welcome email to [email]: [error]
❌ Failed to send Go Green certificate email to [email]: [error]
```

### Issue: Only Email 1 received, not Email 2

**Possible Causes:**

1. Certificate generation failed
2. Tree planting failed
3. 5-second delay not working

**Check Backend Logs:**

```
✅ Tree planted successfully: TREE-2026-XXXXX
✅ Go Green certificate sent for [registrationId]
```

If tree planting failed, certificate won't be sent.

**Solution:**
Manually plant tree and resend certificate:

```bash
# Plant tree via API
curl -X POST http://localhost:8000/go-green/plant-tree \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": "CHD-XX-XXXXXXXX-XXXXXX",
    "childName": "Child Name",
    "motherName": "Mother Name",
    "location": "State"
  }'

# Trigger emails again
node trigger-test-emails.js CHD-XX-XXXXXXXX-XXXXXX
```

### Issue: Emails in spam folder

**Solution:**

1. Add sender email to contacts
2. Mark as "Not Spam"
3. For production, configure SPF, DKIM, and DMARC records

### Issue: "Payment already confirmed" error

This means the registration already has payment status = COMPLETED.
The email sequence only runs once per registration.

**To test again:**

1. Create a new registration
2. Or manually update payment status in database:
   ```javascript
   db.child_registrations.updateOne(
     { registrationId: "CHD-XX-XXXXXXXX-XXXXXX" },
     { $set: { paymentStatus: "PENDING" } },
   );
   ```
3. Then trigger emails again

## Production Deployment

### 1. Configure SMTP

Use a production email service:

- SendGrid
- AWS SES
- Mailgun
- Gmail (with app password)

### 2. Configure Razorpay Webhook

1. Go to Razorpay Dashboard
2. Settings → Webhooks
3. Add webhook URL: `https://your-domain.com/registration/webhook`
4. Select events: `payment.captured`, `payment.failed`
5. Copy webhook secret to `.env`: `RAZORPAY_WEBHOOK_SECRET=...`

### 3. Test in Production

1. Complete a real registration
2. Make a real payment
3. Check backend logs
4. Verify both emails received

### 4. Monitor Email Delivery

- Check backend logs daily for email errors
- Monitor email bounce rates
- Set up alerts for failed email sends

## Files Involved

**Email Implementation:**

- `backend/src/payments/payments.service.ts` - Email 1 trigger
- `backend/src/registration/registration.service.ts` - Email 2 scheduling
- `backend/src/notifications/notifications.service.ts` - Email dispatching
- `backend/src/notifications/email.service.ts` - Email templates and sending

**PDF Generation:**

- `backend/src/payments/invoice.service.ts` - Invoice PDF
- `backend/src/registration/certificate.service.ts` - Certificate PDF

**Testing Scripts:**

- `backend/test-email-sequence.js` - Verify implementation
- `backend/trigger-test-emails.js` - Trigger test emails
- `backend/list-all-registrations.js` - List registrations

**Documentation:**

- `backend/EMAIL_SEQUENCE_VERIFICATION.md` - Implementation details
- `backend/EMAIL_TESTING_GUIDE.md` - This file

## Summary

The email sequencing is correctly implemented:

- ✅ Email 1 (Welcome + Invoice) sent immediately
- ✅ Email 2 (Go Green Certificate) sent 5 seconds later
- ✅ Both emails have proper templates
- ✅ Both emails have PDF attachments
- ✅ Error handling in place

To test:

1. Run `node test-email-sequence.js` to verify implementation
2. Run `node trigger-test-emails.js CHD-XX-XXXXXXXX-XXXXXX` to send test emails
3. Check backend logs and email inbox
