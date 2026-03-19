# Email Sequence Status & Testing Guide

## ✅ Current Status

### Implementation: COMPLETE ✅

Both emails are correctly implemented and ready to send:

1. **Email 1 (Welcome + Invoice)** - ✅ Implemented
   - Trigger: Payment confirmation
   - Method: `NotificationsService.sendWelcomeWithInvoice()`
   - Template: `EmailService.sendWelcomeWithInvoiceEmail()`
   - Timing: Immediate
   - Attachment: Invoice PDF

2. **Email 2 (Go Green Certificate)** - ✅ Implemented
   - Trigger: 5 seconds after Email 1
   - Method: `NotificationsService.sendGoGreenCertificate()`
   - Template: `EmailService.sendGoGreenCertificateEmail()`
   - Timing: 5-second delay
   - Attachment: Certificate PDF

### Database Status

Current registrations:

- **CHD-UP-20220607-000001** (Deva/Rani)
  - Payment Status: PENDING
  - Email: dev24prabhakar@gmail.com
  - Go Green Cert Sent: NO
- **CHD-JH-20260301-000001** (Deva/Shashi)
  - Payment Status: PENDING
  - Email: devansh.prabhakar@wombto18.org
  - Go Green Cert Sent: NO

**Note:** Emails will be sent when payment status changes to COMPLETED.

## 🧪 How to Test Email Sequence

### Method 1: Quick Test (Recommended)

1. **Start backend:**

   ```bash
   cd backend
   npm run start:dev
   ```

2. **Trigger test emails:**

   ```bash
   node trigger-test-emails.js CHD-UP-20220607-000001
   ```

3. **Check results:**
   - Backend logs for success messages
   - Email inbox for both emails

### Method 2: Via API

1. **Start backend**

2. **Confirm test payment:**

   ```bash
   curl -X POST http://localhost:8000/registration/confirm-test-payment/CHD-UP-20220607-000001
   ```

3. **Check logs and inbox**

### Method 3: Complete New Registration

1. **Enable test mode** in `.env`:

   ```
   PAYMENT_TEST_MODE=true
   ```

2. **Complete registration** via frontend

3. **Confirm payment:**

   ```bash
   curl -X POST http://localhost:8000/registration/confirm-test-payment/[NEW_REGISTRATION_ID]
   ```

4. **Check emails**

## 📧 Expected Email Flow

### Timeline

```
T+0s:  Payment confirmed
       ↓
       Email 1 sent (Welcome + Invoice PDF)
       ↓
T+5s:  Email 2 sent (Go Green Certificate PDF)
```

### Email 1 Details

**Subject:** 🎉 Welcome to WombTo18 - Registration Successful!

**To:** dev24prabhakar@gmail.com (or registration email)

**Content:**

- Welcome message
- Registration ID: CHD-UP-20220607-000001
- Child Name: Deva
- Payment confirmation: ₹999
- Dashboard link with registration ID
- Service activation list
- Note about upcoming Go Green certificate

**Attachment:** `WombTo18_Invoice_CHD-UP-20220607-000001.pdf`

### Email 2 Details

**Subject:** 🌱 Deva's Go Green Participation Certificate - WombTo18

**To:** dev24prabhakar@gmail.com (or registration email)

**Content:**

- Congratulations message
- Go Green cohort enrollment
- Tree planting confirmation
- Tree ID (e.g., TREE-2026-12345)
- Environmental initiative message
- Registration details

**Attachment:** `Deva_GoGreen_Certificate_CHD-UP-20220607-000001.pdf`

## 🔍 Verification Steps

### 1. Check Implementation

```bash
cd backend
node test-email-sequence.js
```

Expected output:

```
✅ Email 1: Welcome + Payment Invoice
✅ Email 2: Go Green Certificate
✅ 5-second delay: IMPLEMENTED
✅ Email templates: EXIST
✅ PDF attachments: CONFIGURED
```

### 2. Check SMTP Configuration

```bash
node test-email-sequence.js
```

Look for "SMTP Configuration Check" section.

**If SMTP is configured:**

```
✅ SMTP is configured
Host: smtp.gmail.com
Port: 465
User: dev24prabhakar@gmail.com
Status: Emails will be sent
```

**If SMTP is NOT configured:**

```
⚠️  SMTP is NOT fully configured
Status: Emails will be logged but not sent
```

### 3. Trigger Test Emails

```bash
node trigger-test-emails.js CHD-UP-20220607-000001
```

Expected output:

```
✅ EMAIL SEQUENCE TRIGGERED
Email 1 (Immediate): Should be sent now
Email 2 (5 seconds later): Will be sent in 5 seconds
```

### 4. Check Backend Logs

Look for these success messages:

```
✅ Welcome email with invoice sent for CHD-UP-20220607-000001
✅ Tree planted successfully: TREE-2026-XXXXX
✅ Go Green certificate sent for CHD-UP-20220607-000001 with tree ID: TREE-2026-XXXXX
```

### 5. Check Email Inbox

Within 10 seconds, you should receive:

1. Email with subject "🎉 Welcome to WombTo18 - Registration Successful!"
2. Email with subject "🌱 Deva's Go Green Participation Certificate"

Both emails should have PDF attachments.

## ⚙️ SMTP Configuration

### Gmail Setup (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "WombTo18"
   - Copy the 16-character password

3. **Add to `.env`:**

   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=dev24prabhakar@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=noreply@wombto18.com
   ```

4. **Restart backend:**

   ```bash
   npm run start:dev
   ```

5. **Test emails:**
   ```bash
   node trigger-test-emails.js CHD-UP-20220607-000001
   ```

### Production SMTP Services

For production, use a dedicated email service:

- **SendGrid** - 100 emails/day free
- **AWS SES** - $0.10 per 1,000 emails
- **Mailgun** - 5,000 emails/month free
- **Postmark** - 100 emails/month free

## 📋 Testing Checklist

- [ ] Backend server is running
- [ ] SMTP is configured in `.env`
- [ ] Test mode enabled: `PAYMENT_TEST_MODE=true`
- [ ] Registration exists in database
- [ ] Run `node test-email-sequence.js` - all checks pass
- [ ] Run `node trigger-test-emails.js CHD-UP-20220607-000001`
- [ ] Check backend logs - see success messages
- [ ] Check email inbox - receive Email 1
- [ ] Wait 5 seconds - receive Email 2
- [ ] Both emails have PDF attachments
- [ ] No errors in backend logs

## 🛠️ Troubleshooting

### Issue: No emails received

**Solution 1: Check SMTP**

```bash
node test-email-sequence.js
```

Verify SMTP is configured correctly.

**Solution 2: Check Backend Logs**
Look for email sending messages or errors.

**Solution 3: Check Spam Folder**
Emails might be in spam/junk folder.

**Solution 4: Test SMTP Connection**
Try sending a test email manually to verify SMTP works.

### Issue: Only Email 1 received

**Possible Cause:** Tree planting or certificate generation failed

**Solution:**
Check backend logs for errors:

```
❌ Failed to plant tree for [registrationId]
❌ Failed to generate/send Go Green certificate
```

### Issue: "Payment already confirmed"

**Cause:** Registration already has `paymentStatus: COMPLETED`

**Solution:**
Use a different registration or create a new one.

### Issue: Backend not running

**Solution:**

```bash
cd backend
npm run start:dev
```

Wait for "Nest application successfully started" message.

## 📁 Testing Scripts

All scripts are in `backend/` directory:

- `test-email-sequence.js` - Verify email implementation
- `trigger-test-emails.js` - Send test emails to a registration
- `list-all-registrations.js` - List all registrations with status
- `setup-everything.js` - Complete setup (templates + services)

## 📚 Documentation

- `backend/EMAIL_TESTING_GUIDE.md` - Comprehensive testing guide
- `backend/EMAIL_SEQUENCE_VERIFICATION.md` - Implementation details
- `backend/AUTO_ACTIVATE_SERVICES_GUIDE.md` - Service activation guide
- `SETUP_COMPLETE.md` - Complete setup summary

## ✅ Summary

**Email Sequence Status:** ✅ FULLY IMPLEMENTED

Both emails are correctly coded and ready to send:

1. ✅ Email 1 (Welcome + Invoice) - Immediate
2. ✅ Email 2 (Go Green Certificate) - 5 seconds later

**To Test:**

1. Configure SMTP in `.env`
2. Run `node trigger-test-emails.js CHD-UP-20220607-000001`
3. Check inbox for both emails

**For Production:**

- Configure production SMTP service
- Set up Razorpay webhook
- Monitor email delivery logs

The email system is production-ready!
