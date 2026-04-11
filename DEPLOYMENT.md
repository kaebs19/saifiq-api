# SaifIQ — Deployment Guide (Contabo VPS)

## المتطلبات
- Ubuntu 22.04 LTS
- Node.js 18+ (`nvm` recommended)
- PostgreSQL 14+
- Redis 6+
- Nginx
- PM2
- Certbot (SSL)

---

## 1. إعداد السيرفر (مرة واحدة)

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# PM2
npm install -g pm2

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# Nginx
sudo apt install -y nginx
sudo systemctl enable nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## 2. إعداد قاعدة البيانات

```bash
sudo -u postgres psql

CREATE USER saifiq_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE saifiq_db OWNER saifiq_user;
GRANT ALL PRIVILEGES ON DATABASE saifiq_db TO saifiq_user;
\q
```

## 3. رفع المشروع

```bash
# API
cd /var/www
git clone https://github.com/YOUR_USERNAME/saifiq-api.git
cd saifiq-api
npm ci --production
mkdir -p logs uploads/questions

# انسخ وعدّل .env
cp .env.production .env
nano .env
# عدّل: DB_PASSWORD, JWT_SECRET, ANTHROPIC_API_KEY

# Dashboard
cd /var/www
git clone https://github.com/YOUR_USERNAME/saifiq-dashboard.git
cd saifiq-dashboard
npm ci
npm run build
```

## 4. إعداد Nginx

```bash
# انسخ الإعداد
sudo cp /var/www/saifiq-api/nginx.conf /etc/nginx/sites-available/saifiq.halmanhaj.com

# عدّل root path للداشبورد
sudo nano /etc/nginx/sites-available/saifiq.halmanhaj.com
# غيّر root إلى: /var/www/saifiq-dashboard/dist

# فعّل الموقع
sudo ln -s /etc/nginx/sites-available/saifiq.halmanhaj.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL (HTTPS)

```bash
sudo certbot --nginx -d saifiq.halmanhaj.com
# اختر redirect HTTP → HTTPS
# التجديد تلقائي
```

بعد SSL، عدّل `nginx.conf`:
- فعّل كتلة `server { listen 443 ssl ... }`
- أو certbot يعدله تلقائياً

## 6. تشغيل API

```bash
cd /var/www/saifiq-api

# أول مرة: seed البيانات الأولية
node scripts/seed-admin.js
node scripts/seed-items.js

# تشغيل مع PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # يعمل auto-start عند إعادة تشغيل السيرفر
```

## 7. التحقق

```bash
# API health
curl https://saifiq.halmanhaj.com/api/v1/
# يجب يرجع: {"status":"ok","app":"SaifIQ API"}

# Dashboard
# افتح https://saifiq.halmanhaj.com في المتصفح

# Socket.io
# يتصل تلقائياً من التطبيق

# Logs
pm2 logs saifiq-api
```

---

## التحديث (كل مرة)

```bash
# طريقة سريعة
cd /var/www/saifiq-api
bash deploy.sh

# أو يدوياً
cd /var/www/saifiq-api
git pull
npm ci --production
pm2 restart saifiq-api

cd /var/www/saifiq-dashboard
git pull
npm ci
npm run build
```

---

## أوامر مفيدة

```bash
# حالة PM2
pm2 status
pm2 logs saifiq-api --lines 50

# إعادة تشغيل
pm2 restart saifiq-api
pm2 reload saifiq-api  # zero-downtime

# PostgreSQL
sudo -u postgres psql -d saifiq_db

# Redis
redis-cli ping

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# SSL renewal
sudo certbot renew --dry-run

# مساحة القرص
df -h
du -sh /var/www/saifiq-api/uploads/
```

---

## Environment Variables المطلوبة

| المتغير | مطلوب | ملاحظة |
|---------|-------|--------|
| `DB_PASSWORD` | ✅ | كلمة مرور PostgreSQL |
| `JWT_SECRET` | ✅ | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `GOOGLE_CLIENT_ID` | ✅ | من Google Cloud Console |
| `APPLE_CLIENT_ID` | ✅ | Bundle ID |
| `APPLE_TEAM_ID` | ✅ | من Apple Developer |
| `APPLE_KEY_ID` | ✅ | من Apple Developer |
| `ANTHROPIC_API_KEY` | اختياري | لتوليد AI |
| `FIREBASE_SERVICE_ACCOUNT` | اختياري | لـ push notifications |

---

## بنية المجلدات على السيرفر

```
/var/www/
├── saifiq-api/           ← Node.js API
│   ├── .env              ← production config
│   ├── ecosystem.config.js
│   ├── uploads/
│   └── logs/
├── saifiq-dashboard/     ← React source + build
│   ├── dist/             ← Nginx يخدم هذا المجلد
│   └── .env.production
```

---

## الدومين (DNS)

أضف A record في DNS:
```
saifiq.halmanhaj.com  →  A  →  YOUR_CONTABO_IP
```

أو إذا الدومين الرئيسي `halmanhaj.com` موجود:
```
saifiq  →  A  →  YOUR_CONTABO_IP
```
