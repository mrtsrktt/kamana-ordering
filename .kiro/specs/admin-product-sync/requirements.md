# Requirements Document

## Introduction

Bu özellik, admin panelinde yapılan ürün değişikliklerinin (ekleme, düzenleme, aktif/pasif yapma) anasayfada gerçek zamanlı olarak yansımasını sağlayacaktır. Şu anda admin panelinde yapılan değişiklikler sadece bellekte tutulmakta ve sayfa yenilendiğinde kaybolmaktadır. Ayrıca anasayfa statik ürün listesini kullanmaktadır.

## Glossary

- **Admin Panel**: Ürün yönetimi yapılan yönetici arayüzü (pages/admin/products.tsx)
- **Anasayfa**: Müşterilerin ürünleri görüp sipariş verdiği sayfa (pages/index.tsx)
- **Product API**: Ürün verilerini yöneten API endpoint'i (pages/api/admin/products.ts)
- **Redis**: Vercel KV üzerinde çalışan key-value veritabanı
- **Static Product List**: lib/products.ts dosyasındaki sabit ürün listesi

## Requirements

### Requirement 1

**User Story:** Admin olarak, ürün eklemek, düzenlemek veya aktif/pasif yapmak istiyorum, böylece müşteriler güncel ürünleri görebilsin

#### Acceptance Criteria

1. WHEN admin panelde yeni bir ürün eklendiğinde, THE Product API SHALL ürünü Redis'e kaydetmeli
2. WHEN admin panelde bir ürün düzenlendiğinde, THE Product API SHALL güncel ürün bilgilerini Redis'e kaydetmeli
3. WHEN admin panelde bir ürün aktif/pasif yapıldığında, THE Product API SHALL ürün durumunu Redis'e kaydetmeli
4. WHEN anasayfa yüklendiğinde, THE Anasayfa SHALL ürün listesini Redis'ten çekmeli
5. IF Redis'te ürün verisi yoksa, THEN THE Product API SHALL lib/products.ts'deki varsayılan ürünleri Redis'e yüklemeli

### Requirement 2

**User Story:** Müşteri olarak, anasayfada güncel ürünleri görmek istiyorum, böylece doğru bilgilerle sipariş verebilirim

#### Acceptance Criteria

1. WHEN anasayfa açıldığında, THE Anasayfa SHALL sadece aktif ürünleri göstermeli
2. WHEN admin bir ürünü pasif yaptığında, THE Anasayfa SHALL o ürünü listeden kaldırmalı
3. WHEN admin bir ürünü aktif yaptığında, THE Anasayfa SHALL o ürünü listeye eklemeli
4. THE Anasayfa SHALL ürün fiyatlarını, açıklamalarını ve minimum sipariş miktarlarını Redis'ten almalı

### Requirement 3

**User Story:** Geliştirici olarak, Redis bağlantısını yönetmek istiyorum, böylece uygulama güvenli ve performanslı çalışsın

#### Acceptance Criteria

1. THE Product API SHALL Redis bağlantısını environment variable'lardan almalı
2. IF Redis bağlantısı başarısız olursa, THEN THE Product API SHALL hata mesajı döndürmeli
3. THE Product API SHALL Redis'e yazma işlemlerinde hata yönetimi yapmalı
4. THE Product API SHALL Redis'ten okuma işlemlerinde hata yönetimi yapmalı
5. WHERE Vercel ortamında, THE Product API SHALL Vercel KV kullanmalı

### Requirement 4

**User Story:** Admin olarak, ürün silme işlemi yapmak istiyorum, böylece artık satılmayan ürünleri sistemden kaldırabilirim

#### Acceptance Criteria

1. WHEN admin bir ürünü sildiğinde, THE Product API SHALL ürünü Redis'ten tamamen kaldırmalı
2. WHEN bir ürün silindiğinde, THE Anasayfa SHALL o ürünü artık göstermemeli
3. THE Admin Panel SHALL silme işlemi öncesi onay mesajı göstermeli
