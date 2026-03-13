# Test Profile Fix Script
$API = "http://localhost:3000"
$CT = "application/json"
$timestamp = Get-Date -Format "HHmmss"
$testEmail = "profiletest_${timestamp}@test.com"
$testPhone = "+919876${timestamp}"

Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  PROFILE FIX TESTING - WombTo18 API" -ForegroundColor Yellow
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
    fullName = "Profile Test User"
    email    = $testEmail
    phone    = $testPhone
} | ConvertTo-Json)

# Step 2: Send and Verify OTP
Write-Host "`n`n############ STEP 2: AUTHENTICATION ############" -ForegroundColor Magenta
Call-API "Send OTP" "POST" "$API/auth/send-otp" (@{
    email = $testEmail
} | ConvertTo-Json)

$authResult = Call-API "Verify OTP" "POST" "$API/auth/verify-otp" (@{
    email = $testEmail
    otp   = "123456"
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
    Write-Host "AUTH FAILED" -ForegroundColor Red
    exit 1
}

# Step 3: Test Profile Update
Write-Host "`n`n############ STEP 3: PROFILE UPDATE TEST ############" -ForegroundColor Magenta

# Test 1: Update profile with valid data
Call-API "Update Profile (Valid)" "POST" "$API/auth/update-profile" (@{
    fullName = "Updated Test User"
    profilePictureUrl = "https://example.com/test-avatar.jpg"
} | ConvertTo-Json) $authHeaders

# Test 2: Test Cloudinary signature endpoint
Call-API "Get Cloudinary Signature" "GET" "$API/auth/cloudinary-signature" $null $authHeaders

# Step 4: Get Profile to verify updates
Write-Host "`n`n############ STEP 4: VERIFY PROFILE UPDATES ############" -ForegroundColor Magenta
Call-API "Get Updated Profile" "GET" "$API/auth/profile" $null $authHeaders

Write-Host "`n`n=============================================" -ForegroundColor Yellow
Write-Host "  PROFILE FIX TESTING COMPLETED" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  Frontend URL: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend URL:  http://localhost:3000" -ForegroundColor White
Write-Host "  Test Email:   $testEmail" -ForegroundColor White
Write-Host "  Auth Token:   $(if($token){'RECEIVED'}else{'NOT RECEIVED'})" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "TEST INSTRUCTIONS:" -ForegroundColor Green
Write-Host "1. Open http://localhost:5173 in your browser" -ForegroundColor Green
Write-Host "2. Login with: $testEmail" -ForegroundColor Green
Write-Host "3. Use OTP: 123456" -ForegroundColor Green
Write-Host "4. Go to Profile/Edit Profile page" -ForegroundColor Green
Write-Host "5. Test image upload and profile update" -ForegroundColor Green
Write-Host "6. Verify only ONE message shows at a time" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow
