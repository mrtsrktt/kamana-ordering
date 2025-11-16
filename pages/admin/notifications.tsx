import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationManager } from '../../lib/notifications';

export default function NotificationSettings() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [autoCheck, setAutoCheck] = useState(true);
  const [checkInterval, setCheckInterval] = useState(30); // saniye

  useEffect(() => {
    // Mevcut izin durumunu kontrol et
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // LocalStorage'dan ayarları yükle
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
      setPushEnabled(settings.pushEnabled ?? true);
      setEmailEnabled(settings.emailEnabled ?? true);
      setAutoCheck(settings.autoCheck ?? true);
      setCheckInterval(settings.checkInterval ?? 30);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      soundEnabled,
      pushEnabled,
      emailEnabled,
      autoCheck,
      checkInterval
    };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    alert('Ayarlar kaydedildi!');
  };

  const requestPermission = async () => {
    const granted = await NotificationManager.requestPermission();
    if (granted) {
      setNotificationPermission('granted');
      alert('Bildirim izni verildi!');
    } else {
      alert('Bildirim izni reddedildi');
    }
  };

  const testNotification = () => {
    if (soundEnabled) {
      NotificationManager.playSound();
    }
    if (pushEnabled) {
      NotificationManager.notifyNewOrder('12345', 'Test Cafe', 250.50);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">🔔 Bildirim Ayarları</h1>
              <Link 
                href="/admin/dashboard" 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Geri Dön
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Permission Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📱 Tarayıcı İzinleri</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-800">Bildirim İzni</p>
              <p className="text-sm text-gray-500">
                Yeni siparişler için tarayıcı bildirimi almak için izin gereklidir
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                notificationPermission === 'granted' 
                  ? 'bg-green-100 text-green-800'
                  : notificationPermission === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {notificationPermission === 'granted' ? '✓ İzin Verildi' : 
                 notificationPermission === 'denied' ? '✕ Reddedildi' : '⏳ Bekliyor'}
              </span>
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestPermission}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                >
                  İzin İste
                </button>
              )}
            </div>
          </div>

          {notificationPermission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ⚠️ Bildirim izni reddedildi. Tarayıcı ayarlarından izin vermeniz gerekiyor.
              </p>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ Bildirim Tercihleri</h2>
          
          <div className="space-y-4">
            {/* Sound */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-800">🔊 Ses Bildirimi</p>
                <p className="text-sm text-gray-500">Yeni sipariş geldiğinde ses çal</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Push Notification */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-800">📱 Push Bildirim</p>
                <p className="text-sm text-gray-500">Tarayıcı bildirimi göster</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="sr-only peer"
                  disabled={notificationPermission !== 'granted'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-800">📧 Email Bildirimi</p>
                <p className="text-sm text-gray-500">Sipariş detaylarını email ile gönder</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto Check */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">🔄 Otomatik Kontrol</p>
                <p className="text-sm text-gray-500">Yeni siparişleri otomatik kontrol et</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCheck}
                  onChange={(e) => setAutoCheck(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {autoCheck && (
              <div className="pl-4 py-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontrol Aralığı (saniye)
                </label>
                <input
                  type="number"
                  value={checkInterval}
                  onChange={(e) => setCheckInterval(parseInt(e.target.value))}
                  min="10"
                  max="300"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Önerilen: 30-60 saniye
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test & Save */}
        <div className="flex gap-3">
          <button
            onClick={testNotification}
            className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            🧪 Test Bildirimi Gönder
          </button>
          <button
            onClick={saveSettings}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            💾 Ayarları Kaydet
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ Bilgi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Bildirimler sadece admin paneli açıkken çalışır</li>
            <li>• Tarayıcı kapalıyken bildirim alamazsınız</li>
            <li>• Email bildirimleri her zaman gönderilir</li>
            <li>• Ses ve push bildirimleri tarayıcı ayarlarına bağlıdır</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
