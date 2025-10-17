# IRIS Implementation System Initialization Script (Windows PowerShell)
# This script sets up the complete implementation tracking system

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   IRIS IMPLEMENTATION SYSTEM INITIALIZATION   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Creating directory structure..." -ForegroundColor Yellow

# Create implementation directories
$directories = @(
    "docs/implementation/feature/design-system",
    "docs/implementation/feature/authentication",
    "docs/implementation/feature/user-management",
    "docs/implementation/feature/npi",
    "docs/implementation/feature/snomed",
    "docs/implementation/feature/shared-architecture",
    "docs/implementation/tracking",
    "docs/implementation/templates",
    ".claude/commands",
    "scripts",
    "packages/ui-components/atoms",
    "packages/ui-components/molecules",
    "packages/ui-components/organisms",
    "packages/ui-components/templates",
    "packages/contexts",
    "packages/services",
    "packages/theme",
    "apps/mobile/src/screens/auth",
    "apps/mobile/src/screens/users",
    "apps/mobile/src/screens/npi",
    "apps/mobile/src/screens/snomed",
    "apps/desktop/src/app/auth",
    "apps/desktop/src/app/users",
    "apps/desktop/src/app/npi",
    "apps/desktop/src/app/snomed"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "✓ Directory structure created" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Initializing tracking files if needed..." -ForegroundColor Yellow

# Initialize implementation-log.json
$implLogPath = "docs/implementation/tracking/implementation-log.json"
if (!(Test-Path $implLogPath)) {
    $implLog = @{
        projectInfo = @{
            name = "IRIS"
            version = "0.1.0"
            startDate = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
            lastUpdated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        }
        implementations = @()
        statistics = @{
            totalImplementations = 0
            completed = 0
            inProgress = 0
            pending = 0
        }
        nextId = "impl-001"
    }
    $implLog | ConvertTo-Json -Depth 10 | Set-Content $implLogPath
    Write-Host "✓ Created implementation-log.json" -ForegroundColor Green
} else {
    Write-Host "✓ implementation-log.json already exists" -ForegroundColor Green
}

# Initialize task-queue.json
$taskQueuePath = "docs/implementation/tracking/task-queue.json"
if (!(Test-Path $taskQueuePath)) {
    $taskQueue = @{
        lastUpdated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        queue = @()
        completedTasks = @()
        statistics = @{
            totalTasks = 0
            pending = 0
            inProgress = 0
            completed = 0
        }
    }
    $taskQueue | ConvertTo-Json -Depth 10 | Set-Content $taskQueuePath
    Write-Host "✓ Created task-queue.json" -ForegroundColor Green
} else {
    Write-Host "✓ task-queue.json already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Checking Claude commands..." -ForegroundColor Yellow

# List available Claude commands
$commandsPath = ".claude/commands"
if (Test-Path $commandsPath) {
    Write-Host "Available Claude commands:" -ForegroundColor White
    $commands = Get-ChildItem -Path $commandsPath -Filter "*.md"
    foreach ($cmd in $commands) {
        $cmdName = [System.IO.Path]::GetFileNameWithoutExtension($cmd.Name)
        Write-Host "  /$cmdName" -ForegroundColor Green
    }
} else {
    Write-Host "No Claude commands found. Creating commands directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $commandsPath -Force | Out-Null
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✨ IRIS Implementation System Ready!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Run 'claude /update-figma' to sync with latest designs"
Write-Host "2. Run 'claude /check-progress' to see current status"
Write-Host "3. Run 'claude /execute-next' to start implementing"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor White
Write-Host "- Main hub: docs/implementation/README.md"
Write-Host "- Design System: docs/implementation/feature/design-system/README.md"
Write-Host "- Task Queue: docs/implementation/tracking/task-queue.json"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan