// User types
export interface User {
  userId: string;
  farcasterProfile?: string;
  selectedState: string;
  premiumFeatures: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Legal Guide types
export interface LegalGuide {
  guideId: string;
  state: string;
  language: 'en' | 'es';
  title: string;
  content: string;
  script: string;
  createdAt: Date;
  updatedAt: Date;
}

// Incident Record types
export interface IncidentRecord {
  recordId: string;
  userId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  mediaUrl?: string;
  notes?: string;
  createdAt: Date;
}

// Alert Log types
export interface AlertLog {
  alertId: string;
  userId: string;
  incidentRecordId: string;
  recipient: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed';
  createdAt: Date;
}

// App State types
export interface AppState {
  user: User | null;
  selectedLanguage: 'en' | 'es';
  currentState: string;
  isRecording: boolean;
  premiumUnlocked: boolean;
}

// Component Props types
export interface CalloutCardProps {
  variant?: 'default' | 'alert';
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export interface ScriptButtonProps {
  variant?: 'primary' | 'secondary' | 'languages';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface RecordButtonProps {
  variant?: 'start' | 'stop' | 'recording';
  onClick: () => void;
  isRecording?: boolean;
  className?: string;
}

export interface StateSelectorProps {
  variant?: 'dropdown' | 'modal';
  selectedState: string;
  onStateChange: (state: string) => void;
  className?: string;
}

export interface ContactPickerProps {
  variant?: 'modal';
  onContactsSelected: (contacts: string[]) => void;
  className?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// US States
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
] as const;

export type USState = typeof US_STATES[number];
