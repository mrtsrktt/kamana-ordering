export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_active: boolean;
  minOrderText?: string | null;
  suggestionText?: string | null;
  minOrderQty?: number | null;
  category?: string | null;
  stock?: number | null;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Magnolia',
    description: '250 ml',
    price: 65,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    is_active: true,
    minOrderText: 'Minimum: 6 adet',
    suggestionText: 'Cafeler için günlük öneri: 12–18 adet',
    minOrderQty: 6
  },
  {
    id: '2',
    name: 'Ekler (Classic)',
    description: 'Klasik ekler',
    price: 30,
    image: 'https://i.imgur.com/euYycMj.jpg',
    is_active: true,
    minOrderText: 'Minimum: 12 adet',
    suggestionText: 'Günlük raf önerisi: 24–36 adet',
    minOrderQty: 12
  },
  {
    id: '3',
    name: 'Trileçe (Tepsi)',
    description: 'Tam tepsi',
    price: 120,
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 tepsi',
    suggestionText: 'Cafeler için haftalık: 2–3 tepsi',
    minOrderQty: 1
  },
  {
    id: '4',
    name: 'Trileçe (Dilim)',
    description: 'Tek dilim',
    price: 50,
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    is_active: true,
    minOrderText: 'Minimum: 10 dilim',
    suggestionText: 'Günlük vitrin için: 20–30 dilim',
    minOrderQty: 10
  },
  {
    id: '5',
    name: 'Baklava',
    description: '1 kg',
    price: 380,
    image: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Özel günler için 2–3 kg önerilir',
    minOrderQty: 1
  },
  {
    id: '6',
    name: 'Sütlaç',
    description: '1 porsiyon',
    price: 45,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    is_active: true,
    minOrderText: 'Minimum: 10 porsiyon',
    suggestionText: 'Restoranlar için günlük: 15–25 porsiyon',
    minOrderQty: 10
  },
  {
    id: '7',
    name: 'Kazandibi',
    description: '1 porsiyon',
    price: 50,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    is_active: true,
    minOrderText: 'Minimum: 10 porsiyon',
    suggestionText: 'Özel menüler için: 12–20 porsiyon',
    minOrderQty: 10
  },
  {
    id: '8',
    name: 'Profiterol',
    description: '10 adet',
    price: 85,
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400',
    is_active: true,
    minOrderText: 'Minimum: 20 adet',
    suggestionText: 'Cafeler için günlük: 30–50 adet',
    minOrderQty: 20
  },
  {
    id: '9',
    name: 'Tiramisu',
    description: 'Tepsi',
    price: 140,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 tepsi',
    suggestionText: 'Restoranlar için 2–3 tepsi ideal',
    minOrderQty: 1
  },
  {
    id: '10',
    name: 'Cheesecake',
    description: 'Dilim',
    price: 55,
    image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400',
    is_active: true,
    minOrderText: 'Minimum: 8 dilim',
    suggestionText: 'Vitrin için ideal: 12–16 dilim',
    minOrderQty: 8
  },
  {
    id: '11',
    name: 'San Sebastian',
    description: 'Tam kek',
    price: 180,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kek',
    suggestionText: 'Özel günler için 2–3 kek önerilir',
    minOrderQty: 1
  },
  {
    id: '12',
    name: 'Brownie',
    description: '12 adet',
    price: 95,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    is_active: true,
    minOrderText: 'Minimum: 12 adet',
    suggestionText: 'Cafeler için günlük: 24–36 adet',
    minOrderQty: 12
  },
  {
    id: '13',
    name: 'Künefe',
    description: '1 porsiyon',
    price: 70,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    is_active: true,
    minOrderText: 'Minimum: 5 porsiyon',
    suggestionText: 'Restoranlar için günlük: 10–15 porsiyon',
    minOrderQty: 5
  },
  {
    id: '14',
    name: 'Revani',
    description: 'Tepsi',
    price: 110,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 tepsi',
    suggestionText: 'Toplu siparişler için: 2–4 tepsi',
    minOrderQty: 1
  },
  {
    id: '15',
    name: 'Tulumba Tatlısı',
    description: '1 kg',
    price: 120,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Özel günler için: 2–3 kg',
    minOrderQty: 1
  },
  {
    id: '16',
    name: 'Lokum',
    description: '500 gr',
    price: 90,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Oteller için haftalık: 3–5 kg',
    minOrderQty: 2
  },
  {
    id: '17',
    name: 'Kadayıf',
    description: '1 kg',
    price: 350,
    image: 'https://images.unsplash.com/photo-1534432182912-63863115e106?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Özel günler için: 2–4 kg',
    minOrderQty: 1
  },
  {
    id: '18',
    name: 'Şöbiyet',
    description: '1 kg',
    price: 320,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Toplu siparişler için: 3–5 kg',
    minOrderQty: 1
  },
  {
    id: '19',
    name: 'Havuç Dilim',
    description: 'Dilim',
    price: 48,
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    is_active: true,
    minOrderText: 'Minimum: 10 dilim',
    suggestionText: 'Günlük vitrin için: 15–25 dilim',
    minOrderQty: 10
  },
  {
    id: '20',
    name: 'Çikolatalı Pasta',
    description: 'Dilim',
    price: 52,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    is_active: true,
    minOrderText: 'Minimum: 10 dilim',
    suggestionText: 'Cafeler için günlük: 20–30 dilim',
    minOrderQty: 10
  },
  {
    id: '21',
    name: 'Frambuazlı Pasta',
    description: 'Dilim',
    price: 58,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
    is_active: true,
    minOrderText: 'Minimum: 8 dilim',
    suggestionText: 'Premium vitrin için: 12–20 dilim',
    minOrderQty: 8
  },
  {
    id: '22',
    name: 'Muzlu Rulo Pasta',
    description: 'Tepsi',
    price: 135,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 tepsi',
    suggestionText: 'Cafeler için haftalık: 2–3 tepsi',
    minOrderQty: 1
  },
  {
    id: '23',
    name: 'Fıstıklı Sarma',
    description: '1 kg',
    price: 420,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Premium siparişler için: 2–3 kg',
    minOrderQty: 1
  },
  {
    id: '24',
    name: 'İrmik Helvası',
    description: '1 kg',
    price: 85,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Toplu siparişler için: 3–5 kg',
    minOrderQty: 1
  },
  {
    id: '25',
    name: 'Kemalpaşa',
    description: '1 kg',
    price: 130,
    image: 'https://images.unsplash.com/photo-1534432182912-63863115e106?w=400',
    is_active: true,
    minOrderText: 'Minimum: 1 kg',
    suggestionText: 'Özel günler için: 2–4 kg',
    minOrderQty: 1
  }
];
