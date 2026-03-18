# Go Green Certificate Flow Implementation Guide

## Overview

After payment completion, users receive a Go Green Participation Certificate via email with a proper Tree ID. The certificate is sent after the payment confirmation email to ensure proper sequencing.

## Email Sequence Flow

```
Payment Completed (Razorpay Webhook)
    ↓
1. Payment Confirmation Email (with Invoice PDF) - IMMEDIATE
    ↓
2. Welcome Message - IMMEDIATE  
    ↓
3. Tree Planting Process - IMMEDIATE
    ↓
4. Go Green Certificate Email (with Certificate PDF) - 5 SECOND DELAY
```

## Implementation Details

### 1. Tree Planting Process

**Service**: `GoGreenService.plantTree()`

**Features**:
- Generates unique Tree ID: `TREE-YYYY-XXXXXX` format
- Selects random tree species from available options
- Calculates estimated CO2 absorption based on species
- Creates growth timeline with initial "PLANTED" status
- Handles duplicate tree prevention
- Robust error handling with fallback Tree IDs

**Tree Species Available**:
- Neem (48 kg CO2/year)
- Banyan (65 kg CO2/year) 
- Peepal (52 kg CO2/year)
- Mango (42 kg CO2/year)
- Teak (38 kg CO2/year)
- Bamboo (35 kg CO2/year)
- Eucalyptus (55 kg CO2/year)
- Ashoka (40 kg CO2/year)
- Gulmohar (45 kg CO2/year)
- Coconut (30 kg CO2/year)

### 2. Certificate Generation

**Service**: `CertificateService.generateGoGreenCertificate()`

**Certificate Features**:
- Professional landscape A4 PDF format
- WombTo18 branding and colors
- Child and parent information
- Registration details with Tree ID
- Environmental commitment message
- Official seal and signature area
- Decorative green-themed design elements

**Certificate Data Included**:
- Certificate Number: `GGC-{registrationId}`
- Issue Date: Current date in Indian format
- Child Name (prominent display)
- Parent Name (Mother's name)
- Registration ID
- Date of Birth with calculated age
- State information
- **Tree ID**: Actual planted tree ID or fallback ID

### 3. Email Sequencing

**Problem Solved**: Ensures users receive emails in logical order
1. Payment confirmation first (most important)
2. Certificate second (celebratory follow-up)

**Implementation**: 
- Uses Promise-based delay (5 seconds)
- Proper error handling for scheduled emails
- Comprehensive logging for troubleshooting

### 4. Tree ID Handling

**Primary Tree ID**: Generated from database sequence
- Format: `TREE-2026-000001`, `TREE-2026-000002`, etc.
- Unique per year with 6-digit padding

**Fallback Tree ID**: If generation fails
- Format: `TREE-2026-{timestamp}`
- Ensures certificate always has a Tree ID

**Certificate Display**: 
- Shows actual Tree ID if available
- Shows fallback ID if tree planting failed
- Never shows "Pending" anymore

## API Endpoints

### Tree Information
```
GET /go-green/tree/:registrationId
```
Get tree information for a child registration.

### Certificate Download
```
GET /registration/:registrationId/certificate
```
Download Go Green certificate PDF directly.

## Configuration

### Environment Variables
```env
# Email settings (same as payment emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Certificate delay (optional)
CERTIFICATE_EMAIL_DELAY=5000  # milliseconds
```

## Testing the Flow

### 1. Complete Payment Flow Test
```bash
# 1. Create registration and payment
curl -X POST http://localhost:8000/registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "childNa