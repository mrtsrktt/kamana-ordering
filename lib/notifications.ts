// Bildirim yönetimi için utility fonksiyonlar

export class NotificationManager {
  private static audio: HTMLAudioElement | null = null;

  // Tarayıcı bildirim izni iste
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Bu tarayıcı bildirimleri desteklemiyor');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Push notification göster
  static async showNotification(title: string, options?: NotificationOptions) {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  // Ses çal
  static playSound() {
    try {
      if (!this.audio) {
        // Basit bir beep sesi oluştur (Web Audio API)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.error('Ses çalınamadı:', error);
    }
  }

  // Yeni sipariş bildirimi
  static notifyNewOrder(orderNumber: string, businessName: string, amount: number) {
    // Ses çal
    this.playSound();

    // Push notification
    this.showNotification('🎉 Yeni Sipariş!', {
      body: `${businessName}\nSipariş No: #${orderNumber}\nTutar: ${amount.toFixed(2)} TL`,
      tag: `order-${orderNumber}`,
      requireInteraction: true,
      // vibrate: [200, 100, 200]

    });
  }
}
