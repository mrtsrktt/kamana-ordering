import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface SiteSettings {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  district: string;
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  deliveryInfo: string;
  minOrderAmount: number;
  deliveryFee: number;
  taxRate: number;
}

const defaultSettings: SiteSettings = {
  businessName: 'Kamana Pastanesi',
  phone: '0533-197-9632',
  whatsapp: '905331979632',
  email: 'info@kamana.com',
  address: 'Örnek Mahallesi, Pastane Sokak No:1',
  city: 'İstanbul',
  district: 'Anadolu Yakası',
  workingHours: {
    monday: { open: '08:00', close: '20:00', closed: false },
    tuesday: { open: '08:00', close: '20:00', closed: false },
    wednesday: { open: '08:00', close: '20:00', closed: false },
    thursday: { open: '08:00', close: '20:00', closed: false },
    friday: { open: '08:00', close: '20:00', closed: false },
    saturday: { open: '09:00', close: '21:00', closed: false },
    sunday: { open: '09:00', close: '21:00', closed: false }
  },
  deliveryInfo: 'Teslimat: İstanbul Anadolu Yakası',
  minOrderAmount: 0,
  deliveryFee: 0,
  taxRate: 20
};

const dayNames: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar'
};

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'delivery'>('general');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateWorkingHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        [day]: {
          ...settings.workingHours[day as keyof typeof settings.workingHours],
          [field]: value
        }
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
            <p className="text-gray-500 mt-1">İşletme bilgilerini yönetin</p>
          </div>
          {saved && (
            <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium animate-pulse">
              ✓ Kaydedildi
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'general'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Genel
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'hours'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🕐 Saatler
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 px-4 py-3 font-medium transition-colors text-sm ${
                activeTab === 'delivery'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🚚 Teslimat
            </button>
          </div>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">İşletme Bilgileri</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İşletme Adı</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="0533-197-9632"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="905331979632"
                />
                <p className="text-xs text-gray-500 mt-1">Ülke kodu ile birlikte (90...)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="info@kamana.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({...settings, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="İstanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bölge</label>
                <input
                  type="text"
                  value={settings.district}
                  onChange={(e) => setSettings({...settings, district: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Anadolu Yakası"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                  rows={3}
                  placeholder="Tam adres..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Working Hours */}
        {activeTab === 'hours' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Çalışma Saatleri</h2>
            
            <div className="space-y-3">
              {Object.entries(settings.workingHours).map(([day, hours]) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <span className="font-medium text-gray-900 text-sm">{dayNames[day]}</span>
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => updateWorkingHours(day, 'closed', e.target.checked)}
                      className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">Kapalı</span>
                  </label>

                  {!hours.closed && (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Açılış:</label>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateWorkingHours(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Kapanış:</label>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateWorkingHours(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Bu saatler müşterilere gösterilecek bilgilendirme amaçlıdır.
              </p>
            </div>
          </div>
        )}

        {/* Delivery & Pricing */}
        {activeTab === 'delivery' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Teslimat & Fiyatlandırma</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teslimat Bilgisi</label>
                <input
                  type="text"
                  value={settings.deliveryInfo}
                  onChange={(e) => setSettings({...settings, deliveryInfo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Teslimat: İstanbul Anadolu Yakası"
                />
                <p className="text-xs text-gray-500 mt-1">Ana sayfada gösterilecek teslimat bilgisi</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min. Sipariş (₺)</label>
                  <input
                    type="number"
                    value={settings.minOrderAmount}
                    onChange={(e) => setSettings({...settings, minOrderAmount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = Minimum yok</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teslimat Ücreti (₺)</label>
                  <input
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings({...settings, deliveryFee: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = Ücretsiz</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KDV Oranı (%)</label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="20"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Varsayılan: 20%</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h3 className="font-bold text-yellow-900 mb-2 text-sm">⚠️ Önemli Notlar</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Fiyatlar şu anda KDV dahil değildir (bilgi amaçlı)</li>
                  <li>• Teslimat ücreti ve minimum tutar otomatik hesaplanmıyor</li>
                  <li>• Bu ayarlar bilgilendirme amaçlıdır</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={saveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm"
          >
            💾 Ayarları Kaydet
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
