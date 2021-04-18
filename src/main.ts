import { NestFactory } from '@nestjs/core';

import * as helmet from "helmet";

import { AppModule } from './app.module';
import { logger } from './middlewares/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(logger);

  await app.listen(3000);
}
bootstrap();
