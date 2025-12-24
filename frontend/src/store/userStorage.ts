import { UserType } from '@/src/types/userType';
import { storage } from './asyncStorage';
import { STORAGE_KEYS } from './keys';



export const userStorage = {
  async saveUser(user: UserType) {
    await storage.set(STORAGE_KEYS.USER, user);
  },

  async getUser(): Promise<UserType | null> {
    return await storage.get<UserType>(STORAGE_KEYS.USER);
  },

  async clearUser() {
    await storage.remove(STORAGE_KEYS.USER);
  },
  
};
