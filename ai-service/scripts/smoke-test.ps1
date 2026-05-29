param(
  [string]$BaseUrl = $(if ($env:AI_SERVICE_BASE_URL) { $env:AI_SERVICE_BASE_URL } else { "http://127.0.0.1:5000" }),
  [string]$ArticleId = $(if ($env:AI_SERVICE_SMOKE_ARTICLE_ID) { $env:AI_SERVICE_SMOKE_ARTICLE_ID } else { "99001" })
)

$ErrorActionPreference = "Stop"

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

Write-Host "Checking health endpoint at $BaseUrl/health..."
$health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/health"
Assert-True ($health.status -eq "ok") "Health check failed: expected status=ok, received $($health | ConvertTo-Json -Compress)"

Write-Host "Indexing sample knowledge base article..."
$indexPayload = @{
  article_id = [int]$ArticleId
  title = "Leave carry-forward policy"
  content = "Employees can carry forward up to 10 unused leave days into the next calendar year. Requests beyond the limit require HR approval."
  category = "Leave"
  role_tag = "EMPLOYEE"
  version = 1
  status = "approved"
} | ConvertTo-Json

$indexResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rag/index-article" -ContentType "application/json" -Body $indexPayload
Assert-True ($indexResponse.indexed -eq $true) "Indexing failed: expected indexed=true, received $($indexResponse | ConvertTo-Json -Compress)"

Write-Host "Running retrieval query..."
$queryPayload = @{
  query_text = "How many leave days can I carry forward?"
} | ConvertTo-Json

$queryResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rag/query" -ContentType "application/json" -Body $queryPayload
Assert-True ($null -ne $queryResponse.answer) "Query failed: expected a local answer, received $($queryResponse | ConvertTo-Json -Compress)"
Assert-True ($queryResponse.escalate -eq $false) "Query failed: expected escalate=false, received $($queryResponse | ConvertTo-Json -Compress)"
Assert-True ($queryResponse.confidence -ge 0.9) "Query failed: expected confidence >= 0.9, received $($queryResponse | ConvertTo-Json -Compress)"

Write-Host "Smoke test passed."