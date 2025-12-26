import AsyncStorage from '@react-native-async-storage/async-storage';

const log = (action: string, key: string, payload?: unknown) => {
  console.log(
    `🧠 [AsyncStorage] ${action}`,
    `\n🔑 Key: ${key}`,
    payload !== undefined ? `\n📦 Data:` : '',
    payload ?? ''
  );
};

export const storage = {
  async set<T>(key: string, value: T): Promise<void> {
    try {
      log('SET →', key, value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`❌ [AsyncStorage SET ERROR] (${key})`, error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      const parsed = value ? (JSON.parse(value) as T) : null;

      log('GET ←', key, parsed);
      return parsed;
    } catch (error) {
      console.error(`❌ [AsyncStorage GET ERROR] (${key})`, error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      log('REMOVE ✖', key);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ [AsyncStorage REMOVE ERROR] (${key})`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      console.log('🧹 [AsyncStorage] CLEAR ALL');
      await AsyncStorage.clear();
    } catch (error) {
      console.error('❌ [AsyncStorage CLEAR ERROR]', error);
    }
  },
};
