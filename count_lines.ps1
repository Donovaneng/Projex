$files = Get-ChildItem -Path 'c:\xampp\htdocs\projex\projex_frontend\src' -Recurse | Where-Object { $_.Extension -in '.js','.jsx' }
$lines = 0
foreach ($file in $files) {
    $lines += (Get-Content $file.FullName | Measure-Object -Line).Lines
}
$lines | Out-File -FilePath "count_result.txt"