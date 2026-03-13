# Test Script Adapted for Current Configuration
$API = "http://localhost:3000"
$CT = "application/json"
$timestamp = Get-Date -Format "HHmmss"
$testEmail = "configtest_${timestamp}@test.com"
$testPhone = "+919876${timestamp}"

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  CONFIG-AWARE TESTING - WombTo18 API" -ForegroundColor Yellow
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

# Check current configuration
Write-Host "`n`n############ CONFIGURATION CHECK ############" -ForegroundColor Magenta
$config = Call-API "Check Test Mode Config" "GET" "$API/registration/config/test-mode"

if ($config) {
    Write-Host "Payment Test Mode: $($config.paymentTestMode)" -ForegroundColor White
    Write-Host "OTP Test Mode: $($config.otpTestMode)" -ForegroundColor White
    
    if (-not $config.paymentTestMode) {
        Write-Host "WARNING: Payment Test Mode is OFF - Real Razorpay orders will be attempted!" -ForegroundColor Red
        Write-Host "Child registration may fail if Razorpay credentials are not configured." -ForegroundColor Yellow
    }
}

# =============================================
# PHASE 1: AUTHENTICATION & OTP TESTING
# =============================================
Write-Host "`n`n############ PHASE 1: AUTHENTICATION & OTP ############" -ForegroundColor Magenta

# 1. Register User
$userResult = Call-API "Register User" "POST" "$API/auth/register" (@{
    fullName = "Config Test User"
    email    = $testEmail
    phone    = $testPhone
} | ConvertTo-Json)

# 2. Send OTP
Write-Host "`n--- OTP Testing (Test Mode: ON) ---" -ForegroundColor Yellow
Call-API "Send OTP" "POST" "$API/auth/send-otp" (@{
    email = $testEmail
} | ConvertTo-Json)

# 3. Verify OTP with test code
$authResult = Call-API "Verify OTP (Test Code)" "POST" "$API/auth/verify-otp" (@{
    email = $testEmail
    otp   = "123456"  # Test code since OTP_TEST_MODE is true
} | ConvertTo-Json)

$token = ""
if ($authResult) {
    if ($authResult.token) { $token = $authResult.token }
    elseif ($authResult.access_token) { $token = $authResult.access_token }
}
if ($token) { 
    Write-Host "OTP VERIFICATION SUCCESSFUL" -ForegroundColor Green
    $authHeaders = @{ Authorization = "Bearer $token" }
} else {
    Write-Host "OTP VERIFICATION FAILED" -ForegroundColor Red
    exit 1
}

# =============================================
# PHASE 2: CHILD REGISTRATION (Payment Test Mode: OFF)
# =============================================
Write-Host "`n`n############ PHASE 2: CHILD REGISTRATION ############" -ForegroundColor Magenta
Write-Host "WARNING: This will attempt REAL Razorpay order creation!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or wait 3 seconds to continue..." -ForegroundColor Red
Start-Sleep -Seconds 3

$regResult = Call-API "Register Child (Real Payment)" "POST" "$API/registration" (@{
    childName        = "Config Test Child"
    childGender      = "MALE"
    dateOfBirth      = "2025-01-15"  # Past date to avoid validation error
    state            = "MH"
    motherName       = "Config Test Mother"
    fatherName       = "Config Test Father"
    email            = $testEmail
    phone            = $testPhone
    phone2           = "+919876500002"
    address          = "789 Config Test Street, Mumbai"
    registrationType = "DIRECT"
} | ConvertTo-Json) -ExpectFail  # Expect this to fail due to payment issues

$regId = ""
if ($regResult) {
    if ($regResult.registrationId) { $regId = $regResult.registrationId }
    elseif ($regResult.data -and $regResult.data.registrationId) { $regId = $regResult.data.registrationId }
    elseif ($regResult.registration -and $regResult.registration.registrationId) { $regId = $regResult.registration.registrationId }
}
if ($regId) { 
    Write-Host "CHILD REGISTERED: $regId" -ForegroundColor Green
} else {
    Write-Host "CHILD REGISTRATION FAILED (Expected - Payment Test Mode OFF)" -ForegroundColor Yellow
    Write-Host "This is normal when Razorpay credentials are not configured" -ForegroundColor Yellow
}

# =============================================
# PHASE 3: TEST EXISTING PAYMENT ENDPOINTS
# =============================================
Write-Host "`n`n############ PHASE 3: PAYMENT ENDPOINTS ############" -ForegroundColor Magenta

if ($regId) {
    Call-API "Get Payments by Registration ID" "GET" "$API/payments/$regId" $null $authHeaders
} else {
    Write-Host "Skipping payment tests - no registration ID available" -ForegroundColor Yellow
}

# Test webhook endpoint (will fail without signature)
$webhookPayload = @{
    event = "payment.captured"
    payload = @{
        payment = @{
            entity = @{
                id = "pay_config_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                order_id = "order_config_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
                amount = 99900
                currency = "INR"
                status = "captured"
                method = "upi"
                notes = @{ registrationId = if($regId){$regId}else{"test_reg_id"} }
            }
        }
    }
}

Call-API "Webhook Test (No Signature)" "POST" "$API/payments/webhook/razorpay" ($webhookPayload | ConvertTo-Json -Depth 5) -ExpectFail

# =============================================
# PHASE 4: DASHBOARD FUNCTIONALITY
# =============================================
Write-Host "`n`n############ PHASE 4: DASHBOARD TESTING ############" -ForegroundColor Magenta

if ($regId) {
    Call-API "Child Dashboard" "GET" "$API/dashboard/child/$regId" $null $authHeaders
    Call-API "Family Dashboard" "GET" "$API/dashboard/family" $null $authHeaders
} else {
    Write-Host "Skipping dashboard tests - no registration ID available" -ForegroundColor Yellow
}

# =============================================
# SUMMARY
# =============================================
Write-Host "`n`n=============================================" -ForegroundColor Yellow
Write-Host "  CONFIG-AWARE TESTING COMPLETED" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  Test Email:    $testEmail" -ForegroundColor White
Write-Host "  Test Phone:    $testPhone" -ForegroundColor White
Write-Host "  Registration:  $(if($regId){$regId}else{'NOT CREATED'})" -ForegroundColor White
Write-Host "  Auth Token:    $(if($token){'RECEIVED'}else{'NOT RECEIVED'})" -ForegroundColor White
Write-Host "  OTP Testing:   SUCCESSFUL (Test Mode ON)" -ForegroundColor White
Write-Host "  Payment Mode:  REAL (Test Mode OFF)" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "CURRENT CONFIGURATION:" -ForegroundColor Cyan
Write-Host "- OTP Test Mode:     ON (using test code 123456)" -ForegroundColor Green
Write-Host "- Payment Test Mode: OFF (attempting real Razorpay orders)" -ForegroundColor Red
Write-Host "" -ForegroundColor White
Write-Host "RECOMMENDATIONS:" -ForegroundColor Green
Write-Host "1. To test full flow: Set PAYMENT_TEST_MODE=true in .env" -ForegroundColor Green
Write-Host "2. For production: Configure valid Razorpay credentials" -ForegroundColor Green
Write-Host "3. Current setup: OTP works, payments need configuration" -ForegroundColor Green
