# PAAB Yönetim — Proje Bağlamı (Claude için)

## Proje Nedir?
Türkçe apartman/site yönetim SaaS sistemi. Çok kiracılı (multi-tenant) mimari — her bina `subdomain.paabyonetim.com` üzerinden erişir (örn. `turhangiller.paabyonetim.com`).

## Repolar
| Repo | Yerel Klasör | GitHub |
|------|-------------|--------|
| Frontend (React/Vite) | `C:\Users\beko\Downloads\BAPyonetim\BAPyonetim` | `berkcnarsln/paabyonetim-web` |
| Backend (Node.js/Express/PostgreSQL) | `C:\Users\beko\Downloads\PaaBYonetim-backend` | `berkcnarsln/paabyonetim-backend` |

## Deployment
- **Frontend:** GitHub Actions otomatik deploy eder — `main`'e push → build → SCP → `/var/www/paabyonetim` → nginx reload
- **Backend:** Manuel — sunucuda `cd /opt/paabyonetim && git pull` + `docker restart` veya `nginx -s reload`
- **Sunucu:** `root@paabhost`, SSH ile bağlanılıyor
- **Docker:** `docker exec paabyonetim-nginx nginx -s reload`, `docker exec paabyonetim-api ...`

## Tech Stack
- Frontend: React 18 + Vite, inline style objeler (`const s = {...}`)
- Backend: Node.js + Express + PostgreSQL (`pg` paketi)
- Auth: JWT, localStorage (`paab_token`, `paab_user`, `paab_last_active`)
- Fonts: Syne (başlıklar), DM Sans (gövde), Playfair Display (landing hero)
- Tema: CSS custom properties, dark/light toggle

## Proje Yapısı (Frontend)
```
src/
  pages/
    LandingPage.jsx / .css   — paabyonetim.com ana sayfası
    AdminDashboard.jsx        — yönetici paneli (tüm modüller tek dosyada)
    ResidentDashboard.jsx     — sakin paneli (tüm modüller tek dosyada)
    Login.jsx
  components/
    Sidebar.jsx               — navigasyon, şifre değiştir modal
    Logo.jsx                  — SVG logo, hideText prop'u var
  api/
    client.js                 — axios instance, subdomain → X-Tenant header
```

## Önemli Kararlar ve Geçmiş Değişiklikler

### Session Timeout
- 5 dakika inaktivite → otomatik çıkış
- Sayfa yenilenince de kontrol eder (`paab_last_active` localStorage)
- `App.jsx`'te `INACTIVITY_MS = 5 * 60 * 1000`

### Fotoğraf Yükleme (Arızalar)
- Frontend: canvas ile sıkıştırılıyor (max 1200px, %80 JPEG kalitesi, ~200-400KB)
- Base64 olarak gönderiliyor: `photo_data` (string), `photo_type` (mime)
- Backend: `repairs` tablosunda `photo_data TEXT`, `photo_type VARCHAR(100)` kolonları var (migration 004)
- nginx `client_max_body_size 15m` — önemli, default 1MB yetersizdi

### PDF Rapor
- `RaporlarContent`'te "Yazdır / PDF" butonu popup pencere açıyor
- Beyaz arka planlı temiz HTML, `window.print()` otomatik tetikleniyor
- Dark tema değil, yazdırmaya uygun

### Landing Page
- `/` (subdomain yok) → LandingPage gösterilir
- Stats count-up animasyonu (IntersectionObserver)
- Sürüklenebilir testimonials carousel (scroll-snap yok, mouse drag)
- Fiyatlandırma: daire başı (Başlangıç ₺15/daire max 15, Pro ₺35/daire)
- WhatsApp butonu (numara henüz eklenmedi: `https://wa.me/90XXXXXXXXXX`)

### Nginx (nginx.ssl.conf)
- `*.paabyonetim.com` wildcard SSL
- `api.paabyonetim.com` → Docker API container'a proxy
- JS/CSS dosyaları 1 yıl cache (`Cache-Control: immutable`) — Vite hash'li dosya isimleri sayesinde sorun olmaz
- `client_max_body_size 15m` eklendi (fotoğraf yükleme için)

## Sık Kullanılan Komutlar (Sunucuda)

```bash
# Backend pull + nginx reload
cd /opt/paabyonetim && git pull
docker exec paabyonetim-nginx nginx -s reload

# Migration çalıştır
docker exec paabyonetim-api node -e "
  const db=require('./src/db');
  db.query('SQL BURAYA').then(()=>{console.log('OK');process.exit(0)})
"

# Container logları
docker logs paabyonetim-api --tail 50
docker logs paabyonetim-nginx --tail 20
```

## Veritabanı Önemli Tablolar
- `buildings` — `subdomain` kolonu ile tenant tanımlama
- `apartments` — `building_id`, `unit_number`, `block`
- `users` — `role` (admin/resident), `building_id`, `apartment_id`
- `repairs` — `photo_data TEXT`, `photo_type VARCHAR(100)` (migration 004 ile eklendi)
- `payments`, `expenses`, `announcements`, `surveys`, `reservations`, `visitors`, `documents`, `messages`, `staff`, `maintenance_tasks`

## Bilinen Sorunlar / Dikkat Edilecekler
- Backend'in GitHub Actions'ı yok, her değişiklik için sunucuya manuel git pull gerekiyor
- `src/app.js`, `src/routes/` altında commit edilmemiş dosyalar var (sunucuda çalışıyor ama repoda yok)
- WhatsApp numarası placeholder (`90XXXXXXXXXX`)
- Landing page stats verileri placeholder
