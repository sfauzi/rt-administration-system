# RT Administration System

> Sistem administrasi RT berbasis web untuk pengelolaan penghuni, rumah, iuran bulanan, dan keuangan perumahan.

**Stack:** Laravel 12 + Filament v4 (Backend & Admin Panel) · MySQL · Next.js 16 App Router (Frontend)

---

## Daftar Isi

- [Overview Sistem](#overview-sistem)
- [Arsitektur](#arsitektur)
- [Fitur Utama](#fitur-utama)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi Backend (Laravel)](#instalasi-backend-laravel)
- [Instalasi Frontend (Next.js)](#instalasi-frontend-nextjs)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [API Endpoint Reference](#api-endpoint-reference)

---

## Overview Sistem

Sistem ini dibangun untuk membantu Ketua RT dalam mengelola administrasi perumahan secara digital, meliputi:

- **Manajemen Rumah** — 20 unit (15 permanen, 5 temporer/kontrakan) beserta histori penghuni
- **Manajemen Penghuni** — data lengkap penghuni tetap dan kontrak, termasuk foto KTP
- **Manajemen Iuran** — iuran satpam (Rp 100.000/bulan) dan kebersihan (Rp 15.000/bulan)
- **Manajemen Pengeluaran** — gaji satpam, token listrik, perbaikan, dan pengeluaran lainnya
- **Laporan Keuangan** — grafik tahunan pemasukan vs pengeluaran, detail per bulan, dan status pembayaran per rumah

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    RT Administration System                 │
├──────────────────────────┬──────────────────────────────────┤
│     Frontend (Next.js)   │      Backend (Laravel)           │
│                          │                                  │
│                          │                                  │
│  ┌─────────────────┐     │  ┌──────────────────────────┐    │
│  │  Next.js 16     │     │  │  Laravel 12              │    │
│  │  App Router     │◄────┤  │  + Filament v4           │    │
│  │  TanStack Query │     │  │  + Sanctum               │    │
│  │  Tailwind CSS   │     │  │                          │    │
│  └─────────────────┘     │  └──────────┬───────────────┘    │
│                          │             │                    │
│  Routes:                 │  ┌──────────▼───────────────┐    │
│  /dashboard              │  │     MySQL Database       │    │
│  /houses                 │  │                          │    │
│  /residents              │  │  users · fee_types       │    │
│  /payments               │  │  houses · residents      │    │
│  /expenses               │  │  house_residents         │    │
│  /reports                │  │  payments · expenses     │    │
│  /login                  │  │  personal_access_tokens  │    │
│  /auth/callback          │  └──────────────────────────┘    │
└──────────────────────────┴──────────────────────────────────┘

Authentication Flow (SSO):
Next.js /login → Laravel /admin/sso/authorize → Filament Login
→ Laravel /admin/sso/callback → Next.js /auth/callback?token=xxx
→ Dashboard (token tersimpan di localStorage)
```

---

## Fitur Utama

- Dashboard dengan grafik bar chart pemasukan vs pengeluaran (12 bulan)
- Line chart tren saldo bulanan
- Status pembayaran per rumah (grid visual)
- Halaman houses: grid kartu, filter occupied/vacant, create & edit form
- Halaman residents: grid kartu dengan foto KTP, create & edit form lengkap
- Halaman payments: tabel per bulan, form pencatatan pembayaran
- Halaman expenses: tabel per bulan, form penambahan pengeluaran
- Halaman reports: ringkasan tahunan + detail per bulan dengan tabel status per rumah
- SSO: login sekali di Filament, Next.js langsung dapat akses

---

## Struktur Proyek

```
rt-administration-system/
├── backend/                          # Laravel 12
│   ├── app/
│   │   ├── Filament/
│   │   │   └── Resources/
│   │   │       ├── HouseResource.php
│   │   │       │   └── RelationManagers/
│   │   │       │       ├── HouseResidentsRelationManager.php
│   │   │       │       └── PaymentsRelationManager.php
│   │   │       ├── ResidentResource.php
│   │   │       ├── PaymentResource.php
│   │   │       ├── ExpenseResource.php
│   │   │       └── FeeTypeResource.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/V1/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── HouseController.php
│   │   │   │       ├── ResidentController.php
│   │   │   │       ├── PaymentController.php
│   │   │   │       ├── ExpenseController.php
│   │   │   │       ├── FeeTypeController.php
│   │   │   │       └── ReportController.php
│   │   │   └── Resources/
│   │   │       ├── HouseResource.php
│   │   │       ├── HouseResidentResource.php
│   │   │       ├── ResidentResource.php
│   │   │       ├── PaymentResource.php
│   │   │       ├── ExpenseResource.php
│   │   │       └── FeeTypeResource.php
│   │   ├── Http/Controllers/
│   │   │   └── SsoController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── House.php
│   │       ├── Resident.php
│   │       ├── HouseResident.php
│   │       ├── Payment.php
│   │       ├── Expense.php
│   │       └── FeeType.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── AdminUserSeeder.php
│   │       ├── FeeTypeSeeder.php
│   │       ├── HouseSeeder.php
│   │       ├── ResidentSeeder.php
│   │       ├── HouseResidentSeeder.php
│   │       ├── PaymentSeeder.php
│   │       └── ExpenseSeeder.php
│   └── routes/
│       ├── api.php
│       └── web.php
│
└── frontend/                         # Next.js 16
    ├── app/
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   ├── page.tsx                  # redirect → /dashboard
    │   ├── login/
    │   │   └── page.tsx
    │   ├── auth/
    │   │   └── callback/
    │   │       └── page.tsx
    │   └── (dashboard)/
    │       ├── layout.tsx            # sidebar + AuthGuard
    │       ├── dashboard/page.tsx
    │       ├── houses/
    │       │   ├── page.tsx
    │       │   ├── new/page.tsx
    │       │   └── [id]/
    │       │       ├── page.tsx
    │       │       ├── edit/page.tsx
    │       │       └── payments/page.tsx
    │       ├── residents/
    │       │   ├── page.tsx
    │       │   ├── new/page.tsx
    │       │   └── [id]/
    │       │       ├── page.tsx
    │       │       └── edit/page.tsx
    │       ├── payments/
    │       │   ├── page.tsx
    │       │   └── new/page.tsx
    │       ├── expenses/
    │       │   ├── page.tsx
    │       │   └── new/page.tsx
    │       └── reports/
    │           ├── page.tsx
    │           └── [month]/page.tsx
    ├── components/
    │   ├── AuthGuard.tsx
    │   ├── houses/
    │   │   └── HouseForm.tsx
    │   └── residents/
    │       └── ResidentForm.tsx
    ├── hooks/
    │   ├── useHouses.ts
    │   ├── useResidents.ts
    │   ├── usePayments.ts
    │   ├── useFeeTypes.ts
    │   ├── useExpenses.ts
    │   └── useReports.ts
    ├── lib/
    │   ├── api.ts
    │   ├── auth-context.tsx
    │   └── query-clients.ts
    └── types/
        └── index.ts
```

---

## Prasyarat

Pastikan semua tool berikut sudah terinstall sebelum memulai:

| Tool | Versi Minimum | Cek Versi |
|---|---|---|
| PHP | 8.2+ | `php --version` |
| Composer | 2.x | `composer --version` |
| Node.js | 18.x+ | `node --version` |
| npm | 9.x+ | `npm --version` |
| MySQL | 8.0+ | `mysql --version` |
| Git | any | `git --version` |

---

## Instalasi Backend (Laravel)

### Langkah 1 — Clone dan masuk ke direktori backend

```bash
git clone https://github.com/sfauzi/rt-administration-system.git
cd rt-administration-system/backend
```

### Langkah 2 — Install PHP dependencies

```bash
composer install
```

### Langkah 3 — Salin dan konfigurasi environment

```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi lokal kamu:

```env
# Application
APP_NAME="RT Admin"
APP_ENV=local
APP_KEY=                              
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:3000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend-rt
DB_USERNAME=root
DB_PASSWORD=your_password

# Secret key untuk sign SSO token — generate dengan: php artisan key:generate --show
SSO_SECRET=

# Berapa lama SSO token valid (detik) — 5 menit cukup
SSO_TOKEN_TTL=300
```

### Langkah 4 — Generate application key

```bash
php artisan key:generate && php artisan key:generate --show 
```

### Langkah 5 — Jalankan migration

```bash
php artisan migrate
```

### Langkah 6 — Jalankan seeder

```bash
# Jalankan semua seeder sekaligus (urutan sudah diatur di DatabaseSeeder)
php artisan db:seed
```

### Langkah 7 — Setup storage link

```bash
php artisan storage:link
```

### Langkah 8 — Verifikasi instalasi backend

```bash
# Jalankan development server
php artisan serve

# Output:
# INFO  Server running on [http://127.0.0.1:8000].
```

Buka browser dan akses:

- **Admin Panel:** `http://127.0.0.1:8000/admin`
- **Login dengan:** `admin@example.com` / `password`

---

## Instalasi Frontend (Next.js)

### Langkah 1 — Masuk ke direktori frontend

```bash
cd ../frontend
# atau dari root:
cd rt-administration-system/frontend
```

### Langkah 2 — Install dependencies

```bash
npm install
```

Packages yang diinstall:

| Package | Fungsi |
|---|---|
| `@tanstack/react-query` | Server state management, caching, auto-refetch |
| `@tanstack/react-query-devtools` | Debug panel untuk query state |
| `axios` | HTTP client ke Laravel API |
| `recharts` | Grafik bar chart dan line chart di dashboard/reports |
| `lucide-react` | Icon set |
| `date-fns` | Formatting tanggal |

### Langkah 3 — Konfigurasi environment

```bash
cp .env.example .env
# atau buat file baru:
touch .env
```

Isi `.env`:

```env
# URL API Laravel (wajib diisi)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1

# URL backend untuk SSO redirect
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

```

### Langkah 4 — Verifikasi instalasi frontend

```bash
npm run dev

# Output:
#   ▲ Next.js 16.x.x
#   - Local:        http://localhost:3000
```

Buka `http://localhost:3000` — seharusnya redirect ke `/login`. Login dengan credential yang sama seperti akses ke panel, jika sudah login maka akan redirect otomatis.

---

## Menjalankan Aplikasi

### Development (dua terminal)

**Terminal 1 — Backend:**

```bash
cd backend
php artisan serve
# Berjalan di http://127.0.0.1:8000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
# Berjalan di http://localhost:3000
```

### Akses Aplikasi

| URL | Deskripsi |
|---|---|
| `http://localhost:3000` | Frontend Next.js (redirect ke /dashboard atau /login) |
| `http://localhost:3000/login` | Halaman login SSO |
| `http://127.0.0.1:8000/admin` | Filament Admin Panel |
| `http://127.0.0.1:8000/api/v1` | REST API base URL |

### Kredensial Default

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `password` |
| Role | `admin` |

---

## API Endpoint Reference

Semua endpoint di bawah ini memerlukan header:

```
Authorization: Bearer {token}
Accept: application/json
```

### Authentication

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login, mendapat Bearer token |
| `POST` | `/api/v1/auth/logout` | Logout, hapus token |
| `GET` | `/api/v1/auth/me` | Data user yang sedang login |

**Request login:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response login:**
```json
{
  "token": "1|xxxxx",
  "user": {
    "id": 1,
    "name": "Ketua RT",
    "email": "admin@example.com",
    "role": "admin"
  },
  "expires_at": "2025-07-27T00:00:00.000000Z"
}
```

### Houses

| Method | Endpoint | Query Params | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/houses` | `occupancy_status`, `house_type` | List semua rumah |
| `POST` | `/api/v1/houses` | — | Buat rumah baru |
| `GET` | `/api/v1/houses/{id}` | — | Detail satu rumah |
| `PUT` | `/api/v1/houses/{id}` | — | Update data rumah |
| `DELETE` | `/api/v1/houses/{id}` | — | Hapus rumah |
| `GET` | `/api/v1/houses/{id}/residents` | — | Histori penghuni rumah |
| `POST` | `/api/v1/houses/{id}/residents` | — | Assign penghuni ke rumah |
| `PUT` | `/api/v1/houses/{id}/move-out` | — | Keluarkan penghuni saat ini |
| `GET` | `/api/v1/houses/{id}/payments` | `month` | Histori pembayaran rumah |

### Residents

| Method | Endpoint | Query Params | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/residents` | `resident_type`, `is_active`, `search` | List penghuni |
| `POST` | `/api/v1/residents` | — | Tambah penghuni (multipart/form-data) |
| `GET` | `/api/v1/residents/{id}` | — | Detail penghuni |
| `POST` | `/api/v1/residents/{id}?_method=PUT` | — | Update penghuni (multipart/form-data) |
| `DELETE` | `/api/v1/residents/{id}` | — | Hapus penghuni (soft delete) |

> **Catatan:** Endpoint create/update resident menggunakan `multipart/form-data` karena ada upload foto KTP. Untuk update via PUT, gunakan `POST` dengan query param `?_method=PUT` (Laravel method spoofing).

### Payments

| Method | Endpoint | Query Params | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/payments` | `month`, `house_id`, `resident_id`, `status`, `fee_type_id` | List pembayaran |
| `POST` | `/api/v1/payments` | — | Catat pembayaran |
| `GET` | `/api/v1/payments/{id}` | — | Detail pembayaran |
| `PUT` | `/api/v1/payments/{id}` | — | Update pembayaran |
| `DELETE` | `/api/v1/payments/{id}` | — | Hapus pembayaran |

### Expenses

| Method | Endpoint | Query Params | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/expenses` | `month`, `category`, `is_recurring` | List pengeluaran |
| `POST` | `/api/v1/expenses` | — | Tambah pengeluaran |
| `GET` | `/api/v1/expenses/{id}` | — | Detail pengeluaran |
| `PUT` | `/api/v1/expenses/{id}` | — | Update pengeluaran |
| `DELETE` | `/api/v1/expenses/{id}` | — | Hapus pengeluaran |

### Fee Types

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/fee-types` | List jenis iuran aktif |
| `GET` | `/api/v1/fee-types/{id}` | Detail jenis iuran |

### Reports

| Method | Endpoint | Query Params | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/reports/monthly-summary` | `year` (default: tahun ini) | Data grafik 12 bulan |
| `GET` | `/api/v1/reports/monthly-detail` | `month` (format: YYYY-MM) | Detail pemasukan & pengeluaran satu bulan |
| `GET` | `/api/v1/reports/payment-status` | `month` (format: YYYY-MM) | Status bayar/belum per rumah |

**Contoh response `/api/v1/reports/monthly-summary?year=2025`:**

```json
{
  "year": 2025,
  "data": [
    { "month": "2025-01", "month_label": "Jan", "income": 2875000, "expenses": 1650000, "balance": 1225000 },
    { "month": "2025-02", "month_label": "Feb", "income": 2990000, "expenses": 2300000, "balance": 690000 }
  ],
  "summary": {
    "total_income": 17940000,
    "total_expenses": 12150000,
    "net_balance": 5790000
  }
}
```

---

### Default Fee Types

| Nama | Slug | Nominal | Siklus |
|---|---|---|---|
| Security Guard Fee | `security` | Rp 100.000 | Monthly |
| Cleaning Fee | `cleaning` | Rp 15.000 | Monthly |

Fee types bisa ditambah/diubah melalui Filament Admin Panel.

---

*Dibuat oleh [sfauzi.dev](https://www.sfauzi.dev/portfolio)* 
