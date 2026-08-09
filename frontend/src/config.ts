import { Capacitor } from '@capacitor/core';

let BASE_URL = 'http://localhost:3000/api';

if (Capacitor.isNativePlatform()) {
  BASE_URL = 'http://10.167.150.95:3000/api';
}

export const API_BASE_URL = BASE_URL;
