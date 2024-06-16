# Bin directory
$userBin = "$env:USERPROFILE\bin"

# Check if vintner is already installed
if (Get-Command -Name "vintner" -ErrorAction SilentlyContinue) {
    Write-Host "vintner is already installed"
    exit 1
}

# Add bin directory to path
if (-not (Test-Path -Path $userBin)) {
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\bin"

    $userPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
    $newPath = "$userPath$userBin;"
    [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::User)
}

# Version
$version = if ($env:VERSION) { $env:VERSION } else { "latest" }

# Install vintner
Invoke-WebRequest -URI "https://github.com/opentosca/opentosca-vintner/releases/download/$version/vintner-win-x64.exe.xz" -OutFile vintner-win-x64.exe.xz
tar -xf vintner-win-x64.exe.xz
Remove-Item vintner-win-x64.exe.xz
Move-Item vintner-win-x64.exe "$userBin\vintner.exe"

# Init setup
vintner setup init
