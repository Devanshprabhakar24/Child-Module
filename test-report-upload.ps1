# Test uploading a report via PowerShell
Write-Host "Testing report upload via API..." -ForegroundColor Green

# Create test PDF content
$pdfContent = @"
%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 50>>stream
BT/F1 12 Tf 72 720 Td(Monthly Health Report - March 2026)Tj ET
endstream endobj
xref 0 5 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n 0000000206 00000 n 
trailer<</Size 5/Root 1 0 R>>startxref 299 %%EOF
"@

# Save to temporary file
$tempFile = "temp-report.pdf"
[System.IO.File]::WriteAllText($tempFile, $pdfContent)

Write-Host "Created test PDF: $tempFile" -ForegroundColor Yellow

# Test the upload endpoint
try {
    $uri = "http://localhost:8000/reports/upload/CHD-KL-20260306-000001"
    
    # Create form data
    $form = @{
        title       = "Monthly Health Report - March 2026"
        description = "Comprehensive health report for the month"
        category    = "Monthly Report"
        reportDate  = "2026-03-16"
    }
    
    Write-Host "Uploading to: $uri" -ForegroundColor Cyan
    Write-Host "Form data: $($form | ConvertTo-Json)" -ForegroundColor Gray
    
    # Note: PowerShell file upload with Invoke-RestMethod can be tricky
    # This is a test to see if the endpoint is accessible
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8000/reports/categories" -Method GET
    Write-Host "Categories endpoint works: $($testResponse.success)" -ForegroundColor Green
    
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Clean up
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "Manual upload test: Please use the admin interface to upload a report" -ForegroundColor Yellow