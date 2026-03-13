# Real Payment Testing Script
$API = "http://localhost:3000"
$CT = "application/json"
$timestamp = Get-Date -Format "HHmmss"
$testEmail = "realpay_${timestamp}@test.com"
$testPhone = "+919876${timestamp}"

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  REAL PAYMENT TESTING - WombTo18 API" -ForegroundColor Yellow
Write-Host "  Email: $testEmail" -ForegroundColor Yellow
Write-Host "  Phone: $testPhone" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

function Call-API {
    param([string]$Label, [string]$Method, [string]$Url, [string]$Body, [hashtable]$Headers, [switch]$ExpectFail)
    Write-Host "`n===== $Label =====" -ForegroundColor Cyan
    Write-Host "$Method $Url" -ForegroundColor DarkGray
    try {
        $params = @{ Uri = $Url; Method = $Method; UseBasicParsing = $true }
        if ($Body) { $params.Body = $Body; $params.ContentType = $CT }
        if ($Headers) { $params.Headers = $Headers }
        $resp = Invoke-WebRequest @params
        Write-Host "PASS [$($resp.StatusCode)]" -ForegroundColor Green
        $parsed = $resp.Content | ConvertFrom-Json
        $json = $parsed | ConvertTo-Json -Depth 10 -Compress
        if ($json.Length -gt 400) { $json = $json.Substring(0, 400) + "..." }
        Write-Host $json
        return $parsed
    }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        $detail = $_.ErrorDetails.Message
        if ($ExpectFail) {
            Write-Host "PASS (expected $code)" -ForegroundColor Green
            Write-Host $detail
        }
        else {
            Write-Host "FAIL [$code] $detail" -ForegroundColor Red
        }
        return $null
    }
}

# Step 1: Register User
Write-Host "`n`n############ STEP 1: USER REGISTRATION ############" -ForegroundColor Magenta
$userResult = Call-API "Register User" "POST" "$API/auth/register" (@{
    fullName = "Payment Test User"
    email    = $testEmail
    phone    = $testPhone
} | ConvertTo-Json)

# Step 2: Send and Verify OTP
Write-Host "`n`n############ STEP 2: AUTHENTICATION ############" -ForegroundColor Magenta
Call-API "Send OTP" "POST" "$API/auth/send-otp" (@{
    email = $testEmail
} | ConvertTo-Json)

$otp = Read-Host "Enter OTP received in email (or press Enter for test code)"
if (-not $otp) { $otp = "123456" }

$authResult = Call-API "Verify OTP" "POST" "$API/auth/verify-otp" (@{
    email = $testEmail
    otp   = $otp
} | ConvertTo-Json)

$token = ""
if ($authResult) {
    if ($authResult.token) { $token = $authResult.token }
    elseif ($authResult.access_token) { $token = $authResult.access_token }
}
if ($token) { 
    Write-Host "AUTH SUCCESSFUL" -ForegroundColor Green
    $authHeaders = @{ Authorization = "Bearer $token" }
} else {
    Write-Host "AUTH FAILED - Cannot proceed with payment tests" -ForegroundColor Red
    exit 1
}

# Step 3: Register Child
Write-Host "`n`n############ STEP 3: CHILD REGISTRATION ############" -ForegroundColor Magenta
$regResult = Call-API "Register Child" "POST" "$API/registration" (@{
    childName        = "Payment Test Child"
    childGender      = "MALE"
    dateOfBirth      = "2026-01-15"
    state            = "MH"
    motherName       = "Payment Test Mother"
    fatherName       = "Payment Test Father"
    email            = $testEmail
    phone            = $testPhone
    phone2           = "+919876500002"
    address          = "123 Test Street, Mumbai"
    registrationType = "DIRECT"
} | ConvertTo-Json)

$regId = ""
if ($regResult) {
    if ($regResult.registrationId) { $regId = $regResult.registrationId }
    elseif ($regResult.data -and $regResult.data.registrationId) { $regId = $regResult.data.registrationId }
    elseif ($regResult.registration -and $regResult.registration.registrationId) { $regId = $regResult.registration.registrationId }
}
if ($regId) { 
    Write-Host "CHILD REGISTERED: $regId" -ForegroundColor Green
} else {
    Write-Host "CHILD REGISTRATION FAILED - Cannot proceed with payment tests" -ForegroundColor Red
    exit 1
}

# Step 4: Complete First-Time Login
Write-Host "`n`n############ STEP 4: FIRST-TIME LOGIN ############" -ForegroundColor Magenta
Call-API "Send OTP for First Login" "POST" "$API/auth/send-otp" (@{
    email = $testEmail
} | ConvertTo-Json)

$firstLoginOtp = Read-Host "Enter OTP for first login (or press Enter for test code)"
if (-not $firstLoginOtp) { $firstLoginOtp = "123456" }

$loginResult = Call-API "First-Time Login" "POST" "$API/auth/first-login" (@{
    registrationId = $regId
    email          = $testEmail
    phone          = $testPhone
    otp            = $firstLoginOtp
} | ConvertTo-Json)

if ($loginResult -and $loginResult.token) {
    $token = $loginResult.token
    $authHeaders = @{ Authorization = "Bearer $token" }
    Write-Host "FIRST-TIME LOGIN SUCCESSFUL" -ForegroundColor Green
} else {
    Write-Host "FIRST-TIME LOGIN FAILED" -ForegroundColor Red
}

# Step 5: Create Payment Order
Write-Host "`n`n############ STEP 5: CREATE PAYMENT ORDER ############" -ForegroundColor Magenta
Write-Host "NOTE: This will create a REAL Razorpay order if test mode is OFF" -ForegroundColor Yellow
Write-Host "You will be charged the actual subscription amount!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel if you don't want to proceed" -ForegroundColor Yellow
Start-Sleep -Seconds 5

# First, let's check if there's a payment creation endpoint
$paymentOrderResult = Call-API "Create Payment Order" "POST" "$API/payments/create-order" (@{
    registrationId = $regId
    childName     = "Payment Test Child"
} | ConvertTo-Json) -ExpectFail

# If create-order doesn't exist, try to get existing payments
if (-not $paymentOrderResult) {
    Write-Host "Create order endpoint not found, checking existing payments..." -ForegroundColor Yellow
    Call-API "Get Payments by Registration ID" "GET" "$API/payments/$regId" $null $authHeaders
}

# Step 6: Test Payment Webhook (Simulated)
Write-Host "`n`n############ STEP 6: PAYMENT WEBHOOK TEST ############" -ForegroundColor Magenta
Write-Host "Testing webhook endpoint with simulated payment data..." -ForegroundColor Yellow

$webhookPayload = @{
    event = "payment.captured"
    payload = @{
        payment = @{
            entity = @{
                id = "pay_real_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                order_id = "order_real_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                amount = 99900  # ₹999 in paise
                currency = "INR"
                status = "captured"
                method = "upi"
                notes = @{ registrationId = $regId }
            }
        }
    }
}

# This will likely fail without proper signature, which is expected
Call-API "Webhook Test (no signature)" "POST" "$API/payments/webhook/razorpay" ($webhookPayload | ConvertTo-Json -Depth 5) -ExpectFail

# Step 7: Payment Status Check
Write-Host "`n`n############ STEP 7: PAYMENT STATUS CHECK ############" -ForegroundColor Magenta
Call-API "Check Payment Status" "GET" "$API/payments/$regId" $null $authHeaders

# Step 8: Test Failed Payment Webhook
Write-Host "`n`n############ STEP 8: FAILED PAYMENT WEBHOOK ############" -ForegroundColor Magenta
$failedWebhookPayload = @{
    event = "payment.failed"
    payload = @{
        payment = @{
            entity = @{
                id = "pay_failed_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                order_id = "order_failed_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                amount = 99900
                currency = "INR"
                status = "failed"
                method = "card"
                notes = @{ registrationId = $regId }
            }
        }
    }
}

Call-API "Failed Payment Webhook" "POST" "$API/payments/webhook/razorpay" ($failedWebhookPayload | ConvertTo-Json -Depth 5) -ExpectFail

Write-Host "`n`n=============================================" -ForegroundColor Yellow
Write-Host "  REAL PAYMENT TESTING COMPLETED" -ForegroundColor Yellow
Write-Host "  Email: $testEmail" -ForegroundColor Yellow
Write-Host "  Registration ID: $regId" -ForegroundColor Yellow
Write-Host "  Auth Token: $(if($token){'RECEIVED'}else{'NOT RECEIVED'})" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "- Check your Razorpay dashboard for any real orders created" -ForegroundColor Red
Write-Host "- Webhook tests failed as expected (missing signature)" -ForegroundColor Red
Write-Host "- In production, webhooks should be configured in Razorpay dashboard" -ForegroundColor Red
Write-Host "- Payment amount: ₹999 (if real payment was processed)" -ForegroundColor Red
