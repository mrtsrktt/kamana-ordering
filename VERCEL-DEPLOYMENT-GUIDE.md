# Vercel Deployment & Storage Guide
## Next.js Uygulamaları için Kapsamlı Referans

Bu doküman, Next.js uygulamalarını Vercel'e deploy etme ve storage çözümlerini entegre etme sürecini adım adım açıklar.

---

## 📦 1. Vercel'e İlk Deployment

### Adımlar:
1. **GitHub'a Push Et**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo-name.git
   git push -u origin main
   ```

2. **Vercel'e Import Et**
   - https://vercel.com/new → GitHub'dan projeyi seç
   - Framework: Next.js (otomatik algılanır)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

3. **Deploy**
   - Deploy butonuna bas
   - 1-2 dakika içinde canlıya alınır

### Environment Variables
Vercel Dashboard → Settings → Environment Variables
- Production, Preview, Development için ayrı ayrı eklenebilir
- Değişiklik sonrası redeploy gerekir

---

## 🗄️ 2. PostgreSQL Database (Neon)

### Kurulum:
1. **Vercel Dashboard** → Storage → Create Database → **Neon** (Serverless Postgres)
2. Database adı ver (örn: `app-db`)
3. Region seç (kullanıcılara yakın)
4. Free plan seç (0.5 GB yeterli)
5. **Connect to Project** → Tüm environment'ları seç

### Otomatik Eklenen Environment Variables:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
```

### Prisma Entegrasyonu:

#### 1. Paketleri Yükle:
```bash
npm install prisma @prisma/client
```

#### 2. Prisma Schema Oluştur:
`prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  description String?
  image       String
  is_active   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([is_active])
}
```

#### 3. Prisma Client Utility:
`lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

#### 4. Environment Variables:
`.env`:
```
DATABASE_URL="postgresql://..."
```

`.env.example`:
```
DATABASE_URL=""
```

#### 5. Migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 6. Package.json Scripts:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### Database İşlemleri:

#### CRUD Fonksiyonları (`lib/db.ts`):
```typescript
import { prisma } from './prisma';

// Tüm kayıtları getir
export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

// Yeni kayıt ekle
export async function createProduct(data: any) {
  return await prisma.product.create({ data });
}

// Kayıt güncelle
export async function updateProduct(id: string, data: any) {
  return await prisma.product.update({
    where: { id },
    data
  });
}

// Kayıt sil
export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id }
  });
}
```

---

## 🖼️ 3. Görsel Yükleme (Vercel Blob)

### Neden Vercel Blob?
- ✅ Vercel'de dosya sistemi read-only (local upload çalışmaz)
- ✅ Vercel Blob: Kolay entegrasyon, CDN dahil
- ✅ Ücretsiz: İlk 1 GB ücretsiz

### Kurulum:

#### 1. Vercel Blob Oluştur:
- **Vercel Dashboard** → Storage → Create Database → **Blob**
- Database adı: `app-images`
- **Connect to Project**

#### 2. Otomatik Eklenen Environment Variable:
```
BLOB_READ_WRITE_TOKEN
```

#### 3. Paketi Yükle:
```bash
npm install @vercel/blob
```

#### 4. Upload API (`pages/api/upload-image.ts`):
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image data' });
    }

    // Base64'ten Buffer'a çevir
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Vercel Blob'a yükle
    const blob = await put(filename || `image-${Date.now()}.jpg`, buffer, {
      access: 'public',
    });

    res.status(200).json({ 
      success: true, 
      imageUrl: blob.url 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
}
```

#### 5. Frontend Upload (React):
```typescript
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Base64'e çevir
      const reader = new FileReader();
      reader