import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  connectionString: process.env.DATABASE_URL,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  bucket: process.env.DATABASE_NAME,
  type: process.env.DATABASE_TYPE,
}));
