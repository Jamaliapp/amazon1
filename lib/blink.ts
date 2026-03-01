import { createClient, AsyncStorageAdapter } from '@blinkdotnew/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

const projectId = process.env.EXPO_PUBLIC_BLINK_PROJECT_ID || 'butterfly-wallpaper-app-bmezeuo6';
const publishableKey = process.env.EXPO_PUBLIC_BLINK_PUBLISHABLE_KEY || '';

export const blink = createClient({
  projectId,
  publishableKey,
  auth: {
    mode: 'headless',
    webBrowser: WebBrowser,
  },
  storage: new AsyncStorageAdapter(AsyncStorage),
});
