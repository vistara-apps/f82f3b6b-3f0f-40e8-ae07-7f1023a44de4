export const APP_CONFIG = {
  name: 'Right Guard',
  tagline: 'Know Your Rights. Instantly.',
  version: '1.0.0',
  supportEmail: 'support@rightguard.app',
} as const;

export const PRICING = {
  stateSpecificScripts: 0.99,
  enhancedRecording: 1.99,
  unlimitedBilingual: 4.99,
} as const;

export const LANGUAGES = {
  en: 'English',
  es: 'Español',
} as const;

export const RECORDING_CONFIG = {
  maxDuration: 300000, // 5 minutes in milliseconds
  audioFormat: 'audio/webm',
  videoFormat: 'video/webm',
} as const;

export const ALERT_TEMPLATES = {
  en: {
    emergency: "🚨 EMERGENCY ALERT: I'm currently in a situation that requires documentation. My location: {location}. Time: {time}. Please check on me.",
    recording: "📹 I'm currently recording an interaction with law enforcement at {location}. Time: {time}. This is for documentation purposes.",
    followUp: "✅ Situation resolved. Thank you for your concern. Recorded evidence available if needed.",
  },
  es: {
    emergency: "🚨 ALERTA DE EMERGENCIA: Actualmente estoy en una situación que requiere documentación. Mi ubicación: {location}. Hora: {time}. Por favor verifiquen mi estado.",
    recording: "📹 Actualmente estoy grabando una interacción con las fuerzas del orden en {location}. Hora: {time}. Esto es para fines de documentación.",
    followUp: "✅ Situación resuelta. Gracias por su preocupación. Evidencia grabada disponible si es necesaria.",
  },
} as const;

export const BASIC_RIGHTS = {
  en: {
    title: "Your Basic Rights",
    rights: [
      "You have the right to remain silent",
      "You have the right to refuse searches",
      "You have the right to leave if not detained",
      "You have the right to record in public",
      "You have the right to an attorney",
    ],
    scripts: {
      silence: "I am exercising my right to remain silent. I want to speak to a lawyer.",
      search: "I do not consent to any searches. I am exercising my constitutional rights.",
      detention: "Am I free to leave? I would like to leave if I'm not being detained.",
      recording: "I am recording this interaction for my safety and legal protection.",
    },
  },
  es: {
    title: "Sus Derechos Básicos",
    rights: [
      "Tiene derecho a permanecer en silencio",
      "Tiene derecho a rechazar registros",
      "Tiene derecho a irse si no está detenido",
      "Tiene derecho a grabar en público",
      "Tiene derecho a un abogado",
    ],
    scripts: {
      silence: "Estoy ejerciendo mi derecho a permanecer en silencio. Quiero hablar con un abogado.",
      search: "No consiento ningún registro. Estoy ejerciendo mis derechos constitucionales.",
      detention: "¿Soy libre de irme? Me gustaría irme si no estoy siendo detenido.",
      recording: "Estoy grabando esta interacción para mi seguridad y protección legal.",
    },
  },
} as const;

export const PREMIUM_FEATURES = {
  stateSpecific: {
    name: 'State-Specific Scripts',
    price: PRICING.stateSpecificScripts,
    description: 'Advanced scripts tailored to your state\'s specific laws',
  },
  enhancedRecording: {
    name: 'Enhanced Recording',
    price: PRICING.enhancedRecording,
    description: 'Cloud storage, automatic backup, and extended recording time',
  },
  unlimitedBilingual: {
    name: 'Unlimited Bilingual Access',
    price: PRICING.unlimitedBilingual,
    description: 'Full access to all content in English and Spanish',
  },
} as const;

export const SUPABASE_TABLES = {
  users: 'users',
  legalGuides: 'legal_guides',
  incidentRecords: 'incident_records',
  alertLogs: 'alert_logs',
} as const;

export const LOCAL_STORAGE_KEYS = {
  user: 'rightguard_user',
  selectedState: 'rightguard_selected_state',
  language: 'rightguard_language',
  emergencyContacts: 'rightguard_emergency_contacts',
} as const;
