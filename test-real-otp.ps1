# Real OTP Testing Script
$API = "http://localhost:3000"
$CT = "application/json"
$timestamp = Get-Date -Format "HHmmss"
$testEmail = "realotp_${timestamp}@test.com"
$testPhone = "+919876${timestamp}"

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  REAL OTP TESTING - WombTo18 API" -ForegroundColor Yellow
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
    fullName = "Test User Real OTP"
    email    = $testEmail
    phone    = $testPhone
} | ConvertTo-Json)

# Step 2: Send OTP (Real Mode)
Write-Host "`n`n############ STEP 2: SEND REAL OTP ############" -ForegroundColor Magenta
Write-Host "NOTE: This will send a real OTP to the email address." -ForegroundColor Yellow
Write-Host "Check your email for the OTP code." -ForegroundColor Yellow
$sendOtpResult = Call-API "Send Real OTP" "POST" "$API/auth/send-otp" (@{
    email = $testEmail
} | ConvertTo-Json)

# Step 3: Prompt for OTP
Write-Host "`n`n############ STEP 3: ENTER OTP ############" -ForegroundColor Magenta
$otp = Read-Host "Enter the OTP received in your email"
if (-not $otp) {
    Write-Host "No OTP entered. Using test code '123456' (may not work in real mode)" -ForegroundColor Yellow
    $otp = "123456"
}

# Step 4: Verify OTP
Write-Host "`n`n############ STEP 4: VERIFY OTP ############" -ForegroundColor Magenta
$verifyResult = Call-API "Verify OTP" "POST" "$API/auth/verify-otp" (@{
    email = $testEmail
    otp   = $otp
} | ConvertTo-Json)

$token = ""
if ($verifyResult) {
    if ($verifyResult.token) { $token = $verifyResult.token }
    elseif ($verifyResult.access_token) { $token = $verifyResult.access_token }
}
if ($token) { 
    Write-Host "TOKEN RECEIVED: Length $($token.Length)" -ForegroundColor Green
    $authHeaders = @{ Authorization = "Bearer $token" }
} else {
    Write-Host "NO TOKEN RECEIVED" -ForegroundColor Red
    exit 1
}

# Step 5: Get Profile
Write-Host "`n`n############ STEP 5: GET PROFILE ############" -ForegroundColor Magenta
Call-API "Get User Profile" "GET" "$API/auth/profile" $null $authHeaders

# Step 6: Test OTP Resend
Write-Host "`n`n############ STEP 6: RESEND OTP ############" -ForegroundColor Magenta
Write-Host "Testing OTP resend functionality..." -ForegroundColor Yellow
Call-API "Resend OTP" "POST" "$API/auth/send-otp" (@{
    email = $testEmail
} | ConvertTo-Json)

# Step 7: Test Invalid OTP
Write-Host "`n`n############ STEP 7: INVALID OTP TEST ############" -ForegroundColor Magenta
Call-API "Invalid OTP Test" "POST" "$API/auth/verify-otp" (@{
    email = $testEmail
    otp   = "999999"
} | ConvertTo-Json) -ExpectFail

# Step 8: Test Expired OTP Scenario
Write-Host "`n`n############ STEP 8: EXPIRED OTP TEST ############" -ForegroundColor Magenta
Write-Host "Waiting 6 minutes to test expired OTP..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to skip this test" -ForegroundColor Yellow
Start-Sleep -Seconds 360

Call-API "Expired OTP Test" "POST" "$API/auth/verify-otp" (@{
    email = $testEmail
    otp   = $otp
} | ConvertTo-Json) -ExpectFail

Write-Host "`n`n=============================================" -ForegroundColor Yellow
Write-Host "  REAL OTP TESTING COMPLETED" -ForegroundColor Yellow
Write-Host "  Email: $testEmail" -ForegroundColor Yellow
Write-Host "  Token: $(if($token){'RECEIVED'}else{'NOT RECEIVED'})" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
