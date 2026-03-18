# Payment Email with Invoice Implementation Guide

## Overview

When a payment is completed, the system automatically sends a payment confirmation email to the user with a PDF invoice attached. This is handled through the Razorpay webhook system.

## Flow Diagram

```
Payment Completed (Razorpay)
    ↓
Webhook: /payments/webhook/razorpay
    ↓
PaymentsService.handlePaymentCaptured()
    ↓
PaymentsService.generateAndSendInvoice()
    ↓
InvoiceService.generateInvoice() → PDF Buffer
    ↓
NotificationsService.sendPaymentConfirmation()
    ↓
EmailService.sendPaymentConfirmationEmail() → Email with PDF attachment
```

## Implementation Details

### 1. Webhook Handler (`PaymentsController`)

- **Endpoint**: `POST /payments/webhook/razorpay`
- **Purpose**: Receives Razorpay webhook events
- **Security**: Verifies webhook signature
- **Events Handled**: `payment.captured`, `payment.failed`

### 2. Payment Processing (`PaymentsService`)

- **Method**: `handlePaymentCaptured()`
- **Updates**: Payment status to 'COMPLETED'
- **Triggers**: Invoice generation and email sending

### 3. Invoice Generation (`InvoiceService`)

- **Method**: `generateInvoice()`
- **Output**: Professional PDF invoice buffer
- **Features**:
  - Company branding
  - Payment details
  - GST breakdown
  - Payment method info

### 4. Email Delivery (`EmailService`)

- **Method**: `sendPaymentConfirmationEmail()`
- **Features**:
  - HTML email template
  - PDF invoice attachment
  - Payment confirmation message

## Email Template Features

The payment confirmation email includes:

- **Subject**: "WombTo18 - Payment Confirmation"
- **Content**:
  - Personalized greeting with parent and child names
  - Payment amount and registration ID
  - Thank you message
  - Professional HTML formatting
- **Attachment**: PDF invoice with detailed breakdown

## Invoice PDF Features

The generated invoice includes:

- **Header**: WombTo18 branding and logo area
- **Invoice Details**:
  - Invoice number (timestamp-based)
  - Date of payment
  - Razorpay Order ID and Payment ID
- **Billing Information**:
  - Parent name and contact details
  - Child name and registration ID
- **Payment Breakdown**:
  - Base subscription amount
  - GST calculation (18%)
  - Total amount paid
- **Payment Method**: Card/UPI/Net Banking details
- **Footer**: Company information and legal text

## Configuration

### Environment Variables Required

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Test Mode Behavior

- **Test Mode**: Invoice generated immediately after order creation
- **Production Mode**: Invoice generated only after successful payment webhook

## API Endpoints

### Download Invoice

```
GET /payments/:registrationId/invoice
```

Allows users to download their invoice PDF directly.

### Payment Status

```
GET /payments/test-mode-status
```

Returns current payment configuration status.

## Testing the Flow

### 1. Manual Testing

```bash
# Create a test payment
curl -X POST http://localhost:8000/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"registrationId": "TEST123", "childName": "Test Child"}'

# In test mode, invoice should be generated immediately
# Check email for payment confirmation with PDF attachment
```

### 2. Webhook Testing

```bash
# Simulate Razorpay webhook (replace with actual webhook payload)
curl -X POST http://localhost:8000/payments/webhook/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: valid_signature" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test123",
          "method": "card",
          "amount": 99900,
          "currency": "INR"
        }
      }
    }
  }'
```

### 3. Invoice Download Testing

```bash
# Download invoice for a completed payment
curl -X GET http://localhost:8000/payments/TEST123/invoice \
  -H "Authorization: Bearer your_jwt_token" \
  --output invoice.pdf
```

## Error Handling

### Common Issues and Solutions

1. **Email Not Sent**
   - Check SMTP configuration
   - Verify email credentials
   - Check server logs for email service errors

2. **PDF Generation Failed**
   - Check PDFKit dependencies
   - Verify invoice data completeness
   - Check memory limits for PDF generation

3. **Webhook Signature Invalid**
   - Verify Razorpay webhook secret
   - Check raw body parsing in middleware
   - Ensure signature header is present

4. **Duplicate Emails**
   - Ensure only one webhook endpoint is configured in Razorpay
   - Check for duplicate service calls
   - Verify payment status updates

## Monitoring and Logs

### Key Log Messages

```
📧 Real email sent to user@example.com
Invoice generated for REG123 (45678 bytes)
Payment captured: pay_123 for REG123
Payment confirmation email sent to user@example.com
```

### Error Log Patterns

```
Failed to generate/send invoice for REG123: [error details]
Failed to send payment confirmation email to user@example.com: [error details]
Invalid RazorPay webhook signature
```

## Security Considerations

1. **Webhook Security**: All webhooks verify Razorpay signature
2. **Email Security**: Uses secure SMTP with authentication
3. **Data Privacy**: Invoice contains only necessary payment information
4. **Access Control**: Invoice download requires authentication

## Future Enhancements

Potential improvements:

- Email delivery status tracking
- Invoice customization options
- Multiple invoice formats (PDF, HTML)
- Automated retry for failed email deliveries
- Invoice archival and retrieval system
- Multi-language invoice support
