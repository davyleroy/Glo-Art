import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { env } from '@/lib/env';
import type { StorageProvider, StoredObject } from '../types';

/**
 * Local-disk storage provider for dev/tests. Phase 1 adds an S3/MinIO-backed
 * provider; interface stays stable.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local' as const;
  private root = path.resolve(process.cwd(), '.local-storage');

  private bucketDir(bucket: 'public' | 'private'): string {
    return path.join(this.root, bucket);
  }

  async putObject(opts: {
    bucket: 'public' | 'private';
    key: string;
    body: Buffer | Uint8Array | string;
    contentType?: string;
  }): Promise<StoredObject> {
    const dir = path.join(this.bucketDir(opts.bucket), path.dirname(opts.key));
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(this.bucketDir(opts.bucket), opts.key);
    await fs.writeFile(filePath, opts.body);
    const url = `${env.NEXT_PUBLIC_APP_URL}/api/v1/storage/${opts.bucket}/${opts.key}`;
    return { key: opts.key, url, contentType: opts.contentType };
  }

  async getSignedUrl(opts: {
    bucket: 'public' | 'private';
    key: string;
  }): Promise<string> {
    return `${env.NEXT_PUBLIC_APP_URL}/api/v1/storage/${opts.bucket}/${opts.key}`;
  }
}
