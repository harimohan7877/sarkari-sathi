@echo off
echo ============================================
echo  Sarkari Saathi V3 — Deploy Script
echo ============================================
echo.

cd /d "c:\Users\Admin\Downloads\sarkari sathi\sarkari-saathi"

echo [1/5] Installing packages...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Staging all changes...
git add -A

echo.
echo [3/5] Committing...
git commit -m "feat: V3.0 complete - Auth, Supabase, Payment, Dashboard, Chat limits" 2>nul || echo (Nothing new to commit, continuing...)

echo.
echo [4/5] Pushing to GitHub (if remote is set)...
git push origin main 2>nul || git push origin master 2>nul || echo (No git remote - skipping push)

echo.
echo [5/5] Deploying to Vercel...
call npx vercel --prod --yes

echo.
echo ============================================
echo  Deploy complete!
echo ============================================
pause
