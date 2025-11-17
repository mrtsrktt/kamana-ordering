# Implementation Plan

- [x] 1. Install Vercel KV package


  - Run `npm install @vercel/kv` to add Redis client
  - _Requirements: 3.5_

- [x] 2. Create Redis utility module

  - [x] 2.1 Create `lib/redis.ts` file with KV client functions


    - Implement `getProducts()` function to fetch products from Redis
    - Implement `setProducts()` function to save products to Redis
    - Implement `initializeProducts()` function to seed default products
    - Add proper TypeScript types and error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Create public products API endpoint

  - [x] 3.1 Create `pages/api/products.ts` file


    - Implement GET handler that fetches products from Redis
    - Filter only active products (is_active: true)
    - Return JSON response with active products
    - Add error handling for Redis failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Update admin products API to use Redis

  - [x] 4.1 Modify `pages/api/admin/products.ts` GET handler


    - Replace in-memory storage with Redis getProducts()
    - Initialize Redis with default products if empty
    - _Requirements: 1.5_
  
  - [x] 4.2 Modify `pages/api/admin/products.ts` POST handler

    - Save new product to Redis using setProducts()
    - Return created product in response
    - _Requirements: 1.1_
  
  - [x] 4.3 Modify `pages/api/admin/products.ts` PUT handler

    - Update product in Redis (toggle active/inactive or edit)
    - Save updated products list to Redis
    - _Requirements: 1.2, 1.3_
  
  - [x] 4.4 Add DELETE handler to `pages/api/admin/products.ts`

    - Implement DELETE method to remove product from Redis
    - Filter out deleted product and save to Redis
    - Return success response
    - _Requirements: 4.1, 4.2_

- [x] 5. Update homepage to fetch products from API

  - [x] 5.1 Modify `pages/index.tsx` to use API


    - Remove static import of products from lib/products
    - Add useState for products with empty initial state
    - Add useEffect to fetch products from `/api/products` on mount
    - Update activeProducts to use fetched products
    - Add loading state while fetching
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Update admin panel to use API methods

  - [x] 6.1 Modify `pages/admin/products.tsx` to fetch products


    - Replace initial products with API call to `/api/admin/products`
    - Add useEffect to fetch products on component mount
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 6.2 Update product creation in admin panel


    - Modify handleSubmit to POST new products to API
    - Refresh products list after successful creation
    - _Requirements: 1.1_
  
  - [x] 6.3 Update product editing in admin panel

    - Modify handleSubmit to PUT updated products to API
    - Refresh products list after successful update
    - _Requirements: 1.2_
  
  - [x] 6.4 Update toggle active functionality


    - Modify toggleActive to PUT status change to API
    - Refresh products list after successful toggle
    - _Requirements: 1.3_
  
  - [x] 6.5 Update delete functionality

    - Modify handleDelete to DELETE product via API
    - Refresh products list after successful deletion
    - Add confirmation dialog before deletion
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Configure Vercel KV database

  - [x] 7.1 Create KV database in Vercel dashboard


    - Go to Vercel project → Storage → Create Database → KV
    - Connect KV database to project
    - Verify environment variables are set (KV_REST_API_URL, KV_REST_API_TOKEN)
    - _Requirements: 3.1, 3.5_

- [x] 8. Deploy and test

  - [x] 8.1 Deploy to Vercel

    - Push changes to git repository
    - Verify Vercel deployment succeeds
    - Check that KV database is connected
    - _Requirements: All_
  
  - [x] 8.2 Test admin panel functionality

    - Test adding new product → verify it appears on homepage
    - Test editing product → verify changes appear on homepage
    - Test toggling product active/inactive → verify visibility on homepage
    - Test deleting product → verify it disappears from homepage
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2_
