# ==============================================================================
# Automated Project Minifier & .min.* Generator Build Script
# 1. Generates production .min.css and .min.js files for all CSS & JS assets
# 2. Updates HTML to link to .min.css & .min.js while preserving clean HTML line structure
# 3. Copies all clean source code from "codeprojects/" into "projects/"
# ==============================================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseDir = Split-Path -Parent $ScriptDir
$SourceDir = Join-Path $BaseDir "codeprojects"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       PROJECTS .MIN.* ASSET BUILDER & MINIFIER         " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Base Directory   : $BaseDir" -ForegroundColor Gray
Write-Host "Source Directory : $SourceDir" -ForegroundColor Gray
Write-Host ""

# Ensure codeprojects directory exists
if (-not (Test-Path $SourceDir)) {
    Write-Host "[INFO] Creating 'codeprojects' directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $SourceDir | Out-Null
}

# CSS Minifier -> Produces compressed .min.css
function Minify-CSS {
    param([string]$css)
    if ([string]::IsNullOrWhiteSpace($css)) { return "" }
    # Remove CSS comments
    $c = [System.Text.RegularExpressions.Regex]::Replace($css, "/\*[\s\S]*?\*/", "")
    # Collapse multiple whitespace
    $c = [System.Text.RegularExpressions.Regex]::Replace($c, "\s+", " ")
    # Remove space around delimiters
    $c = [System.Text.RegularExpressions.Regex]::Replace($c, "\s*([{}:;,>+~])\s*", '$1')
    $c = [System.Text.RegularExpressions.Regex]::Replace($c, ";}", "}")
    return $c.Trim()
}

# JS Minifier -> Produces compressed .min.js
function Minify-JS {
    param([string]$js)
    if ([string]::IsNullOrWhiteSpace($js)) { return "" }
    # Remove multi-line comments
    $j = [System.Text.RegularExpressions.Regex]::Replace($js, "/\*[\s\S]*?\*/", "")
    # Remove single-line comments safely
    $lines = $j -split "`r?`n"
    $cleanLines = [System.Collections.Generic.List[string]]::new()
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed.StartsWith("//")) { continue }
        $cleanLines.Add($line)
    }
    $j = $cleanLines -join "`n"
    # Compress empty lines
    $j = [System.Text.RegularExpressions.Regex]::Replace($j, "\n\s*\n", "`n")
    return $j.Trim()
}

# HTML Optimizer -> Links to .min.css & .min.js and removes comments while keeping line structure
function Optimize-HTML {
    param([string]$html)
    if ([string]::IsNullOrWhiteSpace($html)) { return "" }
    
    # 1. Rewrite local CSS file references to .min.css
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '(?i)(<link\b[^>]*href=["''])(?!https?:\/\/)(?!//)([^"''>]+?)(?<!\.min)\.css(["''])', '$1$2.min.css$3')
    
    # 2. Rewrite local JS file references to .min.js
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, '(?i)(<script\b[^>]*src=["''])(?!https?:\/\/)(?!//)([^"''>]+?)(?<!\.min)\.js(["''])', '$1$2.min.js$3')
    
    # 3. Remove HTML comments (preserving conditional comments)
    $html = [System.Text.RegularExpressions.Regex]::Replace($html, "(?s)<!--(?!\[if).*?-->", "")
    
    # 4. Clean up trailing line spaces while preserving clean line breaks
    $lines = $html -split "`r?`n"
    $cleanLines = [System.Collections.Generic.List[string]]::new()
    foreach ($line in $lines) {
        $trimmedEnd = $line.TrimEnd()
        if ($trimmedEnd.Length -gt 0) {
            $cleanLines.Add($trimmedEnd)
        }
    }
    return ($cleanLines -join "`r`n").Trim()
}

$totalOrigBytes = 0
$totalMinBytes = 0

# 1. Process Root Files in codeprojects (e.g. codeprojects/index.html -> projects/index.html)
$rootFiles = Get-ChildItem -Path $SourceDir -File
if ($rootFiles.Count -gt 0) {
    Write-Host "-> Building Root Files..." -ForegroundColor Cyan
    foreach ($file in $rootFiles) {
        $destFile = Join-Path $BaseDir $file.Name
        $ext = $file.Extension.ToLower()
        $origSize = $file.Length
        $totalOrigBytes += $origSize
        
        if ($ext -eq ".html" -or $ext -eq ".htm") {
            $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
            $optimized = Optimize-HTML $content
            [System.IO.File]::WriteAllText($destFile, $optimized, [System.Text.Encoding]::UTF8)
            $newSize = (Get-Item $destFile).Length
            $totalMinBytes += $newSize
            Write-Host "   Optimized Root HTML: $($file.Name)" -ForegroundColor Gray
        }
        elseif ($ext -eq ".css") {
            $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
            $minified = Minify-CSS $content
            [System.IO.File]::WriteAllText($destFile, $minified, [System.Text.Encoding]::UTF8)
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            if (-not $baseName.EndsWith(".min")) {
                $minDest = Join-Path $BaseDir "$baseName.min.css"
                [System.IO.File]::WriteAllText($minDest, $minified, [System.Text.Encoding]::UTF8)
            }
            $newSize = (Get-Item $destFile).Length
            $totalMinBytes += $newSize
            Write-Host "   Generated Root .min.css: $($file.Name)" -ForegroundColor Gray
        }
        elseif ($ext -eq ".js") {
            $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
            $minified = Minify-JS $content
            [System.IO.File]::WriteAllText($destFile, $minified, [System.Text.Encoding]::UTF8)
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            if (-not $baseName.EndsWith(".min")) {
                $minDest = Join-Path $BaseDir "$baseName.min.js"
                [System.IO.File]::WriteAllText($minDest, $minified, [System.Text.Encoding]::UTF8)
            }
            $newSize = (Get-Item $destFile).Length
            $totalMinBytes += $newSize
            Write-Host "   Generated Root .min.js: $($file.Name)" -ForegroundColor Gray
        }
        else {
            Copy-Item -Path $file.FullName -Destination $destFile -Force
            $totalMinBytes += $origSize
        }
    }
}

# 2. Scan all subdirectories in codeprojects
$projectDirs = Get-ChildItem -Path $SourceDir -Directory
if ($projectDirs.Count -eq 0) {
    Write-Host "[WARNING] No project subdirectories found inside '$SourceDir'!" -ForegroundColor Yellow
}
else {
    Write-Host "Found $($projectDirs.Count) projects to process in codeprojects/`n" -ForegroundColor Green
    
    foreach ($pDir in $projectDirs) {
        $projectName = $pDir.Name
        $targetDir = Join-Path $BaseDir $projectName
        
        Write-Host "-> Building Project: [$projectName]" -ForegroundColor Cyan
        
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir | Out-Null
        }
        
        # Get all files recursively
        $files = Get-ChildItem -Path $pDir.FullName -Recurse -File
        
        foreach ($file in $files) {
            $relPath = $file.FullName.Substring($pDir.FullName.Length).TrimStart("\", "/")
            $destFile = Join-Path $targetDir $relPath
            $destParent = Split-Path -Parent $destFile
            
            if (-not (Test-Path $destParent)) {
                New-Item -ItemType Directory -Path $destParent -Force | Out-Null
            }
            
            $ext = $file.Extension.ToLower()
            $origSize = $file.Length
            $totalOrigBytes += $origSize
            
            if ($ext -eq ".html" -or $ext -eq ".htm") {
                $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
                $optimized = Optimize-HTML $content
                [System.IO.File]::WriteAllText($destFile, $optimized, [System.Text.Encoding]::UTF8)
                $newSize = (Get-Item $destFile).Length
                $totalMinBytes += $newSize
            }
            elseif ($ext -eq ".css") {
                $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
                $minified = Minify-CSS $content
                
                # Write original name minified
                [System.IO.File]::WriteAllText($destFile, $minified, [System.Text.Encoding]::UTF8)
                
                # Also generate .min.css
                $fileBase = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
                if (-not $fileBase.EndsWith(".min")) {
                    $minDestFile = Join-Path $destParent "$fileBase.min.css"
                    [System.IO.File]::WriteAllText($minDestFile, $minified, [System.Text.Encoding]::UTF8)
                }
                
                $newSize = (Get-Item $destFile).Length
                $totalMinBytes += $newSize
            }
            elseif ($ext -eq ".js") {
                $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
                $minified = Minify-JS $content
                
                # Write original name minified
                [System.IO.File]::WriteAllText($destFile, $minified, [System.Text.Encoding]::UTF8)
                
                # Also generate .min.js
                $fileBase = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
                if (-not $fileBase.EndsWith(".min")) {
                    $minDestFile = Join-Path $destParent "$fileBase.min.js"
                    [System.IO.File]::WriteAllText($minDestFile, $minified, [System.Text.Encoding]::UTF8)
                }
                
                $newSize = (Get-Item $destFile).Length
                $totalMinBytes += $newSize
            }
            else {
                # Copy binary/media files directly
                Copy-Item -Path $file.FullName -Destination $destFile -Force
                $totalMinBytes += $origSize
            }
        }
        Write-Host "   Done: $projectName (.min.css & .min.js linked in HTML)" -ForegroundColor Gray
    }
}

$origKb = [math]::Round($totalOrigBytes / 1024, 2)
$minKb = [math]::Round($totalMinBytes / 1024, 2)
$saved = if ($origKb -gt 0) { [math]::Round((($origKb - $minKb) / $origKb) * 100, 1) } else { 0 }

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host " Total Projects Processed : $($projectDirs.Count)" -ForegroundColor White
Write-Host " Original Size             : $origKb KB" -ForegroundColor White
Write-Host " Minified Production Size  : $minKb KB" -ForegroundColor White
Write-Host " Compression / Saved       : $saved%" -ForegroundColor Green
Write-Host " .min.css & .min.js files  : Generated for all projects" -ForegroundColor Green
Write-Host " HTML structure            : Clean line structure preserved with .min.* references" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
