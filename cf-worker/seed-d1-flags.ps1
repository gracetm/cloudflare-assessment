# D1 Flag Seeding Script - One by One (Fixes Command Length Error)


Write-Host "D1 Flag Seeding Script - One by One"
Write-Host ""


$flagsFolder = "png1000px"
$databaseName = "flags-database"


if (-not (Test-Path $flagsFolder)) {
    Write-Host "ERROR: Folder '$flagsFolder' not found!"
    exit 1
}


$pngFiles = Get-ChildItem -Path $flagsFolder -Filter "*.png"
$totalFiles = $pngFiles.Count


if ($totalFiles -eq 0) {
    Write-Host "ERROR: No PNG files found!"
    exit 1
}


Write-Host "Found $totalFiles PNG files"
Write-Host ""


$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Cancelled."
    exit 0
}


Write-Host ""
Write-Host "Starting seeding (this will take 5-10 minutes)..."
Write-Host ""


$success = 0
$errors = 0
$counter = 0


foreach ($file in $pngFiles) {
    $counter++
    $countryCode = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $percent = [math]::Round(($counter / $totalFiles) * 100, 1)
   
    Write-Host "[$percent%] $countryCode" -NoNewline
   
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $base64 = [System.Convert]::ToBase64String($bytes)
       
        $sql = "INSERT OR REPLACE INTO flags (country_code, flag_data, content_type) VALUES ('$countryCode', '$base64', 'image/png');"
       
        $result = wrangler d1 execute $databaseName --command="$sql" --remote 2>&1
       
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [OK]"
            $success++
        } else {
            Write-Host " [ERROR]"
            $errors++
        }
       
    } catch {
        Write-Host " [ERROR]: $_"
        $errors++
    }
   
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 100
}


Write-Host ""
Write-Host "========================================"
Write-Host "Complete!"
Write-Host "========================================"
Write-Host "Success: $success"
Write-Host "Errors: $errors"
Write-Host ""


Write-Host "Verifying database..."
wrangler d1 execute $databaseName --command="SELECT COUNT(*) as total FROM flags;" --remote


Write-Host ""
Write-Host "Next: wrangler deploy"