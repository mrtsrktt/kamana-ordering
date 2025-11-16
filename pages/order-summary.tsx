import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../lib/auth';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderSummary() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    setUser(currentUser);

    // Get cart from localStorage
    const savedCart = localStorage.getItem('kamana_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [router]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (cart.length > 0) {
      localStorage.setItem('kamana_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

    setLoading(true);

    const orderData = {
      businessName: user.businessName,
      phone: user.phone,
      items: cart,
      subtotal,
      notes,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        localStorage.removeItem('kamana_cart');
        router.push('/success');
      } else {
        alert('Sipariş gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="text-blue-600 mb-2"
          >
            ← Geri
          </button>
          <h1 className="text-xl font-bold">Sipariş Özeti</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-3">Ürünler</h2>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">{item.price} TL x {item.quantity}</p>
              </div>
              <p className="font-bold">{(item.price * item.quantity).toFixed(2)} TL</p>
            </div>
          ))}
          
          <div className="flex justify-between py-3 mt-2">
            <p className="font-bold">Ara Toplam</p>
            <p className="font-bold text-lg">{subtotal.toFixed(2)} TL</p>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Teslimat ücreti ve zamanı WhatsApp üzerinden bildirilecektir.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block font-bold mb-2">Teslimat Notu</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Adres, teslimat zamanı veya özel notlarınızı yazın..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Gönderiliyor...' : 'Siparişi Kamana\'ya Gönder'}
        </button>
      </div>
    </div>
  );
}
