# 🎂 Kamana Pastanesi - Toptan Sipariş Uygulaması

Mobil öncelikli, günlük toptan tatlı siparişi web uygulaması.

## ✨ Özellikler

- 🎨 Modern, mobil-first tasarım (Kamana renk paleti)
- 📱 Responsive tasarım (tüm cihazlarda çalışır)
- 🛒 Gerçek zamanlı sepet yönetimi
- 📧 Otomatik email bildirimleri
- 🔢 5 haneli sipariş numarası sistemi
- 👨‍💼 Admin paneli (ürün yönetimi)
- 🖼️ Ürün görselleri ve detayları
- 📝 Teslimat notu ekleme
- ✅ Sipariş onay ekranı

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev
```

Tarayıcıda açın: http://localhost:3000

## 🔧 Environment Variables

`.env.local` dosyası oluşturun:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Gmail App Password Nasıl Alınır:**
1. https://myaccount.google.com/apppasswords
2. 2 faktörlü doğrulamayı aç
3. "Mail" için app password oluştur
4. 16 haneli şifreyi kopyala

## 📱 Kullanım

### Müşteri Akışı
1. Ürünleri görüntüle ve miktar seç
2. "Devam Et" ile sepeti görüntüle
3. İletişim bilgilerini gir
4. Siparişi gönder
5. Sipariş numarasını al

### Admin Paneli
- URL: `/admin`
- Şifre: `kamana2024`
- Ürün ekleme/düzenleme
- Aktif/pasif yapma

## 🎨 Tasarım

- **Primary Color:** #C27C5B (Kamana sıcak pastane rengi)
- **Secondary Color:** #F5E9E2 (hafif pastel)
- **Text Color:** #1F2937 (koyu gri)
- **Border Radius:** 16px (card), 12px (image)

## 🛠️ Teknolojiler

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Email:** Nodemailer (Gmail SMTP)
- **Storage:** LocalStorage (geçici)

## 📦 Deployment

### Netlify
```bash
npm run build
```

Environment variables ekle:
- `EMAIL_USER`
- `EMAIL_PASS`

### Vercel
```bash
vercel deploy
```

## 📧 Email Formatı

Siparişler fiş formatında email olarak gönderilir:
- Sipariş numarası (büyük ve belirgin)
- Müşteri bilgileri
- Ürün listesi (görsel + detay)
- Toplam tutar
- Teslimat notu
- Yazdır butonu

## 🔐 Güvenlik

- `.env.local` git'e eklenmez
- Email şifreleri environment variables'da
- Admin paneli şifre korumalı

## 📝 Lisans

Bu proje Kamana Pastanesi için özel olarak geliştirilmiştir.

## 👨‍💻 Geliştirici

Murat Sürkit - muratsurkit@gmail.com
