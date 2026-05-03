Write-Host "`n--- Testing MongoDB Connection ---"
$body1 = @{
    db_type = "mongodb"
    url = "mongodb+srv://ubid_reader:demo123@cluster0.karnataka.net/biz_registry"
    system_label = "ShopEstablishment"
    environment = "production"
} | ConvertTo-Json
try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/connect" -Method Post -Body $body1 -ContentType "application/json"
    $response1 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $_.ErrorDetails.Message
}

Write-Host "`n`n--- Testing PostgreSQL Connection ---"
$body2 = @{
    db_type = "postgresql"
    url = "postgresql://postgres:pass123@localhost:5432/factories_db"
    system_label = "FactoriesAct"
    environment = "staging"
} | ConvertTo-Json
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/connect" -Method Post -Body $body2 -ContentType "application/json"
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $_.ErrorDetails.Message
}

Write-Host "`n`n--- Testing MySQL Connection ---"
$body3 = @{
    db_type = "mysql"
    url = "mysql://root:root@127.0.0.1:3306/labour_registry"
    system_label = "LabourDept"
    environment = "development"
} | ConvertTo-Json
try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/connect" -Method Post -Body $body3 -ContentType "application/json"
    $response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $_.ErrorDetails.Message
}

Write-Host "`n`n--- Testing Invalid URL Format ---"
$body4 = @{
    db_type = "postgresql"
    url = "mysql://wrong-protocol.com/db"
    system_label = "Custom"
    environment = "development"
} | ConvertTo-Json
try {
    $response4 = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/connect" -Method Post -Body $body4 -ContentType "application/json"
    $response4 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected Validation Error Details:"
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
