// Kullanıcı yönetimi ve yetkilendirme

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'superadmin' | 'admin';
  name: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginLog {
  username: string;
  timestamp: string;
  success: boolean;
  ip?: string;
}

// Kullanıcılar (gerçek uygulamada veritabanında olmalı)
const users: User[] = [
  {
    id: '1',
    username: 'developer',
    password: 'dev2024!', // Gerçek uygulamada hash'lenmiş olmalı
    role: 'superadmin',
    name: 'Developer',
    email: 'developer@kamana.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'kamana',
    password: 'kamana2024',
    role: 'admin',
    name: 'Kamana Yönetici',
    email: 'admin@kamana.com',
    createdAt: new Date().toISOString()
  }
];

// Yetki kontrolleri
export const permissions = {
  superadmin: {
    canViewDashboard: true,
    canViewOrders: true,
    canEditOrders: true,
    canDeleteOrders: true,
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewCustomers: true,
    canViewReports: true,
    canViewSettings: true,
    canEditSettings: true,
    canManageUsers: true,
    canViewLogs: true
  },
  admin: {
    canViewDashboard: true,
    canViewOrders: true,
    canEditOrders: true,
    canDeleteOrders: false, // Kamana sipariş silemez
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewCustomers: true,
    canViewReports: true,
    canViewSettings: true,
    canEditSettings: true,
    canManageUsers: false,
    canViewLogs: false
  }
};

export class AuthManager {
  // Giriş yap
  static login(username: string, password: string): { success: boolean; user?: User; message?: string } {
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Son giriş zamanını güncelle
      user.lastLogin = new Date().toISOString();
      
      // Session'a kaydet
      if (typeof window !== 'undefined') {
        const sessionData = {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('adminUser', JSON.stringify(sessionData));
        
        // Login log kaydet
        this.addLoginLog(username, true);
      }
      
      return { success: true, user };
    }
    
    // Başarısız giriş logu
    if (typeof window !== 'undefined') {
      this.addLoginLog(username, false);
    }
    
    return { success: false, message: 'Kullanıcı adı veya şifre hatalı' };
  }

  // Çıkış yap
  static logout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminUser');
    }
  }

  // Oturum kontrolü
  static getSession(): { id: string; username: string; role: 'superadmin' | 'admin'; name: string } | null {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('adminUser');
      if (session) {
        return JSON.parse(session);
      }
    }
    return null;
  }

  // Yetki kontrolü
  static hasPermission(permission: keyof typeof permissions.superadmin): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    return permissions[session.role][permission];
  }

  // Kullanıcı bilgisi al
  static getUser(username: string): User | undefined {
    return users.find(u => u.username === username);
  }

  // Şifre değiştir
  static changePassword(username: string, oldPassword: string, newPassword: string): { success: boolean; message: string } {
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return { success: false, message: 'Kullanıcı bulunamadı' };
    }
    
    if (user.password !== oldPassword) {
      return { success: false, message: 'Mevcut şifre hatalı' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, message: 'Yeni şifre en az 6 karakter olmalıdır' };
    }
    
    user.password = newPassword;
    return { success: true, message: 'Şifre başarıyla değiştirildi' };
  }

  // Login logları
  static addLoginLog(username: string, success: boolean) {
    const logs = this.getLoginLogs();
    logs.unshift({
      username,
      timestamp: new Date().toISOString(),
      success
    });
    
    // Son 50 logu tut
    const trimmedLogs = logs.slice(0, 50);
    localStorage.setItem('loginLogs', JSON.stringify(trimmedLogs));
  }

  static getLoginLogs(): LoginLog[] {
    if (typeof window !== 'undefined') {
      const logs = localStorage.getItem('loginLogs');
      return logs ? JSON.parse(logs) : [];
    }
    return [];
  }

  // Tüm kullanıcıları listele (sadece superadmin)
  static getAllUsers(): User[] {
    const session = this.getSession();
    if (session?.role === 'superadmin') {
      return users.map(u => ({ ...u, password: '***' })); // Şifreleri gizle
    }
    return [];
  }
}
