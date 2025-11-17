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
  deliveryOption: string;
  deliveryDate: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  notes: string;
  timestamp: string;
  createdAt: string;
  status?: string;
  adminNotes?: string;
}

type OrderStatus = 'pending' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Beklemede',
  preparing: 'Hazırlanıyor',
  shipping: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi'
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  preparing: 'bg-blue-50 text-blue-700',
  shipping: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700'
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      const ordersWithStatus = data.map((order: Order) => ({
        ...order,
        status: order.status || 'pending',
        adminNotes: order.adminNotes || ''
      }));
      
      setOrders(ordersWithStatus);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp);
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.timestamp).getTime();
      const dateB = new Date(b.createdAt || b.timestamp).getTime();
      return dateB - dateA;
    });

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = (orderNumber: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.orderNumber === orderNumber 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const updateAdminNotes = (orderNumber: string, notes: string) => {
    setOrders(orders.map(order => 
      order.orderNumber === orderNumber 
        ? { ...order, adminNotes: notes }
        : order
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeliveryDate = (option: string, date: string) => {
    const deliveryDate = new Date(date);
    const formatted = deliveryDate.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (option === 'today') return `Bugün (${formatted})`;
    if (option === 'tomorrow') return `Yarın (${formatted})`;
    return formatted;
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
            <p className="text-gray-600">Siparişler yükleniyor...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            <p className="text-gray-500 mt-1">Siparişleri görüntüleyin ve yönetin</p>
          </div>
          <div className="text-sm text-gray-600">
            Toplam {orders.length} sipariş
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Sipariş no, işletme veya telefon ara..."
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="preparing">Hazırlanıyor</option>
              <option value="shipping">Yolda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşletme</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.orderNumber} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.businessName}</p>
                        <p className="text-xs text-gray-500">{getBusinessTypeLabel(order.businessType)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt || order.timestamp).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{order.subtotal.toFixed(2)} ₺</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value as OrderStatus)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status as OrderStatus]}`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
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
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 border border-gray-100">
              Sipariş bulunamadı
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.orderNumber} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt || order.timestamp).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value as OrderStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[order.status as OrderStatus]}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">{order.businessName}</p>
                    <p className="text-xs text-gray-500">{getBusinessTypeLabel(order.businessType)}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">{order.subtotal.toFixed(2)} ₺</span>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                    >
                      Detay
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Sipariş #{selectedOrder.orderNumber}
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
              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Durumu</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.orderNumber, e.target.value as OrderStatus);
                    setSelectedOrder({...selectedOrder, status: e.target.value});
                  }}
                  className={`w-full px-3 py-2 rounded-lg font-medium text-sm ${statusColors[selectedOrder.status as OrderStatus]}`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Müşteri Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">İşletme:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tür:</span>
                    <span className="font-medium text-gray-900">{getBusinessTypeLabel(selectedOrder.businessType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefon:</span>
                    <a href={`tel:${selectedOrder.phone}`} className="font-medium text-orange-600 hover:underline">
                      {selectedOrder.phone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teslimat:</span>
                    <span className="font-medium text-gray-900">
                      {formatDeliveryDate(selectedOrder.deliveryOption, selectedOrder.deliveryDate)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 block mb-1">Adres:</span>
                    <span className="font-medium text-gray-900 text-xs">{selectedOrder.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Sipariş Ürünleri</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {item.price} ₺</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        {(item.quantity * item.price).toFixed(2)} ₺
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 font-bold">
                    <span className="text-gray-900">Toplam:</span>
                    <span className="text-orange-600">{selectedOrder.subtotal.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">Müşteri Notu</h3>
                  <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notları</label>
                <textarea
                  value={selectedOrder.adminNotes}
                  onChange={(e) => {
                    updateAdminNotes(selectedOrder.orderNumber, e.target.value);
                    setSelectedOrder({...selectedOrder, adminNotes: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                  rows={3}
                  placeholder="Sipariş hakkında notlar ekleyin..."
                />
              </div>

              {/* Order Info */}
              <div className="text-xs text-gray-500 text-center pt-3 border-t">
                Sipariş Tarihi: {formatDate(selectedOrder.createdAt || selectedOrder.timestamp)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-4 py-3 flex gap-2">
              <a
                href={`tel:${selectedOrder.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 text-sm"
              >
                📞 Ara
              </a>
              <a
                href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, '')}`}
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
