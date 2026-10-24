import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:4200', 'https://buqa-terminal.vercel.app'],
  });

  await app.listen(port);
}
await bootstrap();
