# Desa Wonowoso

Aplikasi web desa berbasis Express.js dan MongoDB.

## Persiapan

Pastikan Anda sudah menginstal:

- Node.js 18+
- npm
- MongoDB
- VS Code
- Docker (opsional, kalau mau pakai MongoDB via container)

## 1. Clone / buka project

```bash
cd /Users/bandungan/Documents/desa-wonowoso
```

## 2. Install dependency

```bash
npm install
```

## 3. Koneksi MongoDB lewat VS Code

Project ini secara default mencoba koneksi ke MongoDB lokal:

```text
mongodb://127.0.0.1:27017/desa_wonowoso
```

### Opsi A: pakai MongoDB lokal yang sudah terinstall

1. Buka VS Code.
2. Pastikan MongoDB service sudah aktif di komputer Anda.
3. Cek apakah MongoDB berjalan:

```bash
mongosh
```

Jika berhasil masuk shell MongoDB, artinya database sudah jalan.

4. Jika belum aktif, jalankan:

- macOS (Homebrew):

```bash
brew services start mongodb-community
```

atau cek service:

```bash
brew services list
```

5. Untuk koneksi di VS Code:
   - Buka tab MongoDB di VS Code (jika extension MongoDB untuk VS Code sudah terinstall).
   - Pilih "Add Connection".
   - Masukkan URL:

```text
mongodb://127.0.0.1:27017
```

   - Pilih database `desa_wonowoso`.

### Opsi B: pakai Docker

Project sudah memiliki file `docker-compose.yml` yang siap untuk menjalankan MongoDB container.

Jalankan:

```bash
docker compose up -d
```

Atau jika versi Docker lama:

```bash
docker-compose up -d
```

Setelah itu, koneksi MongoDB bisa memakai:

```text
mongodb://127.0.0.1:27017/desa_wonowoso
```

## 4. Env / konfigurasi

Salin `.env.example` menjadi `.env` untuk development lokal. Project memakai `MONGODB_URI` untuk MongoDB Atlas, tetap mendukung `MONGO_URI` lama, lalu fallback ke:

```text
mongodb://127.0.0.1:27017/desa_wonowoso
```

Jika Anda ingin memakai environment file, buat file `.env` di root project:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/desa_wonowoso
SESSION_SECRET=desa_wonowoso_secret
PORT=3000
```

## 5. Deploy ke MongoDB Atlas dan Vercel

### MongoDB Atlas

1. Buat cluster Free (M0) di [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Buat database user dan password.
3. Di **Network Access**, tambahkan `0.0.0.0/0` agar Vercel dapat terhubung. Untuk keamanan, gunakan database user dengan hak akses minimum.
4. Salin connection string `mongodb+srv://...` dan ganti username, password, serta nama database bila diperlukan.

### Vercel

1. Push project ke GitHub. Pastikan `.env` tidak ikut ter-push.
2. Di [Vercel](https://vercel.com/), pilih **Add New Project** lalu import repository.
3. Tambahkan environment variables berikut di pengaturan project:

```text
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/desa_wonowoso
SESSION_SECRET=gunakan-rahasia-acak-yang-panjang
EMAIL_USER=alamat-email-jika-notifikasi-digunakan
EMAIL_PASS=password-aplikasi-email-jika-notifikasi-digunakan
```

4. Deploy. File `vercel.json` sudah mengarahkan seluruh request ke `server.js`.

Vercel menggunakan filesystem sementara. File yang diunggah ke `public/uploads` dapat hilang saat deployment atau perpindahan instance. Untuk produksi, gunakan object storage persisten seperti Cloudinary, AWS S3, atau Vercel Blob dan simpan URL file di MongoDB.

## 6. Menjalankan project

### Start aplikasi

```bash
npm start
```

Server akan berjalan di port 3000:

```text
http://localhost:3000
```

### Mode development dengan nodemon

```bash
npm run dev
```

### Restart aplikasi

```bash
npm run restart
```

Perintah ini akan menghentikan server yang sedang berjalan di port 3000 lalu menyalakan ulang aplikasi.

### Stop aplikasi

```bash
npm run stop
```

Perintah ini akan menutup proses yang berjalan di port 3000.

## 7. Cek status database

Jika server berhasil konek, log di terminal akan seperti:

```text
Attempting to connect to MongoDB...
MongoDB Connected: 127.0.0.1
Server running on port 3000
```

Jika gagal, biasanya log seperti:

```text
Error Connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

Artinya MongoDB belum aktif atau port 27017 belum terbuka.

## 8. Troubleshooting

### MongoDB tidak bisa connect

Cek apakah MongoDB sudah aktif:

```bash
mongosh
```

Atau cek service Docker:

```bash
docker ps
```

### Port 3000 sudah dipakai

Cek proses yang memakai port 3000:

```bash
lsof -i :3000
```

Lalu stop dengan:

```bash
npm run stop
```

## 9. Struktur penting

- `server.js` = entry point aplikasi
- `config/database.js` = koneksi MongoDB
- `docker-compose.yml` = konfigurasi MongoDB via Docker
- `package.json` = script start, restart, stop

## 10. Jalur admin

Setelah server berjalan, login admin bisa di:

```text
http://localhost:3000/admin/login
```

## 11. Catatan

Jika Anda ingin memakai database yang berbeda, ubah nilai `MONGODB_URI` di `.env` sesuai koneksi Anda.

Contoh:

```env
MONGODB_URI=mongodb://username:password@host:27017/nama_database
```
