import { healthRepository } from '../repositories/health.repository';

export const healthService = {
  async isDatabaseReachable(): Promise<boolean> {
    try {
      await healthRepository.ping();
      return true;
    } catch {
      return false;
    }
  },
};
