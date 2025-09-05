import { User, LegalGuide, IncidentRecord, AlertLog, ApiResponse } from './types';

// Base API configuration
const API_BASE = '/api';

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Auth Services
export const authService = {
  async createOrUpdateUser(farcasterProfile: string, selectedState?: string): Promise<User> {
    const response = await apiRequest<User>('/auth', {
      method: 'POST',
      body: JSON.stringify({ farcasterProfile, selectedState }),
    });
    return response.data;
  },

  async getUser(farcasterProfile: string): Promise<User> {
    const response = await apiRequest<User>(`/auth?farcasterProfile=${encodeURIComponent(farcasterProfile)}`);
    return response.data;
  },
};

// Legal Guide Services
export const legalGuideService = {
  async getGuide(state: string, language: 'en' | 'es'): Promise<LegalGuide> {
    const response = await apiRequest<LegalGuide>(
      `/legal-guides?state=${encodeURIComponent(state)}&language=${language}`
    );
    return response.data;
  },

  async createGuide(guide: Omit<LegalGuide, 'guideId' | 'createdAt' | 'updatedAt'>): Promise<LegalGuide> {
    const response = await apiRequest<LegalGuide>('/legal-guides', {
      method: 'POST',
      body: JSON.stringify(guide),
    });
    return response.data;
  },
};

// Recording Services
export const recordingService = {
  async saveRecording(
    file: File,
    userId: string,
    location: { latitude: number; longitude: number; address?: string },
    notes?: string
  ): Promise<IncidentRecord> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    if (location.address) formData.append('address', location.address);
    if (notes) formData.append('notes', notes);

    const response = await fetch(`${API_BASE}/recordings`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save recording');
    }

    return data.data;
  },

  async getRecordings(userId: string, limit = 10, offset = 0): Promise<IncidentRecord[]> {
    const response = await apiRequest<IncidentRecord[]>(
      `/recordings?userId=${encodeURIComponent(userId)}&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async deleteRecording(recordId: string, userId: string): Promise<void> {
    await apiRequest(`/recordings?recordId=${encodeURIComponent(recordId)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  },
};

// Alert Services
export const alertService = {
  async sendAlert(
    userId: string,
    recipients: string[],
    options: {
      incidentRecordId?: string;
      alertType?: 'emergency' | 'recording' | 'followUp';
      language?: 'en' | 'es';
      location?: string;
      customMessage?: string;
    } = {}
  ): Promise<{ alerts: AlertLog[]; summary: { total: number; successful: number; failed: number } }> {
    const response = await apiRequest<{
      alerts: AlertLog[];
      summary: { total: number; successful: number; failed: number };
    }>('/alerts', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        recipients,
        ...options,
      }),
    });
    return response.data;
  },

  async getAlerts(userId: string, incidentRecordId?: string, limit = 50, offset = 0): Promise<AlertLog[]> {
    let url = `/alerts?userId=${encodeURIComponent(userId)}&limit=${limit}&offset=${offset}`;
    if (incidentRecordId) {
      url += `&incidentRecordId=${encodeURIComponent(incidentRecordId)}`;
    }
    
    const response = await apiRequest<AlertLog[]>(url);
    return response.data;
  },

  async updateAlertStatus(alertId: string, status: 'sent' | 'delivered' | 'failed'): Promise<AlertLog> {
    const response = await apiRequest<AlertLog>('/alerts', {
      method: 'PATCH',
      body: JSON.stringify({ alertId, status }),
    });
    return response.data;
  },
};

// Payment Services
export const paymentService = {
  async purchaseFeature(
    userId: string,
    featureKey: string,
    txHash: string,
    amount: number
  ): Promise<{ user: User; unlockedFeature: any }> {
    const response = await apiRequest<{ user: User; unlockedFeature: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify({ userId, featureKey, txHash, amount }),
    });
    return response.data;
  },

  async getPremiumFeatures(userId: string): Promise<{
    unlocked: Array<{ key: string; name: string; price: number; description: string }>;
    available: Array<{ key: string; name: string; price: number; description: string }>;
  }> {
    const response = await apiRequest<{
      unlocked: Array<{ key: string; name: string; price: number; description: string }>;
      available: Array<{ key: string; name: string; price: number; description: string }>;
    }>(`/payments?userId=${encodeURIComponent(userId)}`);
    return response.data;
  },

  async validateFeatureAccess(userId: string, featureKey: string): Promise<{
    hasAccess: boolean;
    feature: { name: string; price: number; description: string };
  }> {
    const response = await apiRequest<{
      hasAccess: boolean;
      feature: { name: string; price: number; description: string };
    }>('/payments', {
      method: 'PATCH',
      body: JSON.stringify({ userId, featureKey }),
    });
    return response.data;
  },
};

// Local Storage Services
export const storageService = {
  setUser(user: User): void {
    localStorage.setItem('rightguard_user', JSON.stringify(user));
  },

  getUser(): User | null {
    try {
      const stored = localStorage.getItem('rightguard_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clearUser(): void {
    localStorage.removeItem('rightguard_user');
  },

  setSelectedState(state: string): void {
    localStorage.setItem('rightguard_selected_state', state);
  },

  getSelectedState(): string {
    return localStorage.getItem('rightguard_selected_state') || 'California';
  },

  setLanguage(language: 'en' | 'es'): void {
    localStorage.setItem('rightguard_language', language);
  },

  getLanguage(): 'en' | 'es' {
    return (localStorage.getItem('rightguard_language') as 'en' | 'es') || 'en';
  },

  setEmergencyContacts(contacts: string[]): void {
    localStorage.setItem('rightguard_emergency_contacts', JSON.stringify(contacts));
  },

  getEmergencyContacts(): string[] {
    try {
      const stored = localStorage.getItem('rightguard_emergency_contacts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};

// Utility Services
export const utilityService = {
  async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    address?: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            resolve({
              latitude,
              longitude,
              address: data.displayName || `${latitude}, ${longitude}`,
            });
          } catch (error) {
            resolve({ latitude, longitude });
          }
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  },

  detectStateFromLocation(latitude: number, longitude: number): string {
    // Simplified state detection based on coordinates
    // In a real app, you'd use a proper geocoding service
    if (latitude >= 32.5 && latitude <= 42 && longitude >= -124 && longitude <= -114) {
      return 'California';
    }
    if (latitude >= 25.8 && latitude <= 31 && longitude >= -87 && longitude <= -80) {
      return 'Florida';
    }
    if (latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5) {
      return 'Texas';
    }
    if (latitude >= 40.5 && latitude <= 45.0 && longitude >= -79.8 && longitude <= -71.8) {
      return 'New York';
    }
    
    // Default fallback
    return 'California';
  },

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  },

  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateFarcasterUsername(username: string): boolean {
    // Farcaster usernames are alphanumeric and can contain hyphens
    const farcasterRegex = /^[a-zA-Z0-9-]+$/;
    return farcasterRegex.test(username);
  },
};

// Error handling utility
export class RightGuardError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'RightGuardError';
  }
}

// Export all services as a single object for convenience
export const services = {
  auth: authService,
  legalGuide: legalGuideService,
  recording: recordingService,
  alert: alertService,
  payment: paymentService,
  storage: storageService,
  utility: utilityService,
};
