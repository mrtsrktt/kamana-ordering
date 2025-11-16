import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../lib/auth';
import { products } from '../lib/products';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Products() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const activeProducts = products.filter(p => p.is_active);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity 
      }]);
    }
  };

  const getQuantity = (productId: string): number => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Kamana Pastanesi</h1>
          <p className="text-sm text-gray-600">{user.businessName}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <p className="text-lg font-bold text-blue-600 mb-3">{product.price} TL</p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                    className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={getQuantity(product.id)}
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                    className="w-16 text-center border rounded-lg py-2"
                    min="0"
                  />
                  <button
                    onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                    className="w-10 h-10 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{itemCount} ürün</span>
              <span className="text-xl font-bold">{subtotal.toFixed(2)} TL</span>
            </div>
            <button
              onClick={() => router.push('/order-summary')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Siparişi Görüntüle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
