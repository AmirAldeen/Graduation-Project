# تحديث المشروع إلى آخر إصدار من GitHub
Write-Host "جاري جلب آخر التغييرات..." -ForegroundColor Yellow
git fetch origin

Write-Host "جاري إعادة تعيين المشروع إلى آخر commit..." -ForegroundColor Yellow
git reset --hard origin/main

Write-Host "تم التحديث بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "آخر commit:" -ForegroundColor Cyan
git log -1 --oneline

