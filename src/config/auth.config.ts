import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    // secret: process.env.TOKEN_SECRET || 'NDgzMDE2MDIzNDQwNjIxNjE4.DmNiFQ.C9hWQsCEJoW5Y9mT5oatUjSLKlw',
    secret: process.env.TOKEN_SECRET,
    expirationTime: parseInt(process.env.TOKEN_EXPIRATION_TIME, 10) || 3600,
  },
}));
