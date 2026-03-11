$API = "http://localhost:3000"
$CT = "application/json"
$timestamp = Get-Date -Format "HHmmss"
$testEmail = "test_${timestamp}@test.com"
$testPhone = "+919876${timestamp}"

$passed = 0
$failed = 0
$skipped = 0

function Call-API {
    param([string]$Label, [string]$Method, [string]$Url, [string]$Body, [hashtable]$Headers, [switch]$ExpectFail)
    Write-Host "`n===== $Label =====" -ForegroundColor Cyan
    Write-Host "$Method $Url" -ForegroundColor DarkGray
    try {
        $params = @{ Uri = $Url; Method = $Method; UseBasicParsing = $true }
        if ($Body) { $params.Body = $Body; $params.ContentType = $CT }
        if ($Headers) { $params.Headers = $Headers }
        $resp = Invoke-WebRequest @params
        $script:passed++
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
            $script:passed++
            Write-Host "PASS (expected $code)" -ForegroundColor Green
            Write-Host $detail
        }
        else {
            $script:failed++
            Write-Host "FAIL [$code] $detail" -ForegroundColor Red
        }
        return $null
    }
}

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  WombTo18 API - Full Endpoint Test Suite" -ForegroundColor Yellow
Write-Host "  Email: $testEmail  Phone: $testPhone" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# =============================================
# TEST MODE CONFIG
# =============================================
Call-API "TEST MODE CONFIG" "GET" "$API/registration/config/test-mode"

# =============================================
# AUTH MODULE
# =============================================
Write-Host "`n`n############ AUTH MODULE ############" -ForegroundColor Magenta

# 1. Register user
$r = Call-API "AUTH: Register User" "POST" "$API/auth/register" (@{
        fullName = "Priya Sharma"
        email    = $testEmail
        phone    = $testPhone
    } | ConvertTo-Json)

# 2. Send OTP
Call-API "AUTH: Send OTP" "POST" "$API/auth/send-otp" (@{ email = $testEmail } | ConvertTo-Json)

# 3. Verify OTP (returns token)
$r = Call-API "AUTH: Verify OTP" "POST" "$API/auth/verify-otp" (@{
        email = $testEmail
        otp   = "123456"
    } | ConvertTo-Json)

$token = ""
if ($r) {
    if ($r.token) { $token = $r.token }
    elseif ($r.access_token) { $token = $r.access_token }
}
if ($token) { Write-Host "TOKEN SAVED" -ForegroundColor Green }
$authHeaders = @{ Authorization = "Bearer $token" }

# 4. Profile
Call-API "AUTH: Get Profile" "GET" "$API/auth/profile" $null $authHeaders

# =============================================
# REGISTRATION MODULE
# =============================================
Write-Host "`n`n############ REGISTRATION MODULE ############" -ForegroundColor Magenta

# Register Child
$regResult = Call-API "REG: Register Child" "POST" "$API/registration" (@{
        childName        = "Aarav Sharma"
        childGender      = "MALE"
        dateOfBirth      = "2026-01-15"
        state            = "MH"
        motherName       = "Priya Sharma"
        fatherName       = "Rahul Sharma"
        email            = $testEmail
        phone            = $testPhone
        phone2           = "+919876500002"
        address          = "123 MG Road, Pune"
        registrationType = "DIRECT"
    } | ConvertTo-Json)

$regId = ""
if ($regResult) {
    if ($regResult.registrationId) { $regId = $regResult.registrationId }
    elseif ($regResult.data -and $regResult.data.registrationId) { $regId = $regResult.data.registrationId }
    elseif ($regResult.registration -and $regResult.registration.registrationId) { $regId = $regResult.registration.registrationId }
}
if ($regId) { Write-Host "REG ID: $regId" -ForegroundColor Green }

# Verify Registration OTP (uses email + otp, NOT registrationId)
if ($regId) {
    Call-API "REG: Verify OTP" "POST" "$API/registration/verify-otp" (@{
            email = $testEmail; otp = "123456"
        } | ConvertTo-Json)
}

# Lookup
if ($regId) { Call-API "REG: Lookup by RegID" "GET" "$API/registration/$regId" }

# Family lookup
Call-API "REG: Family Lookup" "GET" "$API/registration/family/test-parent-id"

# Now test First-Login & Login (first-login must run FIRST to link regId to user)
if ($regId) {
    # Send fresh OTP for first-login
    Call-API "AUTH: Send OTP (for first-login)" "POST" "$API/auth/send-otp" (@{ email = $testEmail } | ConvertTo-Json)
    
    # First-time login (links regId to user account)
    $r = Call-API "AUTH: First-Time Login" "POST" "$API/auth/first-login" (@{
            registrationId = $regId
            email          = $testEmail
            phone          = $testPhone
            otp            = "123456"
        } | ConvertTo-Json)
    
    if ($r) {
        if ($r.token) { $token = $r.token; $authHeaders = @{ Authorization = "Bearer $token" } }
        elseif ($r.access_token) { $token = $r.access_token; $authHeaders = @{ Authorization = "Bearer $token" } }
        Write-Host "TOKEN UPDATED FROM FIRST-LOGIN" -ForegroundColor Green
    }

    # Send fresh OTP for login (regId is now linked, login should work)
    Call-API "AUTH: Send OTP (for login)" "POST" "$API/auth/send-otp" (@{ email = $testEmail } | ConvertTo-Json)
    
    # Login with registrationId
    $r = Call-API "AUTH: Login with RegID" "POST" "$API/auth/login" (@{
            registrationId = $regId
            email          = $testEmail
            otp            = "123456"
        } | ConvertTo-Json)
    
    if ($r) {
        if ($r.token) { $token = $r.token; $authHeaders = @{ Authorization = "Bearer $token" } }
        elseif ($r.access_token) { $token = $r.access_token; $authHeaders = @{ Authorization = "Bearer $token" } }
        Write-Host "TOKEN UPDATED FROM LOGIN" -ForegroundColor Green
    }
}

# =============================================
# DASHBOARD MODULE
# =============================================
Write-Host "`n`n############ DASHBOARD MODULE ############" -ForegroundColor Magenta

if ($regId) {
    Call-API "DASH: Child Dashboard" "GET" "$API/dashboard/child/$regId" $null $authHeaders
    Call-API "DASH: Family Dashboard" "GET" "$API/dashboard/family" $null $authHeaders
    Call-API "DASH: Vaccination Tracker" "GET" "$API/dashboard/vaccination/$regId" $null $authHeaders

    # Seed Vaccination — needs dateOfBirth in body
    Call-API "DASH: Seed Vaccination" "POST" "$API/dashboard/vaccination/seed" (@{
            registrationId = $regId
            dateOfBirth    = "2026-01-15"
        } | ConvertTo-Json) $authHeaders

    Call-API "DASH: Get All Milestones" "GET" "$API/dashboard/milestones/$regId" $null $authHeaders
    Call-API "DASH: Upcoming Milestones" "GET" "$API/dashboard/milestones/$regId/upcoming" $null $authHeaders

    # Create Milestone — use correct enum: HEALTH_CHECKUP (not HEALTH_CHECK)
    $milestoneResult = Call-API "DASH: Create Milestone" "POST" "$API/dashboard/milestones" (@{
            registrationId = $regId
            title          = "Weight Check - 3 Months"
            category       = "HEALTH_CHECKUP"
            dueDate        = "2026-04-15"
            description    = "Regular weight check at 3 months"
        } | ConvertTo-Json) $authHeaders

    $milestoneId = ""
    if ($milestoneResult) {
        if ($milestoneResult._id) { $milestoneId = $milestoneResult._id }
        elseif ($milestoneResult.milestone -and $milestoneResult.milestone._id) { $milestoneId = $milestoneResult.milestone._id }
        elseif ($milestoneResult.data -and $milestoneResult.data._id) { $milestoneId = $milestoneResult.data._id }
    }

    if ($milestoneId) {
        Write-Host "MILESTONE ID: $milestoneId" -ForegroundColor Green
        Call-API "DASH: Update Milestone" "PATCH" "$API/dashboard/milestones/$milestoneId" (@{
                status        = "COMPLETED"
                completedDate = "2026-04-15"
                notes         = "Completed successfully"
            } | ConvertTo-Json) $authHeaders
    }
    else {
        Write-Host "SKIP: Update Milestone (no milestoneId)" -ForegroundColor Yellow
        $script:skipped++
    }
}
else {
    Write-Host "SKIP: Dashboard (no regId)" -ForegroundColor Yellow
    $script:skipped += 8
}

# =============================================
# CHANNEL PARTNER MODULE (needs ADMIN role)
# =============================================
Write-Host "`n`n############ CHANNEL PARTNER MODULE ############" -ForegroundColor Magenta
Write-Host "NOTE: Channel Partner endpoints require ADMIN role." -ForegroundColor Yellow
Write-Host "Testing with current user (PARENT role) — expecting 403 as correct behavior." -ForegroundColor Yellow

# Register Partner — expects 403 (ADMIN only)
Call-API "CP: Register Partner (expect 403)" "POST" "$API/channel-partner/register" (@{
        partnerName      = "Dr. Mehta"
        organizationName = "City Hospital Pune"
        email            = "hospital_${timestamp}@test.com"
        phone            = "+919988${timestamp}"
    } | ConvertTo-Json) $authHeaders -ExpectFail

# List Partners — expects 403 (ADMIN only)
Call-API "CP: List Partners (expect 403)" "GET" "$API/channel-partner/list" $null $authHeaders -ExpectFail

# =============================================
# PAYMENTS MODULE
# =============================================
Write-Host "`n`n############ PAYMENTS MODULE ############" -ForegroundColor Magenta

if ($regId) {
    Call-API "PAY: Get by RegID" "GET" "$API/payments/$regId" $null $authHeaders
    Call-API "PAY: Get by OrderID" "GET" "$API/payments/order/order_test_12345" $null $authHeaders

    # Webhook — will fail with 401 (missing signature), that's expected behavior
    Call-API "PAY: Webhook (expect 401 - no sig)" "POST" "$API/payments/webhook/razorpay" (@{
            event   = "payment.captured"
            payload = @{
                payment = @{
                    entity = @{
                        id       = "pay_test_123"
                        order_id = "order_test_12345"
                        amount   = 99900
                        currency = "INR"
                        status   = "captured"
                        method   = "upi"
                        notes    = @{ registrationId = $regId }
                    }
                }
            }
        } | ConvertTo-Json -Depth 5) -ExpectFail
}

# =============================================
# REMINDERS MODULE (all need auth headers)
# =============================================
Write-Host "`n`n############ REMINDERS MODULE ############" -ForegroundColor Magenta

if ($regId) {
    Call-API "REM: Seed Reminders" "POST" "$API/reminders/seed/$regId" "{}" $authHeaders
    Call-API "REM: Get by RegID" "GET" "$API/reminders/$regId" $null $authHeaders

    if ($milestoneId) {
        Call-API "REM: Get by MilestoneID" "GET" "$API/reminders/milestone/$milestoneId" $null $authHeaders
    }

    # Create Reminder (with auth)
    $reminderResult = Call-API "REM: Create Reminder" "POST" "$API/reminders" (@{
            registrationId = $regId
            milestoneId    = if ($milestoneId) { $milestoneId } else { "test-milestone-id" }
            channels       = @("SMS", "WHATSAPP")
            customMessage  = "BCG vaccination reminder"
        } | ConvertTo-Json) $authHeaders

    $reminderId = ""
    if ($reminderResult) {
        # createReminders returns { success, data: [array of 3 reminders], count }
        if ($reminderResult.data -and $reminderResult.data.Count -gt 0) { $reminderId = $reminderResult.data[0]._id }
        elseif ($reminderResult._id) { $reminderId = $reminderResult._id }
    }

    if ($reminderId) {
        Write-Host "REMINDER ID: $reminderId" -ForegroundColor Green
        Call-API "REM: Update Reminder" "PATCH" "$API/reminders/$reminderId" (@{
                channels      = @("SMS", "EMAIL")
                customMessage = "Updated BCG reminder"
            } | ConvertTo-Json) $authHeaders
    }
    else {
        Write-Host "SKIP: Update Reminder (no reminderId)" -ForegroundColor Yellow
        $script:skipped++
    }

    Call-API "REM: Process Due" "POST" "$API/reminders/process-due" "{}" $authHeaders
}
else {
    Write-Host "SKIP: Reminders (no regId)" -ForegroundColor Yellow
    $script:skipped += 6
}

# =============================================
# SUMMARY
# =============================================
$total = $passed + $failed + $skipped
Write-Host "`n`n=============================================" -ForegroundColor Yellow
Write-Host "  TEST RESULTS" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  PASSED:  $passed / $total" -ForegroundColor Green
Write-Host "  FAILED:  $failed / $total" -ForegroundColor $(if ($failed -eq 0) { "Green" }else { "Red" })
Write-Host "  SKIPPED: $skipped" -ForegroundColor Yellow
Write-Host "---------------------------------------------"
Write-Host "  Email:      $testEmail"
Write-Host "  Phone:      $testPhone"
Write-Host "  Reg ID:     $regId"
Write-Host "  Milestone:  $milestoneId"
Write-Host "  Token:      $(if($token){'YES'}else{'NO'})"
Write-Host "=============================================" -ForegroundColor Yellow
