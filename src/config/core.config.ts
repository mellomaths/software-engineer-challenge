import { registerAs } from '@nestjs/config';

export default registerAs('core', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
}));
