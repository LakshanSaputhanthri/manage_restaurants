<#
.SYNOPSIS
    PowerShell equivalent of the project Makefile (make is not available on Windows by default).

.USAGE
    .\build.ps1 <target>

.TARGETS
    run                   Run both dev servers (backend on :8000, frontend on :5173/:3000)
    run-backend           Run Django dev server
    run-frontend          Run Vite dev server
    install               Install/refresh backend + frontend dependencies
    install-backend
    install-frontend
    lint                  Lint check (no changes written)
    lint-backend
    lint-frontend
    lint-fix              Lint fix (auto-fixable issues only)
    lint-fix-backend
    lint-fix-frontend
    type-check            Type check (no changes written)
    type-check-backend
    type-check-frontend
    type-fix              Lint-fix + re-run type checks
    type-fix-backend
    type-fix-frontend
#>

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$Target
)

$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$Backend = Join-Path $RepoRoot "backend"
$Frontend = Join-Path $RepoRoot "frontend"

function Invoke-Npm {
    param([string[]]$NpmArgs)
    Push-Location $Frontend
    try {
        & npm @NpmArgs
        if ($LASTEXITCODE -ne 0) { throw "npm $($NpmArgs -join ' ') failed with exit code $LASTEXITCODE" }
    }
    finally {
        Pop-Location
    }
}

function Invoke-Uv {
    param([string[]]$UvArgs)
    & uv --directory $Backend @UvArgs
    if ($LASTEXITCODE -ne 0) { throw "uv $($UvArgs -join ' ') failed with exit code $LASTEXITCODE" }
}

switch ($Target) {
    "run" {
        Write-Host "Starting backend and frontend in separate windows..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PSCommandPath' run-backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PSCommandPath' run-frontend"
    }
    "run-backend" {
        Invoke-Uv @("run", "manage.py", "runserver")
    }
    "run-frontend" {
        Invoke-Npm @("run", "dev", "--", "--port", "3000")
    }

    "install" {
        & $PSCommandPath install-backend
        & $PSCommandPath install-frontend
    }
    "install-backend" {
        Invoke-Uv @("sync")
    }
    "install-frontend" {
        Invoke-Npm @("install")
    }

    "lint" {
        & $PSCommandPath lint-backend
        & $PSCommandPath lint-frontend
    }
    "lint-backend" {
        Invoke-Uv @("run", "ruff", "check", ".")
    }
    "lint-frontend" {
        Invoke-Npm @("run", "lint")
    }

    "lint-fix" {
        & $PSCommandPath lint-fix-backend
        & $PSCommandPath lint-fix-frontend
    }
    "lint-fix-backend" {
        Invoke-Uv @("run", "ruff", "check", "--fix", ".")
    }
    "lint-fix-frontend" {
        Invoke-Npm @("run", "lint:fix")
    }

    "type-check" {
        & $PSCommandPath type-check-backend
        & $PSCommandPath type-check-frontend
    }
    "type-check-backend" {
        Invoke-Uv @("run", "mypy", ".")
    }
    "type-check-frontend" {
        Invoke-Npm @("run", "type-check")
    }

    "type-fix" {
        & $PSCommandPath type-fix-backend
        & $PSCommandPath type-fix-frontend
    }
    "type-fix-backend" {
        & $PSCommandPath lint-fix-backend
        Invoke-Uv @("run", "mypy", ".")
    }
    "type-fix-frontend" {
        & $PSCommandPath lint-fix-frontend
        Invoke-Npm @("run", "type-check")
    }

    default {
        Write-Error "Unknown target: $Target`nRun 'Get-Help .\build.ps1 -Detailed' to see available targets."
        exit 1
    }
}
