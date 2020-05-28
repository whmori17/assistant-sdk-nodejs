import { resolve } from 'path';
import { config } from 'dotenv';

export const Environment = config({ path: resolve(__dirname, '../../../.env') });
