param([string]$Round)
$dir = "C:\Users\szk27\work\dopagaki-skills\tools\play-20261116"
$exe = "C:\Users\szk27\.local\share\ego\active_version_dir\ego-browser.exe"
$log = Join-Path $dir ("round-$Round.log")
& $exe nodejs -e "await import('file:///C:/Users/szk27/work/dopagaki-skills/tools/play-20261116/round-$Round.mjs')" *>&1 | Out-File -FilePath $log -Encoding utf8
"EXIT=$LASTEXITCODE"
(Get-Content $log).Count
