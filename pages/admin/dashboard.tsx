import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { NotificationManager } from '../../lib/notifications';

interface Order {
  orderNumber: string;
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  subtotal: number;
  timestamp: string;
  createdAt: string;
}

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  topProduct: { name: string; count: number };
  pendingOrders: number;
  weeklyData: Array<{ day: string; revenue: number }>;
  topProducts: Array<{ name: string; count: number; revenue: number }>;
  recentOrders: Order[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    NotificationManager.requestPermission();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/orders/list');
      const orders: Order[] = await response.json();
      calculateStats(orders);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: Order[]) => {
    // Client-side only date calculations
    if (typeof window === 'undefined') {
      return;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Bugünkü siparişler
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt || o.timestamp);
      return orderDate >= today;
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.subtotal, 0);
    
    // En çok satılan ürün
    const productMap = new Map<string, number>();
    orders.forEach(order => {
      order.items.forEach(item => {
        productMap.set(item.name, (productMap.get(item.name) || 0) + item.quantity);
      });
    });
    const topProductEntry = Array.from(productMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const topProduct = topProductEntry ? { name: topProductEntry[0], count: topProductEntry[1] } : { name: '-', count: 0 };
    
    // Bekleyen siparişler (son 7 gün)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const pendingOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt || o.timestamp);
      return orderDate >= weekAgo;
    }).length;
    
    // Haftalık veri
    const weeklyData = [];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt || o.timestamp);
        return orderDate.toDateString() === date.toDateString();
      });
      weeklyData.push({
        day: dayNames[date.getDay()],
        revenue: dayOrders.reduce((sum, o) => sum + o.subtotal, 0)
      });
    }
    
    // Top 5 ürünler
    const productRevenue = new Map<string, { count: number; revenue: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productRevenue.get(item.name) || { count: 0, revenue: 0 };
        existing.count += item.quantity;
        existing.revenue += item.quantity * item.price;
        productRevenue.set(item.name, existing);
      });
    });
    const topProducts = Array.from(productRevenue.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Son siparişler
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
      .slice(0, 5);
    
    setStats({
      todayOrders: todayOrders.length,
      todayRevenue,
      topProduct,
      pendingOrders,
      weeklyData,
      topProducts,
      recentOrders
    });
  };

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const maxRevenue = Math.max(...(stats?.weeklyData.map(d => d.revenue) || [1]));

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header - Desktop Only */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">İşletme özetinizi görüntüleyin</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-medium">Bugün</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.todayOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl">💰</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-medium">Satış</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.todayRevenue.toFixed(0)} ₺</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl">⭐</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-medium">Popüler</p>
                <p className="text-sm md:text-base font-bold text-gray-900 truncate">{stats?.topProduct.name}</p>
                <p className="text-xs text-gray-500">{stats?.topProduct.count} adet</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl">📈</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase font-medium">7 Gün</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 md:mb-6">
          {/* Weekly Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Son 7 Gün Satış</h2>
            <div className="flex items-end justify-between h-40 md:h-48 gap-2">
              {stats?.weeklyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80 relative group"
                      style={{ 
                        height: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%`, 
                        minHeight: day.revenue > 0 ? '8px' : '0' 
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.revenue.toFixed(0)} ₺
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">En Çok Satılan Ürünler</h2>
            <div className="space-y-3">
              {stats?.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs md:text-sm font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.count} adet</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{product.revenue.toFixed(0)} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Son Siparişler</h2>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşletme</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentOrders.map((order) => (
                  <tr key={order.orderNumber} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{order.businessName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt || order.timestamp).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">{order.subtotal.toFixed(2)} ₺</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {stats?.recentOrders.map((order) => (
              <div key={order.orderNumber} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
                  <span className="text-sm font-bold text-gray-900">{order.subtotal.toFixed(2)} ₺</span>
                </div>
                <p className="text-sm text-gray-700">{order.businessName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt || order.timestamp).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
