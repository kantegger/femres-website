import { existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

export function loadLocalEnv() {
  for (const filename of ['.env.local', '.env']) {
    const path = join(process.cwd(), filename);
    if (existsSync(path)) {
      config({ path });
    }
  }
}
