// Función temporal para debuggear requests
export const debugRequest = (url, data) => {
  console.log('🚀 REQUEST DEBUG:');
  console.log('URL:', url);
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Data types:', Object.keys(data).map(key => `${key}: ${typeof data[key]}`));
  return data;
};