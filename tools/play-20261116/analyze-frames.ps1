Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\szk27\work\dopagaki-skills\corpus\private\play-20261116"
$files = 0..7 | ForEach-Object { Join-Path $dir ("adm-wick-f{0}.png" -f $_) }
$rows = @()
foreach ($f in $files) {
  $bmp = [System.Drawing.Bitmap]::FromFile($f)
  $n = 0; $sumR = 0; $sumG = 0; $sumB = 0; $satSum = 0
  $hueBins = New-Object 'int[]' 12
  # ゲーム本体 iframe の領域だけを見る（ページ全体だと背景の灰色に薄まる）
  $x0 = 666; $y0 = 276; $x1 = 1026; $y1 = 916
  for ($y = $y0; $y -lt $y1; $y += 4) {
    for ($x = $x0; $x -lt $x1; $x += 4) {
      $c = $bmp.GetPixel($x, $y)
      $sumR += $c.R; $sumG += $c.G; $sumB += $c.B
      $max = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
      $min = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
      $v = $max / 255.0
      $s = if ($max -eq 0) { 0 } else { ($max - $min) / [double]$max }
      $satSum += $s
      if ($s -gt 0.35 -and $v -gt 0.2) {
        $h = 0.0
        $d = [double]($max - $min)
        if ($max -eq $c.R) { $h = 60 * ((($c.G - $c.B) / $d) % 6) }
        elseif ($max -eq $c.G) { $h = 60 * ((($c.B - $c.R) / $d) + 2) }
        else { $h = 60 * ((($c.R - $c.G) / $d) + 4) }
        if ($h -lt 0) { $h += 360 }
        $bin = [int]([Math]::Floor($h / 30)) % 12
        $hueBins[$bin]++
      }
      $n++
    }
  }
  $bmp.Dispose()
  $meanR = [Math]::Round($sumR / $n, 1)
  $meanG = [Math]::Round($sumG / $n, 1)
  $meanB = [Math]::Round($sumB / $n, 1)
  $meanSat = [Math]::Round($satSum / $n, 3)
  $bins = ($hueBins | ForEach-Object { [Math]::Round(100.0 * $_ / [Math]::Max(1, ($hueBins | Measure-Object -Sum).Sum), 1) }) -join ","
  $rows += [pscustomobject]@{
    frame   = [System.IO.Path]::GetFileName($f)
    meanR   = $meanR
    meanG   = $meanG
    meanB   = $meanB
    meanSat = $meanSat
    hue30degPct = $bins
  }
}
$rows | ConvertTo-Json -Depth 3
