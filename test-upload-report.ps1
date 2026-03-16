# Test script to upload a report via API
Write-Host "Testing report upload..." -ForegroundColor Green

# Create a simple test PDF content
$pdfContent = @"
%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT/F1 12 Tf 72 720 Td(Test Monthly Report - March 2026)Tj ET
endstream endobj
xref 0 5 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n 0000000206 00000 n 
trailer<</Size 5/Root 1 0 R>>startxref 299 %%EOF
"@

# Save to file
$pdfContent | Out-File -FilePath "monthly-report-march.pdf" -Encoding ASCII

Write-Host "Created test PDF file" -ForegroundColor Yellow
Write-Host "File size: $((Get-Item 'monthly-report-march.pdf').Length) bytes" -ForegroundColor Cyan

Write-Host "Upload this file manually through the admin interface to test search functionality" -ForegroundColor Green