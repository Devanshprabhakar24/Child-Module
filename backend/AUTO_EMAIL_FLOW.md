# Automatic Email Flow - Bypass Razorpay

## Configuration

✅ **PAYMENT_TEST_MODE=true** is now enabled in `.env`

This completely bypasses Razorpay payment gateway and automatically sends both emails on registration.

---

## What Happens When a User Registers

### 1. Registration Process

- User fills registration form and submits
- System creates registration with `paymentStatus: 'COMPLETED'` automatically
- No Razorpay payment page is shown
- Mock payment ID is generated: `test_pay_[timestamp]`

### 2. Automatic Email Sequence

#### Email 1: Welcome + Payment Invoice (Immediate)

- **Sent by**: `PaymentsService.generateAndSendInvoice()`
- **Triggered by**: `NotificationsService.sendWelcomeWithInvoice()`
- **Subject**: "🎉 Welcome to WombTo18 - Registration Successful!"
- **Contains**:
  - Welcome message
  - Registration confirmation
  - Payment receipt (₹999)
  - Payment invoice PDF attachment
  - Dashboard link

#### Email 2: Go Green Certificate (5 seconds later)

- **Sent by**: `RegistrationService.scheduleCertificateEmail()`
- **Triggered by**: `NotificationsService.sendGoGreenCertificate()`
- **Subject**: "🌱 [Child Name]'s Go Green Participation Certificate"
- **Contains**:
  - Go Green participation message
  - Tree planting confirmation
  - Go Green certificate PDF attachment
  - Tree ID

---

## Code Flow

```typescript
// 1. User submits registration
registerChild(dto) {
  // Payment status automatically set to COMPLETED in test mode
  paymentStatus: this.paymentTestMode ? 'COMPLETED' : 'PENDING'

  // Auto-trigger post-payment notifications
  if (this.paymentTestMode) {
    setImmediate(async () => {
      await this.sendPostPaymentNotifications(registration);
    });
  }
}

// 2. Post-payment notifications
sendPostPaymentNotifications(registration) {
  // Plant tree first
  plantedTree = await goGreenService.plantTree(...)

  // Schedule certificate email (5 seconds delay)
  scheduleCertificateEmail(registration, plantedTree)

  // Activate all services (vaccinations, milestones, reminders)
  activateAllServicesForRegistration(registration, plantedTree)
}

// 3. Payment service sends Email 1
PaymentsService.generateAndSendInvoice(payment) {
  // Generate invoice PDF
  pdfBuffer = await invoiceService.generateInvoice(...)

  // Send welcome email with invoice
  await notificationsService.sendWelcomeWithInvoice({
    email, parentName, childName, registrationId, amount, invoiceBuffer
  })
}

// 4. Registration service sends Email 2 (after 5 seconds)
scheduleCertificateEmail(registration, plantedTree) {
  delay(5000).then(async () => {
    await notificationsService.sendGoGreenCertificate({
      email, parentName, childName, registrationId, treeId
    })
  })
}
```

---

## Services Automatically Activated

When `PAYMENT_TEST_MODE=true`, the following services are activated automatically:

1. **Vaccination Milestones** (27 vaccines)
   - BCG, Hepatitis B, OPV, DPT, Hib, IPV, PCV, Rotavirus, MMR, Varicella, Typhoid, Hepatitis A, HPV, Tdap, Meningococcal

2. **Development Milestones** (age-appropriate)
   - Physical, Language, Cognitive, Social milestones based on child's age group

3. **Reminders** (SMS + WhatsApp)
   - D-2 (2 days before due date)
   - D-Day (on due date)
   - D+2 (2 days after due date)

4. **Tree Planting**
   - One tree planted per registration
   - Tree ID generated and included in certificate

---

## Testing the Flow

### Test New Registration

1. Start backend: `npm run start:dev`
2. Register a new child through the frontend
3. Check email inbox for:
   - Email 1: Welcome + Invoice PDF (immediate)
   - Email 2: Go Green Certificate PDF (5 seconds later)

### Process Existing Registrations

If you have existing registrations with `PENDING` payment status:

```bash
cd backend
node complete-auto-setup.js
```

This will:

- Set all PENDING registrations to COMPLETED
- Send both emails to each registration
- Activate all services

---

## Email Configuration

Current SMTP settings (from `.env`):

- **Host**: smtp.gmail.com
- **Port**: 465
- **User**: dev24prabhakar@gmail.com
- **From**: noreply@wombto18.com

---

## Switching Back to Production Mode

To re-enable Razorpay payment gateway:

1. Change `.env`:

   ```
   PAYMENT_TEST_MODE=false
   ```

2. Restart backend server

3. Users will see Razorpay payment page
4. Emails sent only after successful payment

---

## Important Notes

- ✅ No Razorpay payment page shown in test mode
- ✅ Both emails sent automatically on registration
- ✅ All services activated immediately
- ✅ Tree planted for each registration
- ✅ Invoice and certificate PDFs generated
- ⚠️ Test mode should NOT be used in production
- ⚠️ All payments marked as COMPLETED without actual payment

---

## Troubleshooting

### Emails not received?

1. Check SMTP credentials in `.env`
2. Check spam/junk folder
3. Check backend logs for email errors
4. Verify email address is valid

### Certificate not generated?

1. Check if tree was planted successfully
2. Check certificate template exists: `backend/go-green-certificate/certificate-template.html`
3. Check backend logs for PDF generation errors

### Services not activated?

1. Check if milestone templates are seeded: `node seed-milestone-templates.js`
2. Check backend logs for activation errors
3. Manually activate: `POST /registration/activate-all-incomplete`

---

## Summary

With `PAYMENT_TEST_MODE=true`:

- ✅ Razorpay completely bypassed
- ✅ Payment status automatically COMPLETED
- ✅ Email 1 (Welcome + Invoice) sent immediately
- ✅ Email 2 (Go Green Certificate) sent after 5 seconds
- ✅ All services activated automatically
- ✅ Tree planted for each child
- ✅ Ready for testing without payment gateway
