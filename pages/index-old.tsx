import { useState } from 'react';
import { products } from '../lib/products';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export default function Home() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

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
                quantity,
                image: product.image
            }]);
        }
    };

    const getQuantity = (productId: string): number => {
        return cart.find(item => item.id === productId)?.quantity || 0;
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSubmitOrder = async () => {
        if (!businessName.trim() || !phone.trim() || !address.trim()) {
            alert('Lütfen işletme adı, telefon ve adres bilgilerini girin');
            return;
        }

        setLoading(true);

        const orderData = {
            businessName,
            phone,
            address,
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
                setOrderSuccess(true);
                setCart([]);
                setShowCheckout(false);
                setShowOrderSummary(false);
            } else {
                alert('Sipariş gönderilemedi. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <h1 className="text-2xl font-bold mb-4">Siparişiniz Alındı!</h1>
                    <p className="text-gray-700 mb-2 leading-relaxed">
                        Siparişinizi aldık. Detaylar ve teslim için sizi birazdan arayıp bilgi vereceğiz. Onaylarsanız sevkiyatınızı gerçekleştireceğiz.
                    </p>
                    <p className="text-gray-800 font-medium mt-4">
                        Saygılarımızla<br />
                        <span className="text-blue-600">Kamana Pastanesi</span>
                    </p>
                    <button
                        onClick={() => {
                            setOrderSuccess(false);
                            setBusinessName('');
                            setPhone('');
                            setAddress('');
                            setNotes('');
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Yeni Sipariş
                    </button>
                </div>
            </div>
        );
    }

    if (showCheckout) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <button
                            onClick={() => setShowCheckout(false)}
                            className="text-blue-600 mb-2"
                        >
                            ← Geri
                        </button>
                        <h1 className="text-xl font-bold">Sipariş Bilgileri</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h2 className="font-bold mb-3">İletişim Bilgileri</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">İşletme Adı *</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: Cafe Latte"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Telefon *</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="05XX XXX XX XX"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Adres *</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border rounded-lg p-3 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Teslimat adresinizi yazın..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Teslimat Notu</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full border rounded-lg p-3 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Teslimat zamanı veya özel notlarınızı yazın..."
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h2 className="font-bold mb-3">Sipariş Özeti</h2>
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
                            <p className="font-bold">Toplam</p>
                            <p className="font-bold text-lg">{subtotal.toFixed(2)} TL</p>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                            Teslimat ücreti ve zamanı WhatsApp üzerinden bildirilecektir.
                        </p>
                    </div>

                    <button
                        onClick={handleSubmitOrder}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Gönderiliyor...' : 'Siparişi Gönder'}
                    </button>
                </div>
            </div>
        );
    }

    if (showOrderSummary) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <button
                            onClick={() => setShowOrderSummary(false)}
                            className="text-blue-600 mb-2"
                        >
                            ← Ürünlere Dön
                        </button>
                        <h1 className="text-xl font-bold">Sipariş Özeti</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-3 border-b">
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">{item.price} TL x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold">{(item.price * item.quantity).toFixed(2)} TL</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between py-4 mt-2">
                            <p className="font-bold text-lg">Toplam</p>
                            <p className="font-bold text-xl text-blue-600">{subtotal.toFixed(2)} TL</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 mb-4"
                    >
                        İletişim Bilgilerini Gir
                    </button>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Siparişinizi gönderdikten sonra iletişim bilgilerinizi girin. 30 dakika içinde size ulaşıp fiyat ve teslimat detaylarını paylaşacağız. Onayınızın ardından siparişinizi hazırlayıp teslim edeceğiz.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold">Kamana Pastanesi</h1>
                    <p className="text-sm text-gray-600">Toptan Sipariş</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 mb-3">
                        İstanbul Anadolu Yakası'nın en taze ve lezzetli tatlılarını cafe, restoran, otel ve pastanelere toptan olarak sunuyoruz.
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        İlk siparişinizi görmek için siparişinizi oluşturun ve bize gönderin. Siparişinizi inceleyip hemen size dönüş yapalım ve bilgilendirelim. Ardından siparişinizi işleme alalım.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="tel:+905551234567"
                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            <span className="text-xl">📞</span>
                            <span>Telefon</span>
                        </a>
                        <a
                            href="https://wa.me/905551234567"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition"
                        >
                            <span className="text-xl">💬</span>
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
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
                            onClick={() => setShowOrderSummary(true)}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                        >
                            Devam Et
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
