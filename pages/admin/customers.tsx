import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderNumber: string;
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  timestamp: string;
  createdAt: string;
}

interface Customer {
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: Order[];
  favoriteProducts: Array<{
    name: string;
    count: number;
    totalSpent: number;
  }>;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'recent'>('recent');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchQuery, sortBy]);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/orders/list');
      const orders: Order[] = await response.json();
      
      const customerMap = new Map<string, Customer>();
      
      orders.forEach(order => {
        const key = order.phone;
        
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            businessName: order.businessName,
            businessType: order.businessType,
            phone: order.phone,
            address: order.address,
            orderCount: 0,
            totalSpent: 0,
            firstOrderDate: order.createdAt || order.timestamp,
            lastOrderDate: order.createdAt || order.timestamp,
            orders: [],
            favoriteProducts: []
          });
        }
        
        const customer = customerMap.get(key)!;
        customer.orderCount++;
        customer.totalSpent += order.subtotal;
        customer.orders.push(order);
        
        const orderDate = new Date(order.createdAt || order.timestamp);
        const firstDate = new Date(customer.firstOrderDate);
        const lastDate = new Date(customer.lastOrderDate);
        
        if (orderDate < firstDate) {
          customer.firstOrderDate = order.createdAt || order.timestamp;
        }
        if (orderDate > lastDate) {
          customer.lastOrderDate = order.createdAt || order.timestamp;
        }
      });
      
      customerMap.forEach(customer => {
        const productMap = new Map<string, { name: string; count: number; totalSpent: number }>();
        
        customer.orders.forEach(order => {
          order.items.forEach(item => {
            if (!productMap.has(item.id)) {
              productMap.set(item.id, {
                name: item.name,
                count: 0,
                totalSpent: 0
              });
            }
            const product = productMap.get(item.id)!;
            product.count += item.quantity;
            product.totalSpent += item.quantity * item.price;
          });
        });
        
        customer.favoriteProducts = Array.from(productMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      });
      
      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    if (searchQuery) {
      filtered = filtered.filter(customer => 
        customer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.businessName.localeCompare(b.businessName, 'tr');
        case 'orders':
          return b.orderCount - a.orderCount;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'recent':
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getBusinessTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'cafe': 'Cafe',
      'restoran': 'Restoran',
      'pastane': 'Pastane',
      'yemek-sirketi': 'Yemek Şirketi',
      'diger': 'Diğer'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Müşteriler yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
            <p className="text-gray-500 mt-1">Müşteri bilgilerini görüntüleyin</p>
          </div>
          <div className="text-sm text-gray-600">
            Toplam {customers.length} müşteri
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Müşteri</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Sipariş</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.orderCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Gelir</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(0)} ₺
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Ortalama</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {customers.length > 0 
                ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(0)
                : 0
              } ₺
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 İşletme adı veya telefon ara..."
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="recent">En Son Sipariş</option>
              <option value="name">İsme Göre (A-Z)</option>
              <option value="orders">En Çok Sipariş</option>
              <option value="spent">En Çok Harcama</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşletme</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sipariş</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Harcama</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Son Sipariş</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Müşteri bulunamadı
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.businessName}</p>
                        <p className="text-xs text-gray-500">{getBusinessTypeLabel(customer.businessType)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-900">{customer.phone}</p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">{customer.address.substring(0, 30)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900 text-sm">
                      {customer.totalSpent.toFixed(2)} ₺
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {new Date(customer.lastOrderDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 border border-gray-100">
              Müşteri bulunamadı
            </div>
          ) : (
            filteredCustomers.map((customer, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{customer.businessName}</h3>
                      <p className="text-xs text-gray-500">{getBusinessTypeLabel(customer.businessType)}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {customer.orderCount} sipariş
                    </span>
                  </div>

                  <div className="space-y-1 mb-3 text-sm">
                    <p className="text-gray-600">📞 {customer.phone}</p>
                    <p className="text-gray-600">💰 {customer.totalSpent.toFixed(2)} ₺</p>
                    <p className="text-gray-600">📅 {new Date(customer.lastOrderDate).toLocaleDateString('tr-TR')}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowDetailModal(true);
                    }}
                    className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                  >
                    Detaylı Görüntüle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCustomer.businessName}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Müşteri Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">İşletme Türü:</span>
                      <span className="font-medium text-gray-900">
                        {getBusinessTypeLabel(selectedCustomer.businessType)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefon:</span>
                      <a href={`tel:${selectedCustomer.phone}`} className="font-medium text-orange-600 hover:underline">
                        {selectedCustomer.phone}
                      </a>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 block mb-1">Adres:</span>
                      <span className="font-medium text-gray-900 text-xs">{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">İstatistikler</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Sipariş:</span>
                      <span className="font-bold text-gray-900">{selectedCustomer.orderCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Harcama:</span>
                      <span className="font-bold text-orange-600">
                        {selectedCustomer.totalSpent.toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ortalama Sepet:</span>
                      <span className="font-bold text-gray-900">
                        {(selectedCustomer.totalSpent / selectedCustomer.orderCount).toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">İlk Sipariş:</span>
                      <span className="font-medium text-gray-900 text-xs">
                        {formatDate(selectedCustomer.firstOrderDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Son Sipariş:</span>
                      <span className="font-medium text-gray-900 text-xs">
                        {formatDate(selectedCustomer.lastOrderDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favorite Products */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Favori Ürünler (Top 5)</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedCustomer.favoriteProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">Henüz favori ürün yok</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.favoriteProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.count} adet</p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 text-sm">
                            {product.totalSpent.toFixed(2)} ₺
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Sipariş Geçmişi</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.orders
                    .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
                    .map((order, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt || order.timestamp).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{order.subtotal.toFixed(2)} ₺</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-4 py-3 flex gap-2">
              <a
                href={`tel:${selectedCustomer.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 text-sm"
              >
                📞 Ara
              </a>
              <a
                href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 text-sm"
              >
                💬 WhatsApp
              </a>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
