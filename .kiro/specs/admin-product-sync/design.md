# Design Document

## Overview

Bu tasarım, admin panelinde yapılan ürün değişikliklerinin Redis üzerinden anasayfaya senkronize edilmesini sağlar. Vercel KV (Redis) kullanarak merkezi bir veri deposu oluşturacağız.

## Architecture

### Data Flow

```
Admin Panel → Product API → Redis (Vercel KV) → Product API → Anasayfa
```

1. Admin panelde değişiklik yapılır
2. Product API değişikliği Redis'e kaydeder
3. Anasayfa yüklendiğinde Product API'den veri çeker
4. Product API Redis'ten güncel veriyi döner

### Technology Stack

- **Vercel KV**: Redis tabanlı key-value store
- **@vercel/kv**: Vercel KV client library
- **Next.js API Routes**: Backend endpoint'ler

## Components and Interfaces

### 1. Redis Client (`lib/redis.ts`)

Vercel KV bağlantısını yöneten utility modül.

```typescript
import { kv } from '@vercel/kv';

const PRODUCTS_KEY = 'products';

export async function getProducts() {
  const products = await kv.get(PRODUCTS_KEY);
  return products || [];
}

export async function setProducts(products: Product[]) {
  await kv.set(PRODUCTS_KEY, products);
}

export async function initializeProducts(defaultProducts: Product[]) {
  const existing = await kv.get(PRODUCTS_KEY);
  if (!existing) {
    await kv.set(PRODUCTS_KEY, defaultProducts);
  }
}
```

### 2. Product API (`pages/api/admin/products.ts`)

Güncellenmiş API endpoint'i Redis kullanacak şekilde.

**Endpoints:**

- `GET /api/admin/products` - Tüm ürünleri Redis'ten getir
- `POST /api/admin/products` - Yeni ürün ekle ve Redis'e kaydet
- `PUT /api/admin/products` - Ürün güncelle (aktif/pasif, düzenle) ve Redis'e kaydet
- `DELETE /api/admin/products` - Ürün sil ve Redis'ten kaldır

### 3. Public Product API (`pages/api/products.ts`)

Anasayfa için sadece aktif ürünleri dönen yeni endpoint.

```typescript
GET /api/products
Response: Product[] (sadece is_active: true olanlar)
```

### 4. Anasayfa (`pages/index.tsx`)

Statik ürün listesi yerine API'den veri çekecek.

```typescript
useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

### 5. Admin Panel (`pages/admin/products.tsx`)

API çağrılarını güncelleyecek (GET, POST, PUT, DELETE).

## Data Models

### Product Interface

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_active: boolean;
  minOrderText?: string;
  suggestionText?: string;
  minOrderQty?: number;
  category?: string;
  stock?: number;
}
```

### Redis Storage Structure

```
Key: "products"
Value: Product[] (JSON array)
```

## Error Handling

### Redis Connection Errors

```typescript
try {
  const products = await getProducts();
} catch (error) {
  console.error('Redis error:', error);
  return res.status(500).json({ error: 'Database connection failed' });
}
```

### Fallback Strategy

1. Redis bağlantısı başarısız olursa → 500 error döndür
2. İlk yüklemede Redis boşsa → lib/products.ts'deki varsayılan verileri yükle
3. API hataları → Kullanıcıya anlamlı hata mesajı göster

## Environment Variables

Vercel dashboard'dan otomatik olarak sağlanır:

```
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
```

## Testing Strategy

### Manual Testing

1. Admin panelde ürün ekle → Anasayfada görünmeli
2. Admin panelde ürün düzenle → Anasayfada güncel bilgi görünmeli
3. Admin panelde ürünü pasif yap → Anasayfada görünmemeli
4. Admin panelde ürünü aktif yap → Anasayfada tekrar görünmeli
5. Admin panelde ürün sil → Anasayfada görünmemeli

### Edge Cases

- Redis boş olduğunda ilk yükleme
- Aynı anda birden fazla admin değişiklik yaptığında
- Network hatası durumunda

## Migration Plan

1. `@vercel/kv` paketini yükle
2. `lib/redis.ts` oluştur
3. `pages/api/products.ts` oluştur (public endpoint)
4. `pages/api/admin/products.ts` güncelle (Redis kullan)
5. `pages/index.tsx` güncelle (API'den veri çek)
6. `pages/admin/products.tsx` güncelle (API çağrıları)
7. Vercel'de KV database oluştur ve deploy et
8. Test et

## Performance Considerations

- Redis çok hızlı olduğu için ek caching gerekmez
- Anasayfa her yüklendiğinde API çağrısı yapacak (kabul edilebilir)
- Admin panelde değişiklik anında Redis'e yazılacak
