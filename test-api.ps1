# ACL End-to-End API Test Script
# Tests all major workflows against running backend at http://localhost:4000

$baseUrl = "http://localhost:4000/api/v1"
$results = @()

function Assert-Equals($expected, $actual, $testName) {
    if ($expected -eq $actual) {
        Write-Host "PASS: $testName" -ForegroundColor Green
        $results += [PSCustomObject]@{ Test = $testName; Status = "PASS"; Details = "Expected: $expected, Actual: $actual" }
    } else {
        Write-Host "FAIL: $testName - Expected: $expected, Actual: $actual" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = $testName; Status = "FAIL"; Details = "Expected: $expected, Actual: $actual" }
    }
}

function Assert-NotNull($value, $testName) {
    if ($null -ne $value) {
        Write-Host "PASS: $testName" -ForegroundColor Green
        $results += [PSCustomObject]@{ Test = $testName; Status = "PASS"; Details = "Value is not null" }
    } else {
        Write-Host "FAIL: $testName - Value is null" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = $testName; Status = "FAIL"; Details = "Value is null" }
    }
}

function Assert-True($condition, $testName) {
    if ($condition) {
        Write-Host "PASS: $testName" -ForegroundColor Green
        $results += [PSCustomObject]@{ Test = $testName; Status = "PASS"; Details = "Condition is true" }
    } else {
        Write-Host "FAIL: $testName - Condition is false" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = $testName; Status = "FAIL"; Details = "Condition is false" }
    }
}

function Invoke-Api($method, $uri, $headers, $body) {
    $params = @{
        Uri = $uri
        Method = $method
        Headers = $headers
        ContentType = "application/json"
    }
    if ($body) {
        $params.Body = $body | ConvertTo-Json -Depth 10
    }
    try {
        return Invoke-RestMethod @params
    } catch {
        return $_.Exception
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ACL END-TO-END API TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# 1. HEALTH CHECK
# ============================================
Write-Host "`n--- HEALTH CHECK ---" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method GET
    Assert-Equals "healthy" $health.status "Health endpoint returns healthy"
    Assert-Equals $true $health.success "Health endpoint success flag"
} catch {
    Write-Host "FAIL: Health check - $_" -ForegroundColor Red
    $results += [PSCustomObject]@{ Test = "Health Check"; Status = "FAIL"; Details = $_.Exception.Message }
}

# ============================================
# 2. AUTHENTICATION TESTS
# ============================================
Write-Host "`n--- AUTHENTICATION TESTS ---" -ForegroundColor Yellow

# Login with seed users
Write-Host "`n[TEST] Login with Seed Users" -ForegroundColor Cyan
$users = @{
    "superadmin@advenware.com" = "Dev@123456"
    "ops.admin@advenware.com" = "Dev@123456"
    "docs.admin@advenware.com" = "Dev@123456"
    "finance.admin@advenware.com" = "Dev@123456"
    "support.admin@advenware.com" = "Dev@123456"
    "agent1@advenware.com" = "Dev@123456"
    "student1@example.com" = "Dev@123456"
    "student2@example.com" = "Dev@123456"
}

$tokens = @{}
foreach ($email in $users.Keys) {
    $password = $users[$email]
    $loginBody = @{ email = $email; password = $password }
    $response = Invoke-Api "POST" "$baseUrl/auth/login" @{} $loginBody
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Login for $email - $($response.Exception.Message)" -ForegroundColor Red
    } else {
        $tokens[$email] = @{
            token = $response.data.accessToken
            userId = $response.data.user.id
            role = $response.data.user.role
        }
        Write-Host "  $email : $($response.data.user.role)" -ForegroundColor Gray
    }
}

if ($tokens["superadmin@advenware.com"]) {
    Assert-Equals "SUPER_ADMIN" $tokens["superadmin@advenware.com"].role "Super Admin login returns correct role"
}
if ($tokens["ops.admin@advenware.com"]) {
    Assert-Equals "PLACEMENT_ADMIN" $tokens["ops.admin@advenware.com"].role "Operations Admin login returns correct role"
}
if ($tokens["docs.admin@advenware.com"]) {
    Assert-Equals "DOCUMENT_ADMIN" $tokens["docs.admin@advenware.com"].role "Document Admin login returns correct role"
}
if ($tokens["finance.admin@advenware.com"]) {
    Assert-Equals "FINANCE" $tokens["finance.admin@advenware.com"].role "Finance Admin login returns correct role"
}
if ($tokens["support.admin@advenware.com"]) {
    Assert-Equals "SUPPORT" $tokens["support.admin@advenware.com"].role "Support Admin login returns correct role"
}
if ($tokens["agent1@advenware.com"]) {
    Assert-Equals "AGENT" $tokens["agent1@advenware.com"].role "Agent login returns correct role"
}
if ($tokens["student1@example.com"]) {
    Assert-Equals "STUDENT" $tokens["student1@example.com"].role "Student login returns correct role"
}

# Test invalid login
Write-Host "`n[TEST] Invalid Login" -ForegroundColor Cyan
$response = Invoke-Api "POST" "$baseUrl/auth/login" @{} @{ email = "invalid@test.com"; password = "wrongpass" }
if ($response -is [System.Management.Automation.ErrorRecord]) {
    if ($response.Exception.Response.StatusCode -eq 401) {
        Write-Host "PASS: Invalid login correctly rejected with 401" -ForegroundColor Green
        $results += [PSCustomObject]@{ Test = "Invalid Login Rejection"; Status = "PASS"; Details = "Correctly returned 401" }
    } else {
        Write-Host "FAIL: Invalid login returned unexpected status" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Invalid Login Rejection"; Status = "FAIL"; Details = $response.Exception.Message }
    }
} else {
    Write-Host "FAIL: Invalid login should have returned 401" -ForegroundColor Red
    $results += [PSCustomObject]@{ Test = "Invalid Login Rejection"; Status = "FAIL"; Details = "Should have returned 401" }
}

# Test protected route with token
if ($tokens["student1@example.com"]) {
    Write-Host "`n[TEST] Protected Route With Student Token" -ForegroundColor Cyan
    $headers = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    $response = Invoke-Api "GET" "$baseUrl/auth/me" $headers $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Protected route - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Protected Route With Token"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-Equals "student1@example.com" $response.data.user.email "Protected route returns correct user"
    }
}

# Test protected route without token
Write-Host "`n[TEST] Protected Route Without Token" -ForegroundColor Cyan
$response = Invoke-Api "GET" "$baseUrl/auth/me" @{} $null
if ($response -is [System.Management.Automation.ErrorRecord]) {
    if ($response.Exception.Response.StatusCode -eq 401) {
        Write-Host "PASS: Protected route correctly requires authentication" -ForegroundColor Green
        $results += [PSCustomObject]@{ Test = "Protected Route Without Token"; Status = "PASS"; Details = "Correctly returned 401" }
    } else {
        Write-Host "FAIL: Protected route returned unexpected status" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Protected Route Without Token"; Status = "FAIL"; Details = $response.Exception.Message }
    }
} else {
    Write-Host "FAIL: Protected route should require authentication" -ForegroundColor Red
    $results += [PSCustomObject]@{ Test = "Protected Route Without Token"; Status = "FAIL"; Details = "Should have returned 401" }
}

# Test token refresh
if ($tokens["student1@example.com"]) {
    Write-Host "`n[TEST] Token Refresh" -ForegroundColor Cyan
    $loginBody = @{ email = "student1@example.com"; password = "Dev@123456" }
    $loginResp = Invoke-Api "POST" "$baseUrl/auth/login" @{} $loginBody
    if ($loginResp -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Login for refresh token - $($loginResp.Exception.Message)" -ForegroundColor Red
    } else {
        $refreshToken = $loginResp.data.refreshToken
        $refreshBody = @{ refreshToken = $refreshToken }
        $response = Invoke-Api "POST" "$baseUrl/auth/refresh" @{} $refreshBody
        if ($response -is [System.Management.Automation.ErrorRecord]) {
            Write-Host "FAIL: Token refresh - $($response.Exception.Message)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Test = "Token Refresh"; Status = "FAIL"; Details = $response.Exception.Message }
        } else {
            Assert-NotNull $response.data.accessToken "Token refresh returns new access token"
        }
    }
}

# ============================================
# 3. ROLE-BASED ACCESS CONTROL
# ============================================
Write-Host "`n--- ROLE-BASED ACCESS CONTROL ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Blocked from Admin Endpoints" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/admin/dashboard" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        if ($response.Exception.Response.StatusCode -eq 403) {
            Write-Host "PASS: Student blocked from admin dashboard" -ForegroundColor Green
            $results += [PSCustomObject]@{ Test = "Student Admin Access"; Status = "PASS"; Details = "Correctly returned 403" }
        } else {
            Write-Host "FAIL: Unexpected status: $($response.Exception.Response.StatusCode)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Test = "Student Admin Access"; Status = "FAIL"; Details = $response.Exception.Message }
        }
    } else {
        Write-Host "FAIL: Student should not access admin dashboard" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Admin Access"; Status = "FAIL"; Details = "Student accessed admin endpoint" }
    }
}

if ($tokens["agent1@advenware.com"]) {
    $agentHeaders = @{ Authorization = "Bearer $($tokens["agent1@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Agent Blocked from Admin Endpoints" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/admin/dashboard" $agentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        if ($response.Exception.Response.StatusCode -eq 403) {
            Write-Host "PASS: Agent blocked from admin dashboard" -ForegroundColor Green
            $results += [PSCustomObject]@{ Test = "Agent Admin Access"; Status = "PASS"; Details = "Correctly returned 403" }
        } else {
            Write-Host "FAIL: Unexpected status: $($response.Exception.Response.StatusCode)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Test = "Agent Admin Access"; Status = "FAIL"; Details = $response.Exception.Message }
        }
    } else {
        Write-Host "FAIL: Agent should not access admin dashboard" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Agent Admin Access"; Status = "FAIL"; Details = "Agent accessed admin endpoint" }
    }
}

# ============================================
# 4. STUDENT APPLICATION WORKFLOW
# ============================================
Write-Host "`n--- STUDENT APPLICATION WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    # Get existing application
    Write-Host "`n[TEST] Get Existing Application" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/applications/me" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Get existing application - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Get Existing Application"; Status = "FAIL"; Details = $response.Exception.Message }
        $existingAppId = $null
    } else {
        Assert-NotNull $response.data.id "Student has existing application"
        Assert-True ($response.data.status -ne $null) "Application has status"
        $existingAppId = $response.data.id
        Write-Host "  Existing Application ID: $existingAppId, Status: $($response.data.status)" -ForegroundColor Gray
    }
    
    # Create new application for student2 if student1 already has one
    if ($tokens["student2@example.com"]) {
        $student2Headers = @{ Authorization = "Bearer $($tokens["student2@example.com"].token)" }
        
        Write-Host "`n[TEST] Create New Application" -ForegroundColor Cyan
        $newAppBody = @{
            preferredStartDate = "2025-02-01"
            preferredEndDate = "2025-07-31"
            preferredLocation = "Mombasa"
            preferredIndustry = "Finance"
            preferredPlacementArea = "Banking"
            coverLetter = "I am interested in a finance attachment."
        }
        $response = Invoke-Api "POST" "$baseUrl/applications" $student2Headers $newAppBody
        if ($response -is [System.Management.Automation.ErrorRecord]) {
            Write-Host "FAIL: Create new application - $($response.Exception.Message)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Test = "Create New Application"; Status = "FAIL"; Details = $response.Exception.Message }
            $newAppId = $null
        } else {
            $newAppId = $response.data.id
            Assert-Equals "DRAFT" $response.data.status "New application is DRAFT"
            Assert-NotNull $newAppId "New application has ID"
            Write-Host "  New Application ID: $newAppId" -ForegroundColor Gray
        }
        
        # Update application
        if ($newAppId) {
            Write-Host "`n[TEST] Update Application" -ForegroundColor Cyan
            $updateBody = @{ preferredLocation = "Kisumu" }
            $response = Invoke-Api "PATCH" "$baseUrl/applications/$newAppId" $student2Headers $updateBody
            if ($response -is [System.Management.Automation.ErrorRecord]) {
                Write-Host "FAIL: Update application - $($response.Exception.Message)" -ForegroundColor Red
                $results += [PSCustomObject]@{ Test = "Update Application"; Status = "FAIL"; Details = $response.Exception.Message }
            } else {
                Assert-Equals "Kisumu" $response.data.preferredLocation "Application updated"
            }
        }
    }
}

# ============================================
# 5. ADMIN APPLICATION REVIEW
# ============================================
Write-Host "`n--- ADMIN APPLICATION REVIEW ---" -ForegroundColor Yellow

if ($tokens["ops.admin@advenware.com"]) {
    $opsHeaders = @{ Authorization = "Bearer $($tokens["ops.admin@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Admin Get Applications" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/applications/admin" $opsHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Admin get applications - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Admin Get Applications"; Status = "FAIL"; Details = $response.Exception.Message }
        $adminAppId = $null
    } else {
        Assert-True ($response.data.Count -ge 1) "Admin can see applications"
        $adminAppId = $response.data[0].id
        Write-Host "  Admin can see $($response.data.Count) applications" -ForegroundColor Gray
    }
    
    if ($adminAppId) {
        Write-Host "`n[TEST] Admin Update Application Status" -ForegroundColor Cyan
        $updateStatusBody = @{ status = "APPROVED"; adminNotes = "Approved by ops admin" }
        $response = Invoke-Api "PATCH" "$baseUrl/applications/$adminAppId" $opsHeaders $updateStatusBody
        if ($response -is [System.Management.Automation.ErrorRecord]) {
            Write-Host "FAIL: Admin update application status - $($response.Exception.Message)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Test = "Admin Update Application Status"; Status = "FAIL"; Details = $response.Exception.Message }
        } else {
            Assert-Equals "APPROVED" $response.data.status "Application status updated to APPROVED"
            Assert-Equals "Approved by ops admin" $response.data.adminNotes "Admin notes saved"
        }
    }
}

# ============================================
# 6. DOCUMENT WORKFLOW
# ============================================
Write-Host "`n--- DOCUMENT WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Get Documents" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/documents" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get documents - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Documents"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 0) "Student can see documents"
        Write-Host "  Student has $($response.data.Count) documents" -ForegroundColor Gray
    }
    
    Write-Host "`n[TEST] Student Get Document Stats" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/documents/stats" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get document stats - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Document Stats"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data.total "Document stats returned"
    }
}

if ($tokens["docs.admin@advenware.com"]) {
    $docHeaders = @{ Authorization = "Bearer $($tokens["docs.admin@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Admin Get Documents" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/documents/admin" $docHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Admin get documents - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Admin Get Documents"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 0) "Admin can see documents"
        Write-Host "  Admin sees $($response.data.Count) documents" -ForegroundColor Gray
    }
}

# ============================================
# 7. PLACEMENT WORKFLOW
# ============================================
Write-Host "`n--- PLACEMENT WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["ops.admin@advenware.com"]) {
    $opsHeaders = @{ Authorization = "Bearer $($tokens["ops.admin@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Admin Get Placements" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/placements/admin" $opsHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Admin get placements - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Admin Get Placements"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 0) "Admin can see placements"
        Write-Host "  Admin sees $($response.data.Count) placements" -ForegroundColor Gray
    }
}

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Get My Placement" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/placements/me" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get placement - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Placement"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        if ($response.data) {
            Assert-NotNull $response.data.id "Student has placement"
            Write-Host "  Student placement: $($response.data.status)" -ForegroundColor Gray
        } else {
            Write-Host "  Student has no placement yet" -ForegroundColor Yellow
        }
    }
}

# ============================================
# 8. PAYMENT WORKFLOW
# ============================================
Write-Host "`n--- PAYMENT WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Get Payments" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/payments/me" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get payments - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Payments"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 0) "Student can see payments"
        Write-Host "  Student has $($response.data.Count) payments" -ForegroundColor Gray
    }
}

if ($tokens["finance.admin@advenware.com"]) {
    $financeHeaders = @{ Authorization = "Bearer $($tokens["finance.admin@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Finance Admin Get Payments" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/payments/admin" $financeHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Finance admin get payments - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Finance Admin Get Payments"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 0) "Finance admin can see payments"
        Write-Host "  Finance admin sees $($response.data.Count) payments" -ForegroundColor Gray
    }
}

# ============================================
# 9. COMMISSION WORKFLOW
# ============================================
Write-Host "`n--- COMMISSION WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["agent1@advenware.com"]) {
    $agentHeaders = @{ Authorization = "Bearer $($tokens["agent1@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Agent Get Commissions" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/agent/commissions" $agentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Agent get commissions - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Agent Get Commissions"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data "Agent can see commissions"
        Write-Host "  Agent sees $($response.data.Count) commissions" -ForegroundColor Gray
    }
    
    Write-Host "`n[TEST] Agent Get Withdrawals" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/agent/withdrawals" $agentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Agent get withdrawals - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Agent Get Withdrawals"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data "Agent can see withdrawals"
        Write-Host "  Agent sees $($response.data.Count) withdrawals" -ForegroundColor Gray
    }
}

if ($tokens["finance.admin@advenware.com"]) {
    $financeHeaders = @{ Authorization = "Bearer $($tokens["finance.admin@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Finance Admin Get Commissions" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/commissions" $financeHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Finance admin get commissions - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Finance Admin Get Commissions"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 0) "Finance admin can see commissions"
        Write-Host "  Finance admin sees $($response.data.Count) commissions" -ForegroundColor Gray
    }
}

# ============================================
# 10. MESSAGING WORKFLOW
# ============================================
Write-Host "`n--- MESSAGING WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Get Conversations" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/messaging/conversations" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get conversations - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Conversations"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data "Student can see conversations"
        Write-Host "  Student has $($response.data.Count) conversations" -ForegroundColor Gray
    }
}

# ============================================
# 11. NOTIFICATION WORKFLOW
# ============================================
Write-Host "`n--- NOTIFICATION WORKFLOW ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Get Notifications" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/notifications" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get notifications - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Notifications"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data "Student can see notifications"
        Write-Host "  Student has $($response.data.Count) notifications" -ForegroundColor Gray
    }
    
    Write-Host "`n[TEST] Student Get Unread Count" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/notifications/unread-count" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Student get unread count - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Get Unread Count"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data.count "Unread count returned"
    }
}

# ============================================
# 12. SUPER ADMIN FUNCTIONALITY
# ============================================
Write-Host "`n--- SUPER ADMIN FUNCTIONALITY ---" -ForegroundColor Yellow

if ($tokens["superadmin@advenware.com"]) {
    $superHeaders = @{ Authorization = "Bearer $($tokens["superadmin@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Super Admin Dashboard" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/admin/dashboard" $superHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Super admin dashboard - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Super Admin Dashboard"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data.totalStudents "Dashboard has total students"
        Assert-NotNull $response.data.totalAgents "Dashboard has total agents"
        Assert-NotNull $response.data.totalApplications "Dashboard has total applications"
        Write-Host "  Dashboard stats: Students=$($response.data.totalStudents), Agents=$($response.data.totalAgents), Applications=$($response.data.totalApplications)" -ForegroundColor Gray
    }
    
    Write-Host "`n[TEST] Super Admin Get Admins" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/admin/admins" $superHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Super admin get admins - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Super Admin Get Admins"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-True ($response.data.Count -ge 1) "Super admin can see admins"
    }
    
    Write-Host "`n[TEST] Super Admin Get Audit Logs" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/admin/audit-logs" $superHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Super admin get audit logs - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Super Admin Get Audit Logs"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data "Audit logs returned"
    }
}

# ============================================
# 13. AGENT DASHBOARD
# ============================================
Write-Host "`n--- AGENT DASHBOARD ---" -ForegroundColor Yellow

if ($tokens["agent1@advenware.com"]) {
    $agentHeaders = @{ Authorization = "Bearer $($tokens["agent1@advenware.com"].token)" }
    
    Write-Host "`n[TEST] Agent Dashboard Stats" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/agent/dashboard" $agentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Agent dashboard - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Agent Dashboard"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data.totalStudents "Agent dashboard has total students"
        Assert-NotNull $response.data.availableBalance "Agent dashboard has available balance"
        Write-Host "  Agent stats: Students=$($response.data.totalStudents), AvailableBalance=$($response.data.availableBalance)" -ForegroundColor Gray
    }
    
    Write-Host "`n[TEST] Agent Get My Students" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/agent/students" $agentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        Write-Host "FAIL: Agent get students - $($response.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Agent Get Students"; Status = "FAIL"; Details = $response.Exception.Message }
    } else {
        Assert-NotNull $response.data "Agent can see students"
    }
}

# ============================================
# 14. REPORTS ACCESS CONTROL
# ============================================
Write-Host "`n--- REPORTS ACCESS CONTROL ---" -ForegroundColor Yellow

if ($tokens["student1@example.com"]) {
    $studentHeaders = @{ Authorization = "Bearer $($tokens["student1@example.com"].token)" }
    
    Write-Host "`n[TEST] Student Blocked from Reports" -ForegroundColor Cyan
    $response = Invoke-Api "GET" "$baseUrl/reports/students" $studentHeaders $null
    if ($response -is [System.Management.Automation.ErrorRecord]) {
        if ($response.Exception.Response.StatusCode -eq 403) {
            Write-Host "PASS: Student blocked from reports" -ForegroundColor Green
            $results += [PSCustomObject]@{ Test = "Student Reports Access"; Status = "PASS"; Details = "Correctly returned 403" }
        } else {
            Write-Host "FAIL: Unexpected status: $($response.Exception.Response.StatusCode)" -ForegroundColor Red
            $results += [PSCustomObject]@{ Test = "Student Reports Access"; Status = "FAIL"; Details = $response.Exception.Message }
        }
    } else {
        Write-Host "FAIL: Student should not access reports" -ForegroundColor Red
        $results += [PSCustomObject]@{ Test = "Student Reports Access"; Status = "FAIL"; Details = "Student accessed reports" }
    }
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$skipCount = ($results | Where-Object { $_.Status -eq "SKIP" }).Count

Write-Host "`nTotal Tests: $($results.Count)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Skipped: $skipCount" -ForegroundColor Yellow

if ($failCount -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Details)" -ForegroundColor Red
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Export results to JSON
$results | ConvertTo-Json -Depth 5 | Out-File -FilePath "C:\Users\user\Desktop\AdvenwareACL\test-results.json" -Encoding utf8
Write-Host "Detailed results saved to: C:\Users\user\Desktop\AdvenwareACL\test-results.json" -ForegroundColor Gray
