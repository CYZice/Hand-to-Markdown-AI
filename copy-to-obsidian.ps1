param(
    [string]$DestinationRoot = "D:\Obsidian\ABCDE\.obsidian\plugins\Ink2Vault"
)

$sourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$sourceMain = Join-Path $sourceRoot "main.js"
if (-not (Test-Path $sourceMain)) { throw "未找到源文件: $sourceMain" }

$sourceStyle = Join-Path $sourceRoot "style.css"
if (-not (Test-Path $sourceStyle)) {
    $sourceStyle = Join-Path $sourceRoot "styles.css"
}
if (-not (Test-Path $sourceStyle)) { throw "未找到源文件: $sourceStyle" }

New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null

Copy-Item -Path $sourceMain -Destination (Join-Path $DestinationRoot "main.js") -Force
Copy-Item -Path $sourceStyle -Destination (Join-Path $DestinationRoot "style.css") -Force

Write-Host "已复制 main.js 到 $DestinationRoot"
Write-Host "已复制 style.css 到 $DestinationRoot"
