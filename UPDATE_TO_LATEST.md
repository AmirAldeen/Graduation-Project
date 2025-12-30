# تحديث المشروع إلى آخر إصدار من GitHub

## المشكلة
المشروع المحلي يحتاج إلى التحديث إلى آخر commit على GitHub (d031f9c).

## الحل - تنفيذ الأوامر التالية في PowerShell:

```powershell
# 1. جلب آخر التغييرات
git fetch origin

# 2. إعادة تعيين المشروع المحلي ليطابق آخر commit على GitHub
git reset --hard origin/main

# 3. التحقق من الحالة
git status
```

## أو استخدام hash الـ commit مباشرة:

```powershell
git reset --hard d031f9c
```

## ملاحظة
إذا ظهرت رسالة "Log file is already in use" أو pager (less)، اضغط `q` للخروج من pager ثم نفذ الأمر مرة أخرى.

## آخر commit على GitHub:
- **Hash**: d031f9c
- **الرسالة**: "fixing the Adding Post Problem"
- **المؤلف**: AhmedSenan
- **الوقت**: منذ 32 ساعة

