# Vercel Deploy Rehberi - Pi Portal

## ⚠️ ÖNEMLİ: Yerel Build Sorunu

Proje yolunuz Türkçe karakterler içeriyor:
```
c:\Users\musta\OneDrive\Masaüstü\2026\pi günü için öneriler\pi-portal-web
```

Bu, Windows'ta yerel build sırasında karakter kodlama sorunlarına neden oluyor. **Ancak Vercel'de bu sorun yaşanmayacak** çünkü Vercel Linux tabanlı ve projeyi temiz bir yolda build ediyor.

## 🚀 Vercel'e Deploy Adımları

### 1. Projeyi GitHub'a Yükle

```bash
# Proje klasörüne git
cd "c:\Users\musta\OneDrive\Masaüstü\2026\pi günü için öneriler\pi-portal-web"

# Git'i başlat (eğer daha önce başlatılmadıysa)
git init
git add .
git commit -m "Initial commit: Pi Portal"

# GitHub'da yeni bir repo oluştur (örnek: pi-portal-web)
# Sonra remote'u ekle
git remote add origin https://github.com/KULLANICI_ADIN/pi-portal-web.git
git branch -M main
git push -u origin main
```

### 2. Vercel'de Proje Oluştur

1. [vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap
3. "Add New Project" tıkla
4. GitHub repo'larından `pi-portal-web` seç
5. "Import" tıkla

### 3. Build Ayarları

Vercel otomatik olarak Vite projelerini tanır. Ayarlar:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Ek ayar yapmana gerek yok!**

### 4. Deploy Et

"Deploy" butonuna tıkla ve bekle. Build başarılı olmalı!

---

## 🔧 Yerel Development İçin Çözüm

Yerelde çalıştırmak istersen:

### Seçenek 1: Projeyi Basit Yola Taşı

```bash
# C:\pi-portal gibi basit bir yola taşı
xcopy "c:\Users\musta\OneDrive\Masaüstü\2026\pi günü için öneriler\pi-portal-web" "c:\pi-portal" /E /I /Y
cd c:\pi-portal
npm install
npm run dev
```

### Seçenek 2: OneDrive Sync'i Kapat

OneDrive bazen sorun yaratabilir. Proje klasörünü OneDrive dışına taşı.

---

## 📦 Build Düzeltmeleri

Tüm import uzantıları kaldırıldı. Vite otomatik olarak çözümlüyor:

```javascript
// ✅ Doğru
import { store } from '../../lib/store'
import StarMap from './components/games/StarMap'

// ❌ Yanlış (Vite bazen sorun çıkarabilir)
import { store } from '../../lib/store.js'
import StarMap from './components/games/StarMap.jsx'
```

---

## 🐛 Sorun Giderme

### Build Hatası: "Could not resolve"

1. `node_modules` ve `package-lock.json` sil
2. `npm install` tekrar çalıştır
3. `npm run build` dene

### Vercel'de Build Başarısız

1. Vercel Dashboard > Project > Deployments > [Failed Deploy] tıkla
2. Build log'u incele
3. Hata mesajını kontrol et

### Yerel Build Çalışıyor Ama Vercel'de Hata Var

Vercel'de `package.json`'daki `engines` alanını kontrol et:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## ✅ Kontrol Listesi

- [ ] Tüm import'lardan `.js` / `.jsx` uzantıları kaldırıldı
- [ ] `vite.config.js` temiz
- [ ] `package.json` doğru
- [ ] GitHub'a push edildi
- [ ] Vercel'de proje oluşturuldu
- [ ] Deploy başarılı!

---

## 📞 Yardım

Sorun yaşarsan:
1. Vercel build log'unu paylaş
2. `npm run build` çıktısını paylaş
3. `vite.config.js` ve `package.json` dosyalarını kontrol et
