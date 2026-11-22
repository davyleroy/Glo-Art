import { env } from '@/lib/env';
import type { StorageProvider } from '../types';
import { LocalStorageProvider } from './local-storage-provider';

export function createStorageProvider(): StorageProvider {
  switch (env.STORAGE_PROVIDER) {
    case 'local':
    default:
      // S3/R2 provider lands in Phase 1.
      return new LocalStorageProvider();
  }
}
