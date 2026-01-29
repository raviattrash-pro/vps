$ErrorActionPreference = "Stop"
try {
    Write-Host "1. Attempting Login..."
    $body = @{ admissionNo = "admin"; password = "admin123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    if ($loginRes.token) {
        Write-Host "✅ Login Successful. Token received."
        $token = $loginRes.token
        
        Write-Host "2. Fetching Students..."
        $students = Invoke-RestMethod -Uri "http://localhost:8080/api/students" -Method Get -Headers @{ Authorization = "Bearer $token" }
        
        Write-Host "✅ Students HTTP Request Valid."
        Write-Host "Count: $($students.Count)"
        
        if ($students.Count -gt 0) {
            $students | Format-Table id, name, role, className, section
        } else {
            Write-Host "⚠️  No students found in response."
        }
    } else {
        Write-Host "❌ Login failed. No token in response."
        Write-Host $loginRes
    }
} catch {
    Write-Host "❌ Error occurred:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
