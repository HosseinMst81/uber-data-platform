# uber-data-platform
# پروژه پایانی پایگاه داده پیشرفته – پلتفرم هوشمند تحلیل داده‌های Uber

**دانشگاه اصفهان – مهندسی کامپیوتر**  
**ترم پاییز ۱۴۰۳ – درس پایگاه داده پیشرفته**  
**استاد راهنما: دکتر محمدعلی نعمت‌بخش**  
**دستیاران آموزشی: علی معینیان، بهنام صوفی**  
**دانشجو: حسین**  
**تاریخ تحویل: ۱۹ بهمن ۱۴۰۳**

## چکیده پروژه

این پروژه یک پلتفرم کامل تحلیل داده‌های تراکنش‌های Uber در سال ۲۰۲۴ (با ۱۴۸,۷۷۰ رکورد) است که با استفاده از معماری Medallion (Bronze → Silver → Gold) پیاده‌سازی شده. هدف اصلی، تبدیل داده خام به داده آماده تحلیل، ایجاد داشبورد تعاملی، پیاده‌سازی API CRUD، دستیار هوشمند Text-to-SQL با مدل‌های رایگان، بهینه‌سازی عملکرد با ایندکس‌گذاری و جستجوی معنایی روی دلایل لغو سفر با Vector Database بود.

## ویژگی‌های اصلی پروژه

- معماری Medallion کامل (Bronze: داده خام، Silver: پاک‌سازی و مهندسی ویژگی، Gold: داده نهایی آماده تحلیل)
- API CRUD روی لایه Gold با Node.js + Express
- داشبورد تعاملی با شاخص‌های کلیدی عملکرد (KPIها) و نمودارهای متنوع (Pie، Bar، Line)
- دستیار هوشمند Text-to-SQL با مدل Llama از طریق OpenRouter (فقط SELECT امن + LIMIT + Schema Injection)
- بهینه‌سازی عملکرد با ایندکس‌گذاری و مقایسه زمان اجرا با EXPLAIN ANALYZE
- جستجوی معنایی روی دلایل لغو سفر با Chroma DB (Semantic Search + Top-5 مشابه)
- فرانت‌اند مدرن با React + Tailwind CSS + Shadcn/ui

## تکنولوژی‌های استفاده‌شده

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (لایه‌های Bronze، Silver، Gold)
- **Frontend**: React + Tailwind CSS + Shadcn/ui
- **AI & LLM**: OpenRouter (مدل Llama 3.3 70B Instruct) برای Text-to-SQL
- **Vector DB**: Chroma DB برای جستجوی معنایی
- **سایر**: Axios, Lucide Icons, React-Syntax-Highlighter, UUID

## ساختار پروژه
uber-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── index.js
│   ├── scripts/               ← اسکریپت‌های ETL (Bronze, Silver, Gold)
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── database/
│   └── original_dataset.csv   ← داده خام Uber
└── README.md

## نحوه راه‌اندازی پروژه

### پیش‌نیازها
- Node.js v18+ و npm/yarn
- PostgreSQL 15+ (با دیتابیس `uber_db` و کاربر/پسورد مناسب)
- کلید API از OpenRouter (رایگان)

### مراحل راه‌اندازی

1. **کلون کردن ریپازیتوری**
   ```bash
   git clone https://github.com/your-username/uber-analysis-platform.git
   cd uber-analysis-platform
   نصب وابستگی‌هاBash# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
تنظیم فایل .env (در backend/)textDB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=uber_db
DB_HOST=localhost
DB_PORT=5432

OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
PORT=5000
اجرای اسکریپت‌های ETL (به ترتیب)Bashcd backend
node scripts/import_bronze.js
node scripts/silver_etl.js
node scripts/gold_etl.js
راه‌اندازی backendBashnodemon src/index.js
راه‌اندازی frontendBashcd frontend
npm run dev
دسترسی
API: http://localhost:5000/api/trips
داشبورد و چت: http://localhost:5173 (یا پورت Vite)


دمو و ارائه

لینک GitHub: https://github.com/your-username/uber-analysis-platform
دمو زنده: (اگر deploy کردی، لینک بده)
ویدیو دمو کوتاه: (اگر ضبط کردی، لینک یوتیوب یا آپارات)
ارائه آنلاین: ۲۰ و ۲۱ بهمن ۱۴۰۳

نکات مهم برای بررسی

تمام مراحل Medallion Architecture پیاده‌سازی شده
CRUD کامل با اعتبارسنجی و مدیریت خطا
Text-to-SQL امن (فقط SELECT + LIMIT + فیلتر سوال غیرمرتبط)
داشبورد تعاملی با فیلتر و نمودارهای واقعی
بهینه‌سازی با ایندکس‌گذاری و مقایسه واقعی زمان اجرا
جستجوی معنایی روی دلایل لغو با Chroma DB

هر سوال یا مشکلی در اجرا داشتی، خوشحال می‌شم کمک کنم:
@hoss3inmostaj3ran0916@gmail.com 
با تشکر از استاد نعمت‌بخش و دستیاران محترم
اسفند ۱۴۰۳ – دانشگاه اصفهان
