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
- `migrate.js` sadece `001_initial.sql` çalıştırıyor, 002/003/004 muhtemelen elle uygulanmış. Düzgün migration runner (örn. node-pg-migrate) eklemek teknik borç
- Fotoğraflar `repairs.photo_data TEXT` (base64) olarak DB'de — 100+ tenant'ta büyük bottleneck olur. GCS'e taşınması teknik borç
- API container daha önce Exit 137 (muhtemelen OOM) yaşadı, `docker compose up -d api` ile kalktı. RAM monitoring/limit yok

---

## Sunucu / GCloud Notları
- **External IP:** `8.229.228.187`
- **SSH:** `ssh root@8.229.228.187` (memory'de `paabhost` alias olarak da geçer)
- **DB konteynerı:** `paabyonetim-db` (Postgres 16-alpine), şu an host'a port mapping YOK (sadece Docker network)
- **psql ile içeri girmek:** `docker exec -it paabyonetim-db psql -U postgres -d paabyonetim`
- **pgAdmin için (henüz kurulmadı):** SSH tunnel + docker-compose'a `127.0.0.1:5432:5432` port mapping eklemek gerekecek. Tunnel: `ssh -L 5433:localhost:5432 root@8.229.228.187`. pgAdmin host: `127.0.0.1:5433`. Parola: `/opt/paabyonetim/.env` içinde `DB_PASSWORD`
- **DB durumu (2026-04-30):** sadece 2 bina var → id=1 (`test`, PaaBYonetim Merkez), id=11 (`turhangiller`, Turhangiller Sitesi). Önceki mükerrer kayıtlar temizlendi.

---

## Multi-Tenant Mimari Kararları (kalıcı)

### Pattern: Shared DB + Shared Schema (mevcut yapı korunacak)
- DB-per-tenant ve K8s namespace-per-tenant değerlendirildi, **100-150 müşteri ölçeği için ekonomik/operasyonel olarak makul değil** (~10-20× maliyet artışı, tek dev için imkansız operasyon yükü)
- Stripe, Notion, Linear, Salesforce de shared schema kullanıyor
- KVKK uyumu shared schema ile mümkün

### Per-Tenant Özellik Farklılaştırma: Feature Flags + Plan Tiers
- "turhangiller messaging istemiyor, ahmetgiller istiyor" gibi senaryolar **kod fork'lama YAPMADAN** çözülecek
- DB'de `buildings.features` JSONB → runtime'da farklı davranış, tek codebase
- Plan tier'ları (Başlangıç/Pro/Kurumsal) zaten landing page'de tanımlı, feature'lar bunlara bağlanacak
- Custom request → uygun plan'a upsell, müşteriye özel kod yazılmayacak

### Ölçek Yol Haritası
- **Tier 1 (mevcut, 0-30 tenant):** tek GCloud VM + Docker compose + Postgres in container
- **Tier 2 (30-200 tenant):** Cloud Run + Cloud SQL Postgres + GCS (fotoğraflar)
- **Tier 3 (200+ tenant):** + read replica + Redis cache
- **K8s'ye geçiş:** sadece operasyonel ihtiyaç (zero-downtime deploy, multi-region) ortaya çıkınca. İzolasyon için DEĞİL

---

## Devam Eden İş — Son Oturum: 2026-04-30

### ✅ Tamamlananlar
1. **DB temizliği:** Mükerrer 12 adet "PaaBYonetim Merkez" satırı silindi. Şu an sadece id=1 (test) ve id=11 (turhangiller) var
2. **Migration idempotent:** `001_initial.sql`'deki seed insert'ler `WHERE NOT EXISTS` pattern'ı ile düzeltildi. Test edildi: `migrate.js` 2× arka arkaya çalıştırıldı, mükerrer eklemedi
   - Backend commit: `f9bef70` (`fix(migration): seed insert'leri idempotent yap`)
   - Admin user'ın `building_id`'si artık hardcoded `1` değil, subquery ile dinamik

### ⏳ Kaldığımız Yer — Karar Bekleniyor
Aşağıdaki iki seçenek arasında karar verilecek:

**Seçenek A (önerilen) — Önce Feature Flags, Sonra RLS**
- Süre: feature flags ~yarım gün, RLS ayrı oturumda 1 gün
- Sebep: kullanıcının asıl problemi (per-tenant feature variation) feature flag'lerle çözülür. RLS daha riskli refactor, ayrı düşünülmesi daha güvenli

**Seçenek B — Önce RLS, Sonra Feature Flags**
- Risk: RLS yanlış kurulursa app çöker (turhangiller production'da)

### Sonraki Adım Detayları (Seçenek A için)

**1. Feature flags (yarım gün):**
- Yeni migration: `buildings` tablosuna `plan VARCHAR(20)`, `features JSONB`, `settings JSONB` kolonları
- `/api/tenant` endpoint'i bu alanları dönsün
- Frontend: `TenantContext` + `useTenant()` hook
- Backend: `requireFeature(key)` middleware
- Sidebar / route koşullu render
- Test senaryosu: turhangiller'da messaging kapalı, test'te açık

**2. RLS (sonra, 1 gün):**
- Yeni DB role (`paabyonetim_app`, superuser değil)
- pg pool helper: her request için tenant context'li client (her query'de `SET app.tenant_id`)
- Tüm route'lar `req.db.query()` kullanacak şekilde refactor (17+ dosya)
- RLS enable + policy migration
- Test: yanlış tenant'a query DB seviyesinde reddedilsin

### Yeni Oturuma Başlarken
1. Bu CLAUDE.md'yi oku
2. Memory'deki `project_paab.md`'yi de oku
3. Kullanıcıya "Seçenek A mı B mi?" diye sor (varsayılan: A)
4. Karar gelince hemen implementasyona başla — plan zaten yukarıda hazır
