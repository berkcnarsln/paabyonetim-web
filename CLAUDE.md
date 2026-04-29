# PAAB Yönetim — Proje Bağlamı (Claude için)

## Proje Nedir?
Türkçe apartman/site yönetim SaaS sistemi. Çok kiracılı (multi-tenant) mimari — her bina `subdomain.paabyonetim.com` üzerinden erişir (örn. `turhangiller.paabyonetim.com`).

## Repolar
| Repo | Yerel Klasör | GitHub |
|------|-------------|--------|
| Frontend (React/Vite) | `C:\Users\beko\Downloads\BAPyonetim\BAPyonetim` | https://github.com/berkcnarsln/paabyonetim-web |
| Backend (Node.js/Express/PostgreSQL) | `C:\Users\beko\Downloads\PaaBYonetim-backend` | https://github.com/berkcnarsln/paabyonetim-backend |

## Deployment
- **Frontend:** GitHub Actions otomatik — `main`'e push → build → SCP → `/var/www/paabyonetim` → nginx reload
- **Backend:** Manuel — sunucuda git pull + docker cp + docker restart
- **Sunucu:** `root@paabhost`, `/opt/paabyonetim/`
- **Önemli:** Backend Docker image'ı `build: .` ile oluşturuluyor. `git pull` tek başına yetmez, dosyaları `docker cp` ile container'a kopyalayıp `docker restart paabyonetim-api` yapmak gerekiyor.

## Sunucuda Backend Güncelleme Komutu (Her Seferinde)
```bash
cd /opt/paabyonetim && git pull
docker cp src/routes/DOSYA.js paabyonetim-api:/app/src/routes/DOSYA.js
docker restart paabyonetim-api
```

## Nginx
```bash
# Config güncellendiyse:
docker exec paabyonetim-nginx nginx -s reload
# NOT: nginx.ssl.conf aktif olan config. nginx.conf'a kopyalanmış durumda:
# cp nginx/nginx.ssl.conf nginx/nginx.conf
```

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
    Sidebar.jsx               — navigasyon (height:100vh, overflowY:auto — scroll çalışır)
    Logo.jsx                  — SVG logo, hideText prop'u var
  api/
    client.js                 — axios instance, subdomain → X-Tenant header
```

## Veritabanı Önemli Tablolar
- `buildings` — `subdomain` kolonu ile tenant tanımlama
- `apartments` — `building_id`, `unit_number`, `block`
- `users` — `role` (admin/resident), `building_id`, `apartment_id`
- `payments` — **`building_id` YOK**, `apartment_id` var → JOIN gerekir
- `repairs` — `photo_data TEXT`, `photo_type VARCHAR(100)` (migration 004 ile eklendi, sunucuda çalıştırıldı)
- `expenses`, `announcements`, `repairs` — `building_id` var

---

## Şimdiye Kadar Yapılanlar (Özet)

### Landing Page (paabyonetim.com)
- Hero başlık: "Apartmanınızı güvenle yönetin." — Playfair Display font, "güvenle" kelimesi gradient
- Stats bölümü: 0'dan hedef sayıya count-up animasyonu (IntersectionObserver)
- Dashboard mockup bölümü
- Testimonials: 7 yorum, yatay sürüklenebilir carousel (scroll-snap YOK, mouse drag)
- Fiyatlandırma: daire başı — Başlangıç ₺15/daire (max 15), Pro ₺35/daire, Kurumsal custom
- Başlangıç planında "İlk 30 gün ücretsiz" badge
- SSS accordion
- Navbar: sol logo + "PAAB Yönetim" yazısı, sağda Özellikler/Fiyatlar/SSS/İletişim
- WhatsApp butonu (numara henüz eklenmedi: `https://wa.me/90XXXXXXXXXX`)
- Footer: Gizlilik Politikası, KVKK linkleri

### Oturum Güvenliği
- 5 dakika inaktivite → otomatik çıkış
- Sayfa yenilenince de son aktivite kontrolü (`paab_last_active` localStorage)

### Fotoğraf Yükleme (Arızalar) — TAMAMLANDI ✓
- **ResidentDashboard:** Arıza formuna "📎 Fotoğraf Ekle" butonu, önizleme, FileReader ile base64
- Gönderide `photo_data` ve `photo_type` backend'e iletiliyor
- Tabloda "Fotoğraf" sütunu — thumbnail'a tıklayınca Blob URL ile tam boyut açılıyor
- **AdminDashboard:** Arıza tablosunda aynı şekilde fotoğraf sütunu
- **Backend:** `repairs.js` POST endpoint photo_data/photo_type destekliyor
- **nginx:** `client_max_body_size 15m` (default 1MB yetmiyordu)
- **DB:** `photo_data TEXT`, `photo_type VARCHAR(100)` kolonları mevcut

### PDF Rapor (Raporlar) — TAMAMLANDI ✓
- AdminDashboard → Raporlar sayfası (sidebar'da en altta, scroll edince görünür)
- Dönem seçimi (ay/yıl) → API'den veri yükleniyor
- "Yazdır / PDF" butonu: Blob URL ile temiz beyaz popup açılıyor
- Popup içeriği: PAAB Yönetim logosu + başlık, dönem bilgisi, gelir/gider/bakiye kartları, aidat durumu, gider kategorileri, arıza özeti, duyuru sayısı
- Auto-print tetikleniyor
- **Backend:** `reports.js` — payments JOIN ile (`payments` tablosunda `building_id` yok!)

---

## Bilinen Kısıtlamalar / Dikkat Edilecekler
- Backend'in GitHub Actions'ı yok — her değişiklik için sunucuda manuel `git pull + docker cp + docker restart` gerekiyor
- `payments` tablosunda `building_id` yok, `apartment_id` var — bu tabloya bina bazlı sorgu yaparken `JOIN apartments` kullanılmalı
- WhatsApp numarası placeholder (`90XXXXXXXXXX`) — ileride değiştirilecek
- Landing page stats verileri placeholder
- nginx.ssl.conf aktif config olarak nginx.conf'a kopyalanmış durumda (`cp nginx/nginx.ssl.conf nginx/nginx.conf`)
