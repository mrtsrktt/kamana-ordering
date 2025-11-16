import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Order {
  orderNumber: string;
  businessName: string;
  businessType: string;
  phone: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  subtotal: number;
  timestamp: string;
  createdAt: string;
}

type ReportType = 'daily' | 'product' | 'customer';

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders/list');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDate = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.timestamp);
      return orderDate >= start && orderDate <= end;
    });
  };

  const generateDailyReport = () => {
    const filtered = filterOrdersByDate();
    const dailyData = new Map<string, { count: number; total: number; orders: Order[] }>();

    filtered.forEach(order => {
      const date = new Date(order.createdAt || order.timestamp).toLocaleDateString('tr-TR');
      if (!dailyData.has(date)) {
        dailyData.set(date, { count: 0, total: 0, orders: [] });
      }
      const day = dailyData.get(date)!;
      day.count++;
      day.total += order.subtotal;
      day.orders.push(order);
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const generateProductReport = () => {
    const filtered = filterOrdersByDate();
    const productData = new Map<string, { name: string; quantity: number; revenue: number; orderCount: number }>();

    filtered.forEach(order => {
      order.items.forEach(item => {
        if (!productData.has(item.id)) {
          productData.set(item.id, { name: item.name, quantity: 0, revenue: 0, orderCount: 0 });
        }
        const product = productData.get(item.id)!;
        product.quantity += item.quantity;
        product.revenue += item.quantity * item.price;
        product.orderCount++;
      });
    });

    return Array.from(productData.values())
      .sort((a, b) => b.revenue - a.revenue);
  };

  const generateCustomerReport = () => {
    const filtered = filterOrdersByDate();
    const customerData = new Map<string, { name: string; phone: string; orderCount: number; totalSpent: number; lastOrder: string }>();

    filtered.forEach(order => {
      if (!customerData.has(order.phone)) {
        customerData.set(order.phone, {
          name: order.businessName,
          phone: order.phone,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: order.createdAt || order.timestamp
        });
      }
      const customer = customerData.get(order.phone)!;
      customer.orderCount++;
      customer.totalSpent += order.subtotal;
      const orderDate = new Date(order.createdAt || order.timestamp);
      const lastDate = new Date(customer.lastOrder);
      if (orderDate > lastDate) {
        customer.lastOrder = order.createdAt || order.timestamp;
      }
    });

    return Array.from(customerData.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'daily') {
      const data = generateDailyReport();
      csvContent = 'Tarih,Sipariş Sayısı,Toplam Gelir\n';
      data.forEach(row => {
        csvContent += `${row.date},${row.count},${row.total.toFixed(2)}\n`;
      });
      filename = 'gunluk-rapor.csv';
    } else if (reportType === 'product') {
      const data = generateProductReport();
      csvContent = 'Ürün Adı,Adet,Gelir,Sipariş Sayısı\n';
      data.forEach(row => {
        csvContent += `${row.name},${row.quantity},${row.revenue.toFixed(2)},${row.orderCount}\n`;
      });
      filename = 'urun-raporu.csv';
    } else {
      const data = generateCustomerReport();
      csvContent = 'İşletme,Telefon,Sipariş Sayısı,Toplam Harcama,Son Sipariş\n';
      data.forEach(row => {
        csvContent += `${row.name},${row.phone},${row.orderCount},${row.totalSpent.toFixed(2)},${new Date(row.lastOrder).toLocaleDateString('tr-TR')}\n`;
      });
      filename = 'musteri-raporu.csv';
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Raporlar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  };

  const dailyReport = reportType === 'daily' ? generateDailyReport() : [];
  const productReport = reportType === 'product' ? generateProductReport() : [];
  const customerReport = reportType === 'customer' ? generateCustomerReport() : [];

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-500 mt-1">Satış ve müşteri raporlarını görüntüleyin</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="daily">📅 Günlük Satış Raporu</option>
              <option value="product">📦 Ürün Bazlı Rapor</option>
              <option value="customer">👥 Müşteri Bazlı Rapor</option>
            </select>

            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />

            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                📥 Excel
              </button>
              <button
                onClick={printReport}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                🖨️ Yazdır
              </button>
            </div>
          </div>
        </div>

        {/* Report Header for Print */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Kamana Pastanesi</h1>
          <h2 className="text-lg text-center mb-4">
            {reportType === 'daily' && 'Günlük Satış Raporu'}
            {reportType === 'product' && 'Ürün Bazlı Satış Raporu'}
            {reportType === 'customer' && 'Müşteri Bazlı Rapor'}
          </h2>
          <p className="text-center text-sm text-gray-600">
            {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Daily Report */}
        {reportType === 'daily' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Günlük Satış Raporu</h2>
              <p className="text-xs md:text-sm text-gray-600">
                {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sipariş</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dailyReport.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                        Bu tarih aralığında sipariş bulunamadı
                      </td>
                    </tr>
                  ) : (
                    <>
                      {dailyReport.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 text-sm">{row.date}</td>
                          <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">{row.count}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{row.total.toFixed(2)} ₺</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-gray-50 font-bold">
                        <td className="px-4 py-3 text-sm">TOPLAM</td>
                        <td className="px-4 py-3 text-center text-sm">{dailyReport.reduce((sum, r) => sum + r.count, 0)}</td>
                        <td className="px-4 py-3 text-right text-orange-600 text-sm">
                          {dailyReport.reduce((sum, r) => sum + r.total, 0).toFixed(2)} ₺
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Report */}
        {reportType === 'product' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Ürün Bazlı Satış Raporu</h2>
              <p className="text-xs md:text-sm text-gray-600">
                {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Adet</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sipariş</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productReport.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                        Bu tarih aralığında ürün satışı bulunamadı
                      </td>
                    </tr>
                  ) : (
                    <>
                      {productReport.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 text-sm">{row.name}</td>
                          <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">{row.quantity}</td>
                          <td className="px-4 py-3 text-center text-gray-600 text-sm">{row.orderCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{row.revenue.toFixed(2)} ₺</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-gray-50 font-bold">
                        <td className="px-4 py-3 text-sm">TOPLAM</td>
                        <td className="px-4 py-3 text-center text-sm">{productReport.reduce((sum, r) => sum + r.quantity, 0)}</td>
                        <td className="px-4 py-3 text-center text-sm">{productReport.reduce((sum, r) => sum + r.orderCount, 0)}</td>
                        <td className="px-4 py-3 text-right text-orange-600 text-sm">
                          {productReport.reduce((sum, r) => sum + r.revenue, 0).toFixed(2)} ₺
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Report */}
        {reportType === 'customer' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Müşteri Bazlı Rapor</h2>
              <p className="text-xs md:text-sm text-gray-600">
                {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşletme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sipariş</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harcama</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Son Sipariş</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerReport.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                        Bu tarih aralığında müşteri bulunamadı
                      </td>
                    </tr>
                  ) : (
                    <>
                      {customerReport.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 text-sm">{row.name}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{row.phone}</td>
                          <td className="px-4 py-3 text-center font-medium text-gray-900 text-sm">{row.orderCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{row.totalSpent.toFixed(2)} ₺</td>
                          <td className="px-4 py-3 text-center text-gray-600 text-sm">
                            {new Date(row.lastOrder).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-gray-50 font-bold">
                        <td className="px-4 py-3 text-sm" colSpan={2}>TOPLAM</td>
                        <td className="px-4 py-3 text-center text-sm">{customerReport.reduce((sum, r) => sum + r.orderCount, 0)}</td>
                        <td className="px-4 py-3 text-right text-orange-600 text-sm">
                          {customerReport.reduce((sum, r) => sum + r.totalSpent, 0).toFixed(2)} ₺
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 20px; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
    </AdminLayout>
  );
}
