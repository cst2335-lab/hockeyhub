# Copy all page.tsx files from (dashboard) and (auth) to app\[locale]\...
# Run this script from the project root directory

Write-Host "=== Starting Page Migration ===" -ForegroundColor Cyan
Write-Host ""

$srcRoots = @('app\(dashboard)', 'app\(auth)')
$copiedCount = 0
$skippedCount = 0
$errors = @()

foreach ($srcRoot in $srcRoots) {
  if (-not (Test-Path $srcRoot)) {
    Write-Host "Warning: Source not found: $srcRoot" -ForegroundColor Yellow
    continue
  }

  Write-Host "Processing: $srcRoot" -ForegroundColor Green
  
  $pages = Get-ChildItem -LiteralPath $srcRoot -Recurse -Filter 'page.tsx'
  
  foreach ($page in $pages) {
    try {
      # Get relative path from source root
      $rel = $page.FullName.Substring((Resolve-Path $srcRoot).Path.Length)
      
      # Build destination path
      $groupName = Split-Path $srcRoot -Leaf
      $destDir = Join-Path "app\[locale]\$groupName" (Split-Path $rel -Parent)
      $destFile = Join-Path $destDir 'page.tsx'
      
      # Create destination directory
      if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
      }
      
      # Check if file exists
      if (Test-Path $destFile) {
        Write-Host "  Already exists: $destFile" -ForegroundColor Gray
        $skippedCount++
      } else {
        # Copy file
        Copy-Item -LiteralPath $page.FullName -Destination $destFile -Force
        Write-Host "  Copied: $($page.FullName) -> $destFile" -ForegroundColor Green
        $copiedCount++
      }
    }
    catch {
      $errors += "Error copying $($page.FullName): $_"
      Write-Host "  Error: $($page.FullName)" -ForegroundColor Red
    }
  }
  
  Write-Host ""
}

# Summary
Write-Host "=== Migration Summary ===" -ForegroundColor Cyan
Write-Host ""

$dashboardSource = if (Test-Path 'app\(dashboard)') { 
  (Get-ChildItem -LiteralPath 'app\(dashboard)' -Recurse -Filter 'page.tsx').Count 
} else { 0 }

$dashboardDest = if (Test-Path 'app\[locale]\(dashboard)') { 
  (Get-ChildItem -LiteralPath 'app\[locale]\(dashboard)' -Recurse -Filter 'page.tsx').Count 
} else { 0 }

$authSource = if (Test-Path 'app\(auth)') { 
  (Get-ChildItem -LiteralPath 'app\(auth)' -Recurse -Filter 'page.tsx').Count 
} else { 0 }

$authDest = if (Test-Path 'app\[locale]\(auth)') { 
  (Get-ChildItem -LiteralPath 'app\[locale]\(auth)' -Recurse -Filter 'page.tsx').Count 
} else { 0 }

Write-Host "Source Files:"
Write-Host "  Dashboard pages: $dashboardSource"
Write-Host "  Auth pages: $authSource"
Write-Host "  Total: $($dashboardSource + $authSource)"
Write-Host ""

Write-Host "Destination Files:"
Write-Host "  Dashboard pages in [locale]: $dashboardDest"
Write-Host "  Auth pages in [locale]: $authDest"
Write-Host "  Total: $($dashboardDest + $authDest)"
Write-Host ""

Write-Host "Operation Results:"
Write-Host "  Copied: $copiedCount" -ForegroundColor Green
Write-Host "  Skipped (already exists): $skippedCount" -ForegroundColor Gray

if ($dashboardDest -eq $dashboardSource -and $authDest -eq $authSource) {
  Write-Host ""
  Write-Host "SUCCESS! All files copied." -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "Warning: File counts don't match. Please check." -ForegroundColor Yellow
}

Write-Host ""