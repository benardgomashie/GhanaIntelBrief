# PowerShell script to generate simple placeholder PWA icons
# Uses .NET System.Drawing to create basic Ghana flag colored icons

Add-Type -AssemblyName System.Drawing

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$scriptPath = $PSScriptRoot
$outputPath = Join-Path $scriptPath "public"

# Ensure output directory exists
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
}

# Ghana flag colors
$red = [System.Drawing.Color]::FromArgb(239, 68, 68)
$yellow = [System.Drawing.Color]::FromArgb(252, 211, 77)
$green = [System.Drawing.Color]::FromArgb(34, 197, 94)
$black = [System.Drawing.Color]::Black
$white = [System.Drawing.Color]::White

foreach ($size in $sizes) {
    Write-Host "Generating ${size}x${size} icon..." -ForegroundColor Cyan
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Draw Ghana flag horizontal stripes
    $stripeHeight = $size / 3
    $redBrush = New-Object System.Drawing.SolidBrush($red)
    $yellowBrush = New-Object System.Drawing.SolidBrush($yellow)
    $greenBrush = New-Object System.Drawing.SolidBrush($green)
    
    $graphics.FillRectangle($redBrush, 0, 0, $size, $stripeHeight)
    $graphics.FillRectangle($yellowBrush, 0, $stripeHeight, $size, $stripeHeight)
    $graphics.FillRectangle($greenBrush, 0, $stripeHeight * 2, $size, $stripeHeight)
    
    # Draw black star in center
    $centerX = $size / 2
    $centerY = $size / 2
    $starSize = $size * 0.25
    
    $starBrush = New-Object System.Drawing.SolidBrush($black)
    $starPoints = @()
    for ($i = 0; $i -lt 10; $i++) {
        $angle = ($i * [Math]::PI / 5) - ([Math]::PI / 2)
        $radius = if ($i % 2 -eq 0) { $starSize } else { $starSize * 0.4 }
        $x = $centerX + [Math]::Cos($angle) * $radius
        $y = $centerY + [Math]::Sin($angle) * $radius
        $starPoints += New-Object System.Drawing.PointF($x, $y)
    }
    $graphics.FillPolygon($starBrush, $starPoints)
    
    # Draw "GIB" text at bottom
    if ($size -ge 128) {
        $fontSize = [Math]::Max(12, $size / 10)
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush($white)
        $textFormat = New-Object System.Drawing.StringFormat
        $textFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $textFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        
        $textRect = New-Object System.Drawing.RectangleF(0, ($size * 0.75), $size, ($size * 0.25))
        $graphics.DrawString("GIB", $font, $textBrush, $textRect, $textFormat)
    }
    
    # Save the icon
    $filename = Join-Path $outputPath "icon-${size}x${size}.png"
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "✓ Created $filename" -ForegroundColor Green
}

Write-Host "`nAll PWA icons generated successfully!" -ForegroundColor Green
Write-Host "Icons saved in: $outputPath" -ForegroundColor Cyan
