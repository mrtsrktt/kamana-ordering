import { useState, useEffect } from 'react';
import { Product } from '../lib/products';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Settings {
    businessName: string;
    phone: string;
    whatsapp: string;
    email: string;
    city: string;
    region: string;
    address: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [deliveryOption, setDeliveryOption] = useState<'today' | 'tomorrow' | 'date'>('tomorrow');
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderData, setOrderData] = useState<any>(null);
    const [hasLastOrder, setHasLastOrder] = useState(false);

    const activeProducts = products;

    // Fetch products and settings from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setProductsLoading(true);
                
                // Fetch products
                const productsResponse = await fetch('/api/products');
                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    setProducts(productsData);
                }
                
                // Fetch settings
                const settingsResponse = await fetch('/api/settings');
                if (settingsResponse.ok) {
                    const settingsData = await settingsResponse.json();
                    setSettings(settingsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchData();
    }, []);

    // LocalStorage'dan son siparişi kontrol et (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastOrder = localStorage.getItem('lastOrder');
            setHasLastOrder(!!lastOrder);
        }
    }, []);

    // Son siparişi tekrar yükle
    const loadLastOrder = () => {
        if (typeof window !== 'undefined') {
            const lastOrderStr = localStorage.getItem('lastOrder');
            if (lastOrderStr) {
                try {
                    const lastOrder = JSON.parse(lastOrderStr);
                    const restoredCart: CartItem[] = [];
                    
                    lastOrder.items.forEach((item: { id: string; quantity: number }) => {
                        const product = products.find(p => p.id === item.id);
                        if (product && product.is_active) {
                            restoredCart.push({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: item.quantity,
                                image: product.image
                            });
                        }
                    });

                    setCart(restoredCart);
                    alert('Son siparişiniz sepete eklendi!');
                } catch (error) {
                    console.error('Son sipariş yüklenemedi:', error);
                }
            }
        }
    };

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

    const handleIncrement = (productId: string) => {
        const currentQty = getQuantity(productId);
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const minQty = product.minOrderQty ?? 1;

        if (currentQty === 0) {
            // 0'dan direkt minimum adede zıpla
            updateQuantity(productId, minQty);
        } else {
            // Normal artış
            updateQuantity(productId, currentQty + 1);
        }
    };

    const handleDecrement = (productId: string) => {
        const currentQty = getQuantity(productId);
        if (currentQty === 0) return;

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const minQty = product.minOrderQty ?? 1;

        if (currentQty > minQty) {
            // Normal azaltma
            updateQuantity(productId, currentQty - 1);
        } else if (currentQty === minQty) {
            // Minimumdan bir kez daha azaltılırsa tamamen kaldır
            updateQuantity(productId, 0);
        }
    };

    const getQuantity = (productId: string): number => {
        return cart.find(item => item.id === productId)?.quantity || 0;
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSubmitOrder = async () => {
        if (!businessName.trim() || !businessType.trim() || !phone.trim() || !address.trim()) {
            alert('Lütfen işletme adı, işletme türü, telefon ve adres bilgilerini girin');
            return;
        }

        // Teslimat tarihi validasyonu
        if (deliveryOption === 'date' && !deliveryDate) {
            alert('Lütfen teslimat tarihini seçin');
            return;
        }

        setLoading(true);

        // Teslimat tarihini hesapla
        let finalDeliveryDate = '';
        if (deliveryOption === 'today') {
            finalDeliveryDate = new Date().toISOString().split('T')[0];
        } else if (deliveryOption === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            finalDeliveryDate = tomorrow.toISOString().split('T')[0];
        } else {
            finalDeliveryDate = deliveryDate;
        }

        // 5 haneli rastgele sipariş numarası oluştur
        const generatedOrderNumber = Math.floor(10000 + Math.random() * 90000).toString();
        setOrderNumber(generatedOrderNumber);

        const orderDataToSend = {
            orderNumber: generatedOrderNumber,
            businessName,
            businessType,
            deliveryOption,
            deliveryDate: finalDeliveryDate,
            phone,
            email,
            address,
            items: cart,
            subtotal,
            notes,
            timestamp: new Date().toISOString()
        };
        
        // Success ekranı için orderData'yı sakla
        setOrderData(orderDataToSend);

        try {
            // Email gönder
            const emailResponse = await fetch('/api/submit-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDataToSend)
            });

            // Siparişi kaydet (dashboard için)
            await fetch('/api/orders/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDataToSend)
            });

            if (emailResponse.ok) {
                // Son siparişi LocalStorage'a kaydet
                if (typeof window !== 'undefined') {
                    const lastOrder = {
                        items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                        subtotal,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem('lastOrder', JSON.stringify(lastOrder));
                    setHasLastOrder(true);
                }

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

    // Success Screen
    if (orderSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white">
                <div className="bg-white rounded-card shadow-sm p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="bg-kamana-secondary rounded-card px-4 py-2 mb-4 inline-block">
                        <p className="text-sm text-gray-600">Sipariş No</p>
                        <p className="text-2xl font-bold text-kamana-primary">{orderNumber}</p>
                    </div>
                    <h1 className="text-2xl font-bold mb-3 text-kamana-text">{orderNumber} numaralı sipariş bilgileriniz bize ulaştı 👏</h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Detaylar ve sevkiyat için sizi birazdan arayıp bilgi vereceğiz. Onaylarsanız sevkiyatınızı gerçekleştireceğiz.
                    </p>
                    <p className="text-kamana-text font-medium mb-6">
                        Saygılarımızla<br />
                        <span className="text-kamana-primary">Kamana Pastanesi</span>
                    </p>
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={async () => {
                                if (orderData) {
                                    // HTML içerik oluştur
                                    const pdfContent = document.createElement('div');
                                    pdfContent.style.width = '800px';
                                    pdfContent.style.padding = '40px';
                                    pdfContent.style.backgroundColor = '#ffffff';
                                    pdfContent.style.fontFamily = 'Arial, sans-serif';
                                    
                                    pdfContent.innerHTML = `
                                        <div style="background: linear-gradient(135deg, #C27C5B 0%, #D4956D 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                                            <h1 style="color: white; font-size: 32px; margin: 0; letter-spacing: 2px;">KAMANA PASTANESİ</h1>
                                            <p style="color: white; font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">Sipariş Formu</p>
                                        </div>
                                        
                                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <p style="color: #666; font-size: 12px; margin: 0;">Sipariş No:</p>
                                                    <p style="font-size: 24px; font-weight: bold; margin: 5px 0 0 0;">${orderNumber}</p>
                                                </div>
                                                <div style="text-align: right;">
                                                    <p style="color: #666; font-size: 11px; margin: 0;">
                                                        ${new Date().toLocaleDateString('tr-TR', { 
                                                            day: '2-digit', 
                                                            month: 'long', 
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style="margin-bottom: 25px;">
                                            <div style="border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 15px;">
                                                <h2 style="font-size: 16px; margin: 0; color: #1f2937;">MÜŞTERİ BİLGİLERİ</h2>
                                            </div>
                                            <table style="width: 100%; font-size: 13px;">
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666; width: 150px;"><strong>İşletme:</strong></td>
                                                    <td style="padding: 8px 0;">${orderData.businessName}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666;"><strong>Telefon:</strong></td>
                                                    <td style="padding: 8px 0;">${orderData.phone}</td>
                                                </tr>
                                                ${orderData.email ? `
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                                                    <td style="padding: 8px 0;">${orderData.email}</td>
                                                </tr>
                                                ` : ''}
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Adres:</strong></td>
                                                    <td style="padding: 8px 0;">${orderData.address}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <div style="margin-bottom: 25px;">
                                            <div style="border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 15px;">
                                                <h2 style="font-size: 16px; margin: 0; color: #1f2937;">TESLİMAT BİLGİLERİ</h2>
                                            </div>
                                            <table style="width: 100%; font-size: 13px;">
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666; width: 150px;"><strong>Teslimat Tarihi:</strong></td>
                                                    <td style="padding: 8px 0;">${new Date(orderData.deliveryDate).toLocaleDateString('tr-TR')}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <div style="margin-bottom: 25px;">
                                            <div style="border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 15px;">
                                                <h2 style="font-size: 16px; margin: 0; color: #1f2937;">SİPARİŞ DETAYLARI</h2>
                                            </div>
                                            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                                <thead>
                                                    <tr style="background: #f5f5f5;">
                                                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Ürün</th>
                                                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Miktar</th>
                                                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Birim Fiyat</th>
                                                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Tutar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${orderData.items.map((item: any, index: number) => `
                                                        <tr style="background: ${index % 2 === 0 ? '#fafafa' : 'white'};">
                                                            <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${item.name}</td>
                                                            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
                                                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">${item.price.toFixed(2)} TL</td>
                                                            <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${(item.quantity * item.price).toFixed(2)} TL</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <span style="color: white; font-size: 18px; font-weight: bold;">TOPLAM:</span>
                                                <span style="color: white; font-size: 24px; font-weight: bold;">${orderData.subtotal.toFixed(2)} TL</span>
                                            </div>
                                        </div>
                                        
                                        ${orderData.notes ? `
                                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
                                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">📝 Teslimat Notu:</p>
                                            <p style="margin: 0; color: #78350f; font-size: 13px;">${orderData.notes}</p>
                                        </div>
                                        ` : ''}
                                        
                                        <div style="text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 11px;">
                                            <p style="margin: 5px 0;">Kamana Pastanesi - Tel: 0533-197-9632</p>
                                            <p style="margin: 5px 0; font-style: italic;">Bu belge otomatik olarak oluşturulmuştur.</p>
                                        </div>
                                    `;
                                    
                                    // Geçici olarak body'ye ekle
                                    document.body.appendChild(pdfContent);
                                    
                                    // HTML'i canvas'a çevir
                                    const canvas = await html2canvas(pdfContent, {
                                        scale: 2,
                                        useCORS: true,
                                        logging: false
                                    });
                                    
                                    // Canvas'ı temizle
                                    document.body.removeChild(pdfContent);
                                    
                                    // PDF oluştur
                                    const imgData = canvas.toDataURL('image/png');
                                    const doc = new jsPDF({
                                        orientation: 'portrait',
                                        unit: 'mm',
                                        format: 'a4'
                                    });
                                    
                                    const imgWidth = 210; // A4 width in mm
                                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                    
                                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                                    
                                    // PDF'i indir
                                    doc.save(`Kamana-Siparis-${orderNumber}.pdf`);
                                }
                            }}
                            className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
                        >
                            📄 Sipariş Formunu İndir (PDF)
                        </button>
                        
                        <button
                            onClick={() => {
                                setOrderSuccess(false);
                                setBusinessName('');
                                setBusinessType('');
                                setDeliveryOption('tomorrow');
                                setDeliveryDate('');
                                setPhone('');
                                setEmail('');
                                setAddress('');
                                setNotes('');
                                setOrderData(null);
                            }}
                            className="w-full bg-kamana-primary text-white py-3 rounded-full font-medium hover:opacity-90"
                        >
                            Ürünlere geri dön
                        </button>
                    </div>

                    {/* İletişim Butonları */}
                    <div className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-600 mb-3 text-center">Acil durumlarda aşağıdaki butonlardan bize ulaşabilirsiniz</p>
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={`tel:${settings?.phone || '05331979632'}`}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                <span>📞</span>
                                <span>Telefon</span>
                            </a>
                            <a
                                href={`https://wa.me/${settings?.whatsapp || '905331979632'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                                <span>💬</span>
                                <span>WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Checkout Screen
    if (showCheckout) {
        return (
            <div className="min-h-screen bg-white">
                <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
                    <div className="max-w-2xl mx-auto px-4 py-4">
                        <button
                            onClick={() => setShowCheckout(false)}
                            className="text-kamana-primary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Geri
                        </button>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                    <h1 className="text-2xl font-bold mb-6 text-kamana-text">Sipariş Bilgileri</h1>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">İşletme Adı *</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-card focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent"
                                placeholder="Örn: Cafe Latte"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">İşletme Türü *</label>
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-card focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent bg-white"
                                required
                            >
                                <option value="">Seçiniz...</option>
                                <option value="cafe">Cafe</option>
                                <option value="restoran">Restoran</option>
                                <option value="pastane">Pastane</option>
                                <option value="yemek-sirketi">Yemek Şirketi</option>
                                <option value="diger">Diğer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">Teslimat Günü *</label>
                            <select
                                value={deliveryOption}
                                onChange={(e) => setDeliveryOption(e.target.value as 'today' | 'tomorrow' | 'date')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-card focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent bg-white"
                                required
                            >
                                <option value="today">Bugün</option>
                                <option value="tomorrow">Yarın</option>
                                <option value="date">Tarih Seç</option>
                            </select>
                            {deliveryOption === 'date' && (
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-card focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent mt-2"
                                    required
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">Telefon *</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-card focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent"
                                placeholder="05XX XXX XX XX"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-card focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent"
                                placeholder="ornek@email.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">sipariş bildirimleri alabilmek için lütfen e-mail adresinizi yazın</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">Adres *</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border border-gray-200 rounded-card p-3 h-20 focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent resize-none"
                                placeholder="Teslimat adresinizi yazın..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-kamana-text">Teslimat Notu</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full border border-gray-200 rounded-card p-3 h-24 focus:outline-none focus:ring-2 focus:ring-kamana-primary focus:border-transparent resize-none"
                                placeholder={`Örn: "San Sebastian iyi pişmiş olsun",  "Saat 11'den önce getirmeyin",  "Arka kapıdan teslim edilecek, yetkili kişi: Ali Bey"`}
                            />
                        </div>
                    </div>

                    <div className="bg-kamana-secondary rounded-card p-4 mb-6">
                        <h2 className="font-bold mb-3 text-kamana-text">Sipariş Özeti</h2>
                        <div className="space-y-2">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} · {item.quantity} x {item.price}₺</span>
                                    <span className="font-medium text-kamana-text">{(item.price * item.quantity).toFixed(2)}₺</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                            <span className="font-bold text-kamana-text">Genel Toplam</span>
                            <span className="font-bold text-lg text-kamana-primary">{subtotal.toFixed(2)}₺</span>
                        </div>
                    </div>

                </div>

                {/* Sticky Bottom Button */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
                    <div className="max-w-2xl mx-auto px-4 py-4">
                        <button
                            onClick={handleSubmitOrder}
                            disabled={loading}
                            className="w-full bg-kamana-primary text-white py-4 rounded-card font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Gönderiliyor...' : 'Siparişi Gönder'}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-3 leading-relaxed">
                            Siparişiniz bize ulaştığında, 30 dakika içinde sizi arayıp teslimat ve detayları birlikte netleştireceğiz.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Order Summary Screen
    if (showOrderSummary) {
        return (
            <div className="min-h-screen bg-white">
                <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
                    <div className="max-w-2xl mx-auto px-4 py-4">
                        <button
                            onClick={() => setShowOrderSummary(false)}
                            className="text-kamana-primary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Ürünlere Dön
                        </button>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                    <h1 className="text-2xl font-bold mb-6 text-kamana-text">Sipariş Özeti</h1>

                    {/* Bilgi Kutusu */}
                    <div className="w-full max-w-xl mx-auto bg-kamana-secondary rounded-xl p-4 mb-6 shadow-sm">
                        <div className="space-y-2.5">
                            <div className="flex items-start gap-2">
                                <span className="text-base flex-shrink-0">📌</span>
                                <p className="text-sm text-gray-700 leading-relaxed">Fiyatlar KDV dahil değildir.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-base flex-shrink-0">✅</span>
                                <p className="text-sm text-gray-700 leading-relaxed">Ürünler <span className="font-extrabold text-gray-900">siparişinize özel</span> günlük taze üretilir.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-base flex-shrink-0">🚚</span>
                                <p className="text-sm text-gray-700 leading-relaxed">Teslimat bölgeleri: Anadolu Yakası</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white border border-gray-100 rounded-card p-4">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-image" />
                                    <div className="flex-1">
                                        <p className="font-medium text-kamana-text">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x {item.price}₺</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDecrement(item.id)}
                                            className="w-8 h-8 bg-gray-100 rounded-full font-bold hover:bg-gray-200 flex items-center justify-center"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => handleIncrement(item.id)}
                                            className="w-8 h-8 bg-kamana-primary text-white rounded-full font-bold hover:opacity-90 flex items-center justify-center"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="font-bold text-kamana-text min-w-[80px] text-right">{(item.price * item.quantity).toFixed(2)}₺</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-kamana-secondary rounded-card p-5 mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Ara Toplam</span>
                            <span className="font-medium text-kamana-text">{subtotal.toFixed(2)}₺</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                            <span className="font-bold text-kamana-text text-lg">Genel Toplam</span>
                            <span className="font-bold text-xl text-kamana-primary">{subtotal.toFixed(2)}₺</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-kamana-primary text-white py-4 rounded-card font-medium hover:opacity-90 mb-4"
                    >
                        İletişim Bilgilerini Gir
                    </button>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Siparişinizi gönderin, 30 dk içinde sizi, teslimat ve detaylar için arayacağız. Onaylarsanız siparişinizi sevk edeceğiz.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main Product List Screen
    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <div className="h-14 max-w-2xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-kamana-primary rounded-full flex items-center justify-center text-white font-bold">
                            K
                        </div>
                        <span className="font-bold text-kamana-text">Kamana</span>
                    </div>
                    <span className="text-xs bg-kamana-secondary text-kamana-primary px-3 py-1 rounded-full font-medium animate-pulse">
                        🔥 <span className="font-extrabold">Siparişinize Özel</span> Günlük Üretim
                    </span>
                </div>
                <div className="bg-kamana-secondary py-2 px-4">
                    <p className="text-xs text-center text-gray-600 max-w-2xl mx-auto">
                        Teslimat: {settings?.city || 'İstanbul'} {settings?.region || 'Anadolu Yakası'}
                    </p>
                </div>
            </div>

            {/* Info Section */}
            <div className="max-w-2xl mx-auto px-4 py-5">
                <div className="bg-kamana-secondary rounded-card p-3.5 mb-5">
                    <p className="text-gray-700 mb-2.5 text-sm leading-relaxed">
                        İşletmenize her gün taze, kaliteli ve hazır satışa uygun tatlılar ulaştırıyoruz. Kamana ile ürün derdi yaşamadan satışlarınıza odaklanın.
                    </p>
                    
                    {/* Avantaj Etiketleri */}
                    <div className="flex flex-col gap-1.5 mb-3">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-1 h-1 rounded-full bg-kamana-primary flex-shrink-0"></span>
                            <span>Günlük taze teslimat</span>
                        </div>
                        <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-1 h-1 rounded-full bg-kamana-primary flex-shrink-0"></span>
                            <span>Pastane üretimi – kalite garantisi</span>
                        </div>
                        <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-1 h-1 rounded-full bg-kamana-primary flex-shrink-0"></span>
                            <span>Sipariş sonrası hızlı dönüş</span>
                        </div>
                    </div>

                    {/* İletişim Butonları */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <a
                            href={`tel:${settings?.phone || '05551234567'}`}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-full text-sm font-medium hover:bg-green-700"
                        >
                            <span>📞</span>
                            <span>Telefon</span>
                        </a>
                        <a
                            href={`https://wa.me/${settings?.whatsapp || '905551234567'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-full text-sm font-medium hover:bg-green-600"
                        >
                            <span>💬</span>
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>

                {/* Son Sipariş Butonu */}
                {hasLastOrder && (
                    <div className="mb-5">
                        <button
                            onClick={loadLastOrder}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-card text-sm font-semibold hover:bg-blue-600 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Son Siparişi Tekrar Ver</span>
                        </button>
                    </div>
                )}

                {/* Product Cards - 2 Sütunlu Grid */}
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                    {productsLoading ? (
                        <div className="col-span-2 md:col-span-3 text-center py-12">
                            <p className="text-gray-500">Ürünler yükleniyor...</p>
                        </div>
                    ) : activeProducts.length === 0 ? (
                        <div className="col-span-2 md:col-span-3 text-center py-12">
                            <p className="text-gray-500">Henüz ürün bulunmuyor</p>
                        </div>
                    ) : activeProducts.map(product => {
                        const qty = getQuantity(product.id);
                        const isInCart = qty > 0;

                        return (
                            <div
                                key={product.id}
                                className={`bg-white rounded-card p-1.5 shadow-sm transition-all ${isInCart ? 'border-2 border-kamana-primary' : 'border border-gray-100'
                                    }`}
                            >
                                {/* Ürün Görseli - Kare */}
                                <div className="relative w-full aspect-square overflow-hidden rounded-image mb-1">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {isInCart && (
                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-kamana-primary rounded-full flex items-center justify-center shadow-sm">
                                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Ürün Bilgileri */}
                                <div className="px-0.5">
                                    {/* Ürün Adı */}
                                    <h3 className="font-bold text-xs text-kamana-text leading-tight mb-0.5 line-clamp-1">{product.name}</h3>
                                    
                                    {/* Açıklama */}
                                    <p className="text-[10px] text-gray-500 mb-1 leading-tight line-clamp-1">{product.description}</p>

                                    {/* Fiyat Satırı */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-kamana-primary font-bold text-sm">{product.price}₺</span>
                                        <span className="text-[9px] text-gray-400">/ adet</span>
                                    </div>

                                    {/* Ticari Bilgiler */}
                                    {(product.minOrderText || product.suggestionText) && (
                                        <div className="mb-1 space-y-0.5">
                                            {product.minOrderText && (
                                                <p className="text-[10px] text-gray-500 leading-tight">{product.minOrderText}</p>
                                            )}
                                            {product.suggestionText && (
                                                <p className="text-[10px] text-gray-400 leading-tight">{product.suggestionText}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Adet Kontrol */}
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <button
                                            onClick={() => handleDecrement(product.id)}
                                            className="w-6 h-6 bg-gray-100 rounded-full font-bold hover:bg-gray-200 flex items-center justify-center text-xs transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-semibold text-kamana-text text-xs">{qty}</span>
                                        <button
                                            onClick={() => handleIncrement(product.id)}
                                            className="w-6 h-6 bg-kamana-primary text-white rounded-full font-bold hover:opacity-90 flex items-center justify-center text-xs transition-all"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Sepette Butonu - Tam Genişlik */}
                                    {isInCart && (
                                        <button
                                            className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-500 text-white py-1.5 rounded-full text-[11px] font-semibold hover:bg-emerald-600 hover:scale-[0.98] active:scale-95 transition-all duration-150 ease-out shadow-sm"
                                            onClick={() => setShowOrderSummary(true)}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Sepette</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer - Adres Bilgisi */}
            {settings && (
                <div className="max-w-2xl mx-auto px-4 mt-8 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-kamana-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-kamana-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-semibold text-kamana-text mb-1">{settings.businessName}</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {settings.address}<br />
                                    {settings.city}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    📞 {settings.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Bottom Cart Bar */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
                    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg text-kamana-text">Toplam: {subtotal.toFixed(2)}₺</p>
                            <p className="text-xs text-gray-500">{itemCount} ürün seçili</p>
                        </div>
                        <button
                            onClick={() => setShowOrderSummary(true)}
                            className="bg-kamana-primary text-white px-8 py-3 rounded-l-card font-medium hover:opacity-90 h-full"
                        >
                            Siparişi Gör
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
