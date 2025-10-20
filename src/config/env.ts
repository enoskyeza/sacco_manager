/**
 * Environment configuration
 * Validates that required environment variables are present
 */

// Validate API URL is set
const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    throw new Error(
      '❌ VITE_API_URL is not defined!\n\n' +
      'Please create a .env file in the root directory with:\n' +
      'VITE_API_URL=http://localhost:8000/api\n\n' +
      'For production, set this in your Netlify environment variables.'
    );
  }
  
  return apiUrl;
};

// Export validated configuration
export const ENV = {
  API_URL: getApiUrl(),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Log configuration in development
if (ENV.IS_DEV) {
  console.log('🔧 Environment Config:', {
    API_URL: ENV.API_URL,
    MODE: import.meta.env.MODE,
  });
}
