@echo off
echo جاري جلب آخر التغييرات من GitHub...
git fetch origin

echo.
echo جاري إعادة تعيين المشروع إلى آخر commit...
git reset --hard origin/main

echo.
echo تم التحديث بنجاح!
echo.
echo آخر commit:
git log -1 --oneline

pause

