param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Email,
  [string]$Password,
  [int]$EventId = 0,
  [int]$SurveyId = 0,
  [int]$ApprovalId = 0,
  [int]$NotificationId = 0
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Url,
    [bool]$Passed,
    [int]$StatusCode,
    [string]$Note = ""
  )

  $results.Add([PSCustomObject]@{
      Name = $Name
      Method = $Method
      Url = $Url
      Passed = $Passed
      StatusCode = $StatusCode
      Note = $Note
    })
}

function Invoke-Endpoint {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Path,
    [hashtable]$Headers = @{},
    $Body = $null,
    [int[]]$ExpectedStatus = @(200)
  )

  $url = "$BaseUrl$Path"

  try {
    if ($null -ne $Body) {
      $payload = $Body | ConvertTo-Json -Depth 10
      $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $Headers -Body $payload -ContentType "application/json" -UseBasicParsing
    }
    else {
      $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $Headers -UseBasicParsing
    }

    $status = [int]$response.StatusCode
    $passed = $ExpectedStatus -contains $status
    Add-Result -Name $Name -Method $Method -Url $url -Passed $passed -StatusCode $status

    if ($response.Content) {
      try {
        return ($response.Content | ConvertFrom-Json)
      }
      catch {
        return $null
      }
    }

    return $null
  }
  catch {
    $status = 0
    $message = $_.Exception.Message

    $hasResponse = ($null -ne $_.Exception) -and ($_.Exception.PSObject.Properties.Name -contains "Response") -and ($null -ne $_.Exception.Response)
    if ($hasResponse -and ($_.Exception.Response.PSObject.Properties.Name -contains "StatusCode")) {
      $status = [int]$_.Exception.Response.StatusCode
      $passed = $ExpectedStatus -contains $status
      Add-Result -Name $Name -Method $Method -Url $url -Passed $passed -StatusCode $status -Note $message
      return $null
    }

    Add-Result -Name $Name -Method $Method -Url $url -Passed $false -StatusCode 0 -Note $message
    return $null
  }
}

Write-Host "`n== Node API Smoke Test ==" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"

# Public health checks
Invoke-Endpoint -Name "Health" -Method "GET" -Path "/health" -ExpectedStatus @(200) | Out-Null
Invoke-Endpoint -Name "Health DB" -Method "GET" -Path "/health/db" -ExpectedStatus @(200) | Out-Null

if ([string]::IsNullOrWhiteSpace($Email) -or [string]::IsNullOrWhiteSpace($Password)) {
  Write-Host "`nEmail and Password are required for authenticated route checks." -ForegroundColor Yellow
  Write-Host "Example:" -ForegroundColor Yellow
  Write-Host "  .\scripts\api-smoke-test.ps1 -Email 'admin@example.com' -Password 'your-password'" -ForegroundColor Yellow

  $results | Format-Table -AutoSize
  $failedCount = @($results | Where-Object { -not $_.Passed }).Count
  if ($failedCount -gt 0) { exit 1 }
  exit 0
}

# Login and build auth headers
$loginResponse = Invoke-Endpoint -Name "Auth Login" -Method "POST" -Path "/api/v1/auth/login" -Body @{
  email = $Email
  password = $Password
} -ExpectedStatus @(200)

$token = $null
if ($loginResponse -and $loginResponse.data -and $loginResponse.data.token) {
  $token = [string]$loginResponse.data.token
}

if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Host "`nLogin failed or token missing. Stopping auth checks." -ForegroundColor Red
  $results | Format-Table -AutoSize
  exit 1
}

$authHeaders = @{ Authorization = "Bearer $token" }

# Core authenticated endpoints
Invoke-Endpoint -Name "Auth Me" -Method "GET" -Path "/api/v1/auth/me" -Headers $authHeaders -ExpectedStatus @(200) | Out-Null
Invoke-Endpoint -Name "Employees Me" -Method "GET" -Path "/api/v1/employees/me" -Headers $authHeaders -ExpectedStatus @(200) | Out-Null
Invoke-Endpoint -Name "Employees Events" -Method "GET" -Path "/api/v1/employees/events" -Headers $authHeaders -ExpectedStatus @(200) | Out-Null
$surveysResponse = Invoke-Endpoint -Name "Employees Surveys" -Method "GET" -Path "/api/v1/employees/surveys" -Headers $authHeaders -ExpectedStatus @(200)
$notificationsResponse = Invoke-Endpoint -Name "Employees Notifications" -Method "GET" -Path "/api/v1/employees/notifications" -Headers $authHeaders -ExpectedStatus @(200)
Invoke-Endpoint -Name "Surveys List" -Method "GET" -Path "/api/v1/surveys" -Headers $authHeaders -ExpectedStatus @(200) | Out-Null

# Auto-discover IDs where possible
if ($SurveyId -le 0 -and $surveysResponse -and $surveysResponse.data -and $surveysResponse.data.Count -gt 0) {
  $firstSurvey = $surveysResponse.data | Select-Object -First 1
  if ($firstSurvey -and $firstSurvey.surveyId) {
    $SurveyId = [int]$firstSurvey.surveyId
  }
}

if ($NotificationId -le 0 -and $notificationsResponse -and $notificationsResponse.data -and $notificationsResponse.data.Count -gt 0) {
  $firstNotification = $notificationsResponse.data | Select-Object -First 1
  if ($firstNotification -and $firstNotification.id) {
    $NotificationId = [int]$firstNotification.id
  }
}

# Some modules require IDs and/or role permissions
if ($EventId -gt 0) {
  Invoke-Endpoint -Name "Event By ID" -Method "GET" -Path "/api/v1/events/$EventId" -Headers $authHeaders -ExpectedStatus @(200, 404) | Out-Null
  Invoke-Endpoint -Name "Event Submit" -Method "POST" -Path "/api/v1/events/$EventId/submit" -Headers $authHeaders -Body @{
    feedbackRating = 5
    feedbackText = "Smoke test feedback"
  } -ExpectedStatus @(200, 201, 400, 404) | Out-Null
}
else {
  Add-Result -Name "Event checks skipped" -Method "N/A" -Url "$BaseUrl/api/v1/events/{eventId}" -Passed $true -StatusCode 0 -Note "Provide -EventId to test event routes"
}

if ($SurveyId -gt 0) {
  Invoke-Endpoint -Name "Survey By ID" -Method "GET" -Path "/api/v1/surveys/$SurveyId" -Headers $authHeaders -ExpectedStatus @(200, 404) | Out-Null
  Invoke-Endpoint -Name "Survey Submit" -Method "POST" -Path "/api/v1/surveys/$SurveyId/submit" -Headers $authHeaders -Body @{
    answers = @(
      @{
        questionId = 1
        answerText = "Smoke test answer"
      }
    )
  } -ExpectedStatus @(200, 201, 400, 404) | Out-Null
}
else {
  Add-Result -Name "Survey detail/submit skipped" -Method "N/A" -Url "$BaseUrl/api/v1/surveys/{surveyId}" -Passed $true -StatusCode 0 -Note "No survey ID available"
}

if ($NotificationId -gt 0) {
  Invoke-Endpoint -Name "Notification Mark Read" -Method "POST" -Path "/api/v1/notifications/$NotificationId/read" -Headers $authHeaders -ExpectedStatus @(200, 404) | Out-Null
}
else {
  Add-Result -Name "Notification mark-read skipped" -Method "N/A" -Url "$BaseUrl/api/v1/notifications/{id}/read" -Passed $true -StatusCode 0 -Note "No notification ID available"
}

Invoke-Endpoint -Name "Chatbot Query" -Method "POST" -Path "/api/v1/chatbot/query" -Headers $authHeaders -Body @{
  queryText = "What surveys are currently open?"
} -ExpectedStatus @(200, 201, 400) | Out-Null

# Role-protected modules: 200/201 means allowed; 403 still confirms route is alive
Invoke-Endpoint -Name "Audit List" -Method "GET" -Path "/api/v1/audit" -Headers $authHeaders -ExpectedStatus @(200, 403) | Out-Null
$pendingApprovals = Invoke-Endpoint -Name "Approvals Pending" -Method "GET" -Path "/api/v1/approvals/pending" -Headers $authHeaders -ExpectedStatus @(200, 403)

if ($ApprovalId -le 0 -and $pendingApprovals -and $pendingApprovals.data -and $pendingApprovals.data.Count -gt 0) {
  $firstApproval = $pendingApprovals.data | Select-Object -First 1
  if ($firstApproval -and $firstApproval.id) {
    $ApprovalId = [int]$firstApproval.id
  }
}

if ($ApprovalId -gt 0) {
  Invoke-Endpoint -Name "Approval Approve" -Method "POST" -Path "/api/v1/approvals/$ApprovalId/approve" -Headers $authHeaders -Body @{
    comments = "Smoke test approve"
  } -ExpectedStatus @(200, 400, 403, 404) | Out-Null

  Invoke-Endpoint -Name "Approval Reject" -Method "POST" -Path "/api/v1/approvals/$ApprovalId/reject" -Headers $authHeaders -Body @{
    comments = "Smoke test reject"
  } -ExpectedStatus @(200, 400, 403, 404) | Out-Null
}
else {
  Add-Result -Name "Approval actions skipped" -Method "N/A" -Url "$BaseUrl/api/v1/approvals/{id}" -Passed $true -StatusCode 0 -Note "No approval ID available"
}

Invoke-Endpoint -Name "KB Articles List" -Method "GET" -Path "/api/v1/knowledge-base/articles" -Headers $authHeaders -ExpectedStatus @(200, 403) | Out-Null
Invoke-Endpoint -Name "Notification Send" -Method "POST" -Path "/api/v1/notifications/send" -Headers $authHeaders -Body @{
  title = "Smoke test"
  message = "This is a smoke-test notification"
} -ExpectedStatus @(201, 400, 403) | Out-Null

Write-Host "`n== Results ==" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$failed = @($results | Where-Object { -not $_.Passed })
if ($failed.Count -gt 0) {
  Write-Host "`nSmoke test finished with failures: $($failed.Count)" -ForegroundColor Red
  exit 1
}

Write-Host "`nSmoke test passed." -ForegroundColor Green
exit 0
