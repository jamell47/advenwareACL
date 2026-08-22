@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set BASE_URL=http://localhost:4000/api/v1
set RESULTS_FILE=C:\Users\user\Desktop\AdvenwareACL\test-results.txt

echo ======================================== > %RESULTS_FILE%
echo   ACL END-TO-END API TESTS >> %RESULTS_FILE%
echo ======================================== >> %RESULTS_FILE%
echo. >> %RESULTS_FILE%

REM ============================================
REM 1. HEALTH CHECK
REM ============================================
echo --- HEALTH CHECK --- >> %RESULTS_FILE%
curl -s %BASE_URL%/../health > nul 2>&1
if %errorlevel% equ 0 (
    echo PASS: Health endpoint reachable >> %RESULTS_FILE%
) else (
    echo FAIL: Health endpoint unreachable >> %RESULTS_FILE%
)

REM ============================================
REM 2. AUTHENTICATION
REM ============================================
echo. >> %RESULTS_FILE%
echo --- AUTHENTICATION --- >> %RESULTS_FILE%

REM Login as superadmin
for /f "delims=" %%a in ('curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"superadmin@advenware.com\",\"password\":\"Dev@123456\"}"') do set SUPER_LOGIN=%%a
echo %SUPER_LOGIN% | findstr "SUPER_ADMIN" > nul
if %errorlevel% equ 0 (
    echo PASS: Super Admin login >> %RESULTS_FILE%
    for /f "tokens=2 delims=:}" %%a in ('echo %SUPER_LOGIN% ^| findstr /C:"accessToken"') do set SUPER_TOKEN=%%a
    set SUPER_TOKEN=%SUPER_TOKEN:"=%
    set SUPER_TOKEN=%SUPER_TOKEN:,=%
) else (
    echo FAIL: Super Admin login >> %RESULTS_FILE%
)

REM Login as student
for /f "delims=" %%a in ('curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"student1@example.com\",\"password\":\"Dev@123456\"}"') do set STUDENT_LOGIN=%%a
echo %STUDENT_LOGIN% | findstr "STUDENT" > nul
if %errorlevel% equ 0 (
    echo PASS: Student login >> %RESULTS_FILE%
    for /f "tokens=2 delims=:}" %%a in ('echo %STUDENT_LOGIN% ^| findstr /C:"accessToken"') do set STUDENT_TOKEN=%%a
    set STUDENT_TOKEN=%STUDENT_TOKEN:"=%
    set STUDENT_TOKEN=%STUDENT_TOKEN:,=%
) else (
    echo FAIL: Student login >> %RESULTS_FILE%
)

REM Login as agent
for /f "delims=" %%a in ('curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"agent1@advenware.com\",\"password\":\"Dev@123456\"}"') do set AGENT_LOGIN=%%a
echo %AGENT_LOGIN% | findstr "AGENT" > nul
if %errorlevel% equ 0 (
    echo PASS: Agent login >> %RESULTS_FILE%
    for /f "tokens=2 delims=:}" %%a in ('echo %AGENT_LOGIN% ^| findstr /C:"accessToken"') do set AGENT_TOKEN=%%a
    set AGENT_TOKEN=%AGENT_TOKEN:"=%
    set AGENT_TOKEN=%AGENT_TOKEN:,=%
) else (
    echo FAIL: Agent login >> %RESULTS_FILE%
)

REM Invalid login
for /f "delims=" %%a in ('curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"invalid@test.com\",\"password\":\"wrongpass\"}"') do set INVALID_LOGIN=%%a
echo %INVALID_LOGIN% | findstr "401" > nul
if %errorlevel% equ 0 (
    echo PASS: Invalid login rejected >> %RESULTS_FILE%
) else (
    echo FAIL: Invalid login not rejected >> %RESULTS_FILE%
)

REM Protected route without token
curl -s "%BASE_URL%/auth/me" > temp_no_token.txt 2>&1
findstr /C:"401" temp_no_token.txt > nul
if %errorlevel% equ 0 (
    echo PASS: Protected route requires auth >> %RESULTS_FILE%
) else (
    echo FAIL: Protected route accessible without auth >> %RESULTS_FILE%
)

REM ============================================
REM 3. ROLE-BASED ACCESS CONTROL
REM ============================================
echo. >> %RESULTS_FILE%
echo --- ROLE-BASED ACCESS CONTROL --- >> %RESULTS_FILE%

if defined STUDENT_TOKEN (
    curl -s -H "Authorization: Bearer %STUDENT_TOKEN%" "%BASE_URL%/admin/dashboard" > temp_student_admin.txt 2>&1
    findstr /C:"403" temp_student_admin.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Student blocked from admin >> %RESULTS_FILE%
    ) else (
        echo FAIL: Student accessed admin >> %RESULTS_FILE%
    )
)

if defined AGENT_TOKEN (
    curl -s -H "Authorization: Bearer %AGENT_TOKEN%" "%BASE_URL%/admin/dashboard" > temp_agent_admin.txt 2>&1
    findstr /C:"403" temp_agent_admin.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Agent blocked from admin >> %RESULTS_FILE%
    ) else (
        echo FAIL: Agent accessed admin >> %RESULTS_FILE%
    )
)

REM ============================================
REM 4. STUDENT APPLICATION WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- STUDENT APPLICATION WORKFLOW --- >> %RESULTS_FILE%

if defined STUDENT_TOKEN (
    curl -s -H "Authorization: Bearer %STUDENT_TOKEN%" "%BASE_URL%/applications/me" > temp_my_app.txt 2>&1
    findstr /C:"applicationId" temp_my_app.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Student has application >> %RESULTS_FILE%
    ) else (
        echo FAIL: Student has no application >> %RESULTS_FILE%
    )
)

REM ============================================
REM 5. DOCUMENT WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- DOCUMENT WORKFLOW --- >> %RESULTS_FILE%

if defined STUDENT_TOKEN (
    curl -s -H "Authorization: Bearer %STUDENT_TOKEN%" "%BASE_URL%/documents" > temp_docs.txt 2>&1
    findstr /C:"data" temp_docs.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Student can view documents >> %RESULTS_FILE%
    ) else (
        echo FAIL: Student cannot view documents >> %RESULTS_FILE%
    )
)

REM ============================================
REM 6. PLACEMENT WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- PLACEMENT WORKFLOW --- >> %RESULTS_FILE%

if defined SUPER_TOKEN (
    curl -s -H "Authorization: Bearer %SUPER_TOKEN%" "%BASE_URL%/placements/admin" > temp_placements.txt 2>&1
    findstr /C:"data" temp_placements.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Admin can view placements >> %RESULTS_FILE%
    ) else (
        echo FAIL: Admin cannot view placements >> %RESULTS_FILE%
    )
)

REM ============================================
REM 7. PAYMENT WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- PAYMENT WORKFLOW --- >> %RESULTS_FILE%

if defined STUDENT_TOKEN (
    curl -s -H "Authorization: Bearer %STUDENT_TOKEN%" "%BASE_URL%/payments/me" > temp_payments.txt 2>&1
    findstr /C:"data" temp_payments.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Student can view payments >> %RESULTS_FILE%
    ) else (
        echo FAIL: Student cannot view payments >> %RESULTS_FILE%
    )
)

REM ============================================
REM 8. COMMISSION WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- COMMISSION WORKFLOW --- >> %RESULTS_FILE%

if defined AGENT_TOKEN (
    curl -s -H "Authorization: Bearer %AGENT_TOKEN%" "%BASE_URL%/agent/commissions" > temp_commissions.txt 2>&1
    findstr /C:"data" temp_commissions.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Agent can view commissions >> %RESULTS_FILE%
    ) else (
        echo FAIL: Agent cannot view commissions >> %RESULTS_FILE%
    )
)

REM ============================================
REM 9. MESSAGING WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- MESSAGING WORKFLOW --- >> %RESULTS_FILE%

if defined STUDENT_TOKEN (
    curl -s -H "Authorization: Bearer %STUDENT_TOKEN%" "%BASE_URL%/messaging/conversations" > temp_messages.txt 2>&1
    findstr /C:"data" temp_messages.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Student can view messages >> %RESULTS_FILE%
    ) else (
        echo FAIL: Student cannot view messages >> %RESULTS_FILE%
    )
)

REM ============================================
REM 10. NOTIFICATION WORKFLOW
REM ============================================
echo. >> %RESULTS_FILE%
echo --- NOTIFICATION WORKFLOW --- >> %RESULTS_FILE%

if defined STUDENT_TOKEN (
    curl -s -H "Authorization: Bearer %STUDENT_TOKEN%" "%BASE_URL%/notifications" > temp_notifications.txt 2>&1
    findstr /C:"data" temp_notifications.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Student can view notifications >> %RESULTS_FILE%
    ) else (
        echo FAIL: Student cannot view notifications >> %RESULTS_FILE%
    )
)

REM ============================================
REM 11. SUPER ADMIN FUNCTIONALITY
REM ============================================
echo. >> %RESULTS_FILE%
echo --- SUPER ADMIN FUNCTIONALITY --- >> %RESULTS_FILE%

if defined SUPER_TOKEN (
    curl -s -H "Authorization: Bearer %SUPER_TOKEN%" "%BASE_URL%/admin/dashboard" > temp_dashboard.txt 2>&1
    findstr /C:"totalStudents" temp_dashboard.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Super admin dashboard works >> %RESULTS_FILE%
    ) else (
        echo FAIL: Super admin dashboard failed >> %RESULTS_FILE%
    )
)

REM ============================================
REM 12. AGENT DASHBOARD
REM ============================================
echo. >> %RESULTS_FILE%
echo --- AGENT DASHBOARD --- >> %RESULTS_FILE%

if defined AGENT_TOKEN (
    curl -s -H "Authorization: Bearer %AGENT_TOKEN%" "%BASE_URL%/agent/dashboard" > temp_agent_dash.txt 2>&1
    findstr /C:"totalStudents" temp_agent_dash.txt > nul
    if !errorlevel! equ 0 (
        echo PASS: Agent dashboard works >> %RESULTS_FILE%
    ) else (
        echo FAIL: Agent dashboard failed >> %RESULTS_FILE%
    )
)

REM ============================================
REM SUMMARY
REM ============================================
echo. >> %RESULTS_FILE%
echo ======================================== >> %RESULTS_FILE%
echo   TEST SUMMARY >> %RESULTS_FILE%
echo ======================================== >> %RESULTS_FILE%
echo. >> %RESULTS_FILE%

findstr /C:"PASS" %RESULTS_FILE% > temp_pass.txt
findstr /C:"FAIL" %RESULTS_FILE% > temp_fail.txt

for /f %%c in ('find /c /v "" ^< temp_pass.txt') do set PASS_COUNT=%%c
for /f %%c in ('find /c /v "" ^< temp_fail.txt') do set FAIL_COUNT=%%c

echo Passed: %PASS_COUNT% >> %RESULTS_FILE%
echo Failed: %FAIL_COUNT% >> %RESULTS_FILE%

if %FAIL_COUNT% gtr 0 (
    echo. >> %RESULTS_FILE%
    echo Failed Tests: >> %RESULTS_FILE%
    findstr /C:"FAIL" %RESULTS_FILE% >> %RESULTS_FILE%
)

echo. >> %RESULTS_FILE%
echo ======================================== >> %RESULTS_FILE%

type %RESULTS_FILE%

del temp_*.txt 2>nul
