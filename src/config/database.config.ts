import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  connection: (process.env.TYPEORM_CONNECTION as any) || 'postgres',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
  username: process.env.TYPEORM_USERNAME || 'postgres',
  password: process.env.TYPEORM_PASSWORD || 'password',
  database: process.env.TYPEORM_DATABASE || 'users_ms',
}));
