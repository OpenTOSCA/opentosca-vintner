# Bin directory
$userBin = "$env:USERPROFILE\bin"

# Add bin directory to path
if (-not (Test-Path -Path $userBin)) {
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\bin"

    $userPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
    $newPath = "$userPath$userBin;"
    [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::User)
}

# Download and extract vintner
Invoke-WebRequest -URI https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.xz -OutFile vintner-win-x64.exe.xz
tar -xf vintner-win-x64.exe.xz
rm vintner-win-x64.exe.xz
mv vintner-win-x64.exe $userBin\vintner.exe

# Init setup
vintner setup init
