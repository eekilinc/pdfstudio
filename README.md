# 🚀 PDF Studio Pro

<p align="center">
  <strong>Modern, Ultra Hızlı ve Gizlilik Odaklı Masaüstü PDF Düzenleme & Üretkenlik Paketi</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20(x64)-blue.svg" alt="Platform" />
  <img src="https://img.shields.io/badge/Framework-Tauri%202.0%20(Rust)-orange.svg" alt="Tauri" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/Engine-PDF.js%20%2B%20pdf--lib-red.svg" alt="PDF.js" />
  <img src="https://img.shields.io/badge/OCR-Tesseract.js-green.svg" alt="OCR" />
  <img src="https://img.shields.io/badge/Security-100%25%20Local%20%26%20Private-success.svg" alt="Privacy" />
</p>

---

## 🌟 Öne Çıkan Özellikler

### 📝 1. Doğrudan PDF Metin Düzenleme & OCR
* **Doğrudan Metin Değiştirme:** PDF üzerindeki orijinal metinleri anında değiştirin, silin, fontunu ve boyutunu ayarlayın.
* **Tesseract OCR:** Taranmış veya görsel formatındaki PDF'leri optik karakter tanıma ile saniyeler içinde düzenlenebilir hale getirin.
* **Seç & Kopyala (`Ctrl+C`):** Metin katmanı üzerinden hızlıca seçim yapın, kopyalayın veya **Türkçe'ye çevirin**.

### ✂️ 2. Gelişmiş Sayfa & Belge Yönetimi
* **PDF Sayfalarını Bölme & Ayıkla (Split PDF):**
  - Belirli sayfa aralığı çıkarma (`1-5, 8, 12-14`).
  - Her sayfayı tek tek bağımsız PDF yapma.
  - Tek ve çift sayfaları iki ayrı PDF'e ayırma.
  - Sayfa sayısına göre gruplayarak bölme.
* **Otomatik Sayfa Numaralandırma & Altbilgi:** Farklı formatlarda (`Sayfa 1 / 20`, `- 1 -`), konumlandırma ve kapak sayfasını atlama seçenekleriyle tek tıkla sayfa numarası basın.
* **PDF Birleştirme (Merge):** Birden fazla PDF dosyasını tek bir belgede birleştirin.
* **Sayfa Sıralama & Yönetim:** Sayfaları sürükleyip bırakarak sıralayın, döndürün, çoğaltın veya silin.
* **Boş Sayfa Ekleme:** Belgeye tek tıkla saf beyaz yeni sayfalar ekleyin.

### 👥 3. İki PDF'i Yan Yana Karşılaştırma (Side-by-Side Diff)
* İki farklı sözleşmeyi veya revizyonu yan yana iki panelde açıp **eşzamanlı kaydırma** ile aradaki farkları kolayca inceleyin.

### 📉 4. Boyut Küçültme & Güvenlik
* **PDF Sıkıştırma (Compress):** Düşük, Orta ve Yüksek sıkıştırma profilleriyle dosya boyutunu küçültün.
* **128-bit AES Şifreleme (Password Protect):** Belgenize parola koyarak izinsiz erişimleri engelleyin.
* **Hassas Veri Karartma (Redact):** TC Kimlik, telefon, adres gibi hassas verileri kalıcı olarak karartın.

### 🎨 5. Çizim, Şekiller & Görsel Araçları
* **Canlı Çizim & Fosforlu Kalem:** 60 FPS anlık önizleme ile pürüzsüz serbest çizim ve satır vurgulama.
* **Resim & Logo Ekleme:** Bilgisayarınızdan istediğiniz görseli veya şirket logosunu PDF üzerine ekleyip boyutlandırın.
* **Dijital İmza & Kaşe/Damga:** Çizerek, yazarak veya resim yükleyerek resmi sözleşme onaylama.
* **Teknik Ölçüm Cetveli (Ruler):** Plan ve krokiler üzerinde iki nokta arasındaki gerçek mesafeyi (`cm` ve `mm`) ölçün.
* **İnteraktif Onay Kutusu (Checkbox):** Tıklanabilir `☑` / `☐` onay kutuları ekleyin.

### 🌓 6. Göz Yormayan Okuma Modları
* **Normal Mod**
* **Sıcak Sepia Modu** (Kitap okuma keyfi)
* **Gece Modu** (Ters çevrilmiş koyu tema)
* **Yüksek Kontrast Modu** (Soluk taranmış belgeleri netleştirme)

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
|---|---|
| **Ctrl + Z** | Geri Al (Undo) |
| **Ctrl + Y** | Yinele (Redo) |
| **Ctrl + S** | PDF Olarak Dışa Aktar / Kaydet |
| **Ctrl + F** | Belge İçinde Arama |
| **Ctrl + O** | PDF Dosyası Aç |
| **Ctrl + P** | Yazdır |
| **V** | Seçim & Taşıma & Metin Kopyalama |
| **H** | Sayfayı Kaydır / Gezin (Pan) |
| **E** | Doğrudan Metin Düzenleme Aracı |
| **P** | Canlı Çizim Kalemi |
| **T** | Yeni Metin Kutusu Ekleme |
| **Delete** | Seçili Nesneyi Sil |

---

## 🛠️ Teknolojik Altyapı

* **Platform:** [Tauri 2.0](https://tauri.app/) (Rust tabanlı güvenli ve ultra hafif masaüstü mimarisi)
* **Frontend:** React 19, TypeScript, Vite
* **PDF Render Motoru:** PDF.js (Yerel Web Worker & CMap Glif Motoru)
* **PDF Oluşturma & Dışa Aktarım:** `pdf-lib`
* **OCR Motoru:** `tesseract.js`
* **Stil:** Saf CSS Tasarım Sistemi (Glassmorphism & Dark Mode)

---

## 🚀 Geliştirme & Çalıştırma

### Gereksinimler
* [Node.js](https://nodejs.org/) (v18+)
* [Rust](https://www.rust-lang.org/) (Cargo)

### Kurulum

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın (Tauri Masaüstü)
npm run tauri dev
```

### Üretim Derlemesi (Release Binary & Installer)

```bash
# Windows x64 Kurulum Paketi (.exe) oluşturun
npm run tauri build
```

Derlenen dosyalar:
* **Kurulum Dosyası (NSIS):** `src-tauri/target/release/bundle/nsis/PDFStudio_0.1.0_x64-setup.exe`
* **Taşınabilir EXE:** `src-tauri/target/release/app.exe`

---

## 🔒 Gizlilik & Güvenlik

PDF Studio Pro, **%100 Çevrimdışı ve Yerel (Local)** çalışır. Açtığınız veya düzenlediğiniz hiçbir belge, metin ya da imza internete veya üçüncü taraf sunuculara aktarılmaz.

---

## 📄 Lisans
Bu proje MIT lisansı altında korunmaktadır.
