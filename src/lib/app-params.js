// Standalone app params — no base44 dependency
// Override these values via environment variables if needed (VITE_APP_ID, etc.)

export const appParams = {
  appId: import.meta.env.VITE_APP_ID || 'local',
  token: null,
  fromUrl: typeof window !== 'undefined' ? window.location.href : '/',
  functionsVersion: import.meta.env.VITE_FUNCTIONS_VERSION || 'prod',
  appBaseUrl: import.meta.env.VITE_APP_BASE_URL || '',
};
