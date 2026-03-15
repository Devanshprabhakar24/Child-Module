import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for RazorPay webhook signature verification
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env['PORT'] ?? 8000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

void bootstrap();
