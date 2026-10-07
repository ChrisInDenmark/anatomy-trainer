$ErrorActionPreference = "Stop"
$base = Join-Path $PSScriptRoot "images"
New-Item -ItemType Directory -Force -Path $base | Out-Null
$headers = @{ "User-Agent" = "AnatomyTrainerPersonalStudy/0.5 (personal study app)" }

$images = @(
    @{ Local="supraspinatus.png"; Remote="Supraspinatus muscle back3.png" },
    @{ Local="infraspinatus.png"; Remote="Infraspinatus muscle back2.png" },
    @{ Local="teres-minor.png"; Remote="Teres minor muscle back.png" },
    @{ Local="subscapularis.png"; Remote="Subscapularis muscle frontal.png" },
    @{ Local="deltoid.png"; Remote="Deltoid muscle top.png" },
    @{ Local="biceps.png"; Remote="Biceps brachii muscle01.png" },
    @{ Local="brachialis.png"; Remote="Brachialis muscle01.png" },
    @{ Local="coracobrachialis.png"; Remote="Coracobrachialis muscle01.png" },
    @{ Local="triceps.png"; Remote="Triceps brachii muscle07.png" },
    @{ Local="pectoralis-major.png"; Remote="Gray410.png" },
    @{ Local="latissimus-dorsi.png"; Remote="Latissimus dorsi muscle back2.png" },
    @{ Local="teres-major.png"; Remote="Teres major muscle back.png" },
    @{ Local="serratus-anterior.png"; Remote="Serratus anterior muscles top.png" },
    @{ Local="trapezius.svg"; Remote="Trapezius muscle.svg" },
    @{ Local="rhomboid-major.png"; Remote="Rhomboid major muscle back.png" },
    @{ Local="rhomboid-minor.png"; Remote="Rhomboid minor muscle back.png" },
    @{ Local="levator-scapulae.png"; Remote="Levator scapulae muscle back.png" },
    @{ Local="pectoralis-minor.png"; Remote="Pectoralis minor muscle and shoulder blade.png" },
    @{ Local="subclavius.png"; Remote="Subclavius muscle frontal.png" },
    @{ Local="anconeus.png"; Remote="Gray — musculus anconeus.png" }
)

$ok=0
$skipped=0
$failed=@()

function Get-HttpStatusCode($err) {
    try { return [int]$err.Exception.Response.StatusCode } catch { return 0 }
}

foreach ($i in $images) {
    $out = Join-Path $base $i.Local

    # Continue where a previous run stopped.
    if ((Test-Path $out) -and ((Get-Item $out).Length -gt 1000)) {
        Write-Host "Already have $($i.Local) - skipping." -ForegroundColor DarkGreen
        $skipped++
        continue
    }

    $success=$false
    for ($attempt=1; $attempt -le 4 -and -not $success; $attempt++) {
        try {
            Write-Host "Resolving $($i.Remote) (attempt $attempt)..."
            $title = "File:" + $i.Remote

            # Ask Commons for a 1400px thumbnail URL. This is plenty for a phone/web flashcard
            # and avoids repeatedly requesting very large original files.
            $api = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=1400&titles=" + [uri]::EscapeDataString($title)
            $meta = Invoke-RestMethod -Uri $api -Headers $headers
            $page = $meta.query.pages.PSObject.Properties.Value | Select-Object -First 1

            if (-not $page.imageinfo) { throw "Commons did not return image information." }
            $info=$page.imageinfo[0]
            $url=$info.thumburl
            if (-not $url) { $url=$info.url }
            if (-not $url) { throw "Commons did not return a usable image URL." }

            Start-Sleep -Seconds 3
            Write-Host "  Downloading -> $($i.Local)"
            Invoke-WebRequest -Uri $url -OutFile $out -Headers $headers

            if ((Get-Item $out).Length -lt 1000) {
                Remove-Item $out -Force
                throw "Downloaded file was unexpectedly small."
            }

            $ok++
            $success=$true
            Write-Host "  OK" -ForegroundColor Green
            Start-Sleep -Seconds 5
        }
        catch {
            if (Test-Path $out) { Remove-Item $out -Force }
            $status=Get-HttpStatusCode $_
            if ($status -eq 429 -or $_.Exception.Message -match "429|Too Many Requests|Too many requests") {
                $wait=30*$attempt
                Write-Host "  Wikimedia rate limit. Waiting $wait seconds before retry..." -ForegroundColor Yellow
                Start-Sleep -Seconds $wait
            } else {
                Write-Host "  Attempt failed: $($_.Exception.Message)" -ForegroundColor Yellow
                if ($attempt -lt 4) { Start-Sleep -Seconds 10 }
            }
        }
    }

    if (-not $success) {
        $failed += $i.Remote
        Write-Host "  FAILED after retries: $($i.Remote)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "New downloads: $ok"
Write-Host "Already present: $skipped"
Write-Host "Ready locally: $($ok + $skipped) of $($images.Count)"

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Still missing:" -ForegroundColor Yellow
    $failed | ForEach-Object { Write-Host " - $_" }
    Write-Host "You can run GET-IMAGES.bat again later; completed files will be skipped."
} else {
    Write-Host ""
    Write-Host "SUCCESS - all local anatomy images are ready for GitHub." -ForegroundColor Green
}
Write-Host ""
Write-Host "Press Enter to close."
Read-Host
