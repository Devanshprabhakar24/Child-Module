import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Required for RazorPay webhook signature verification
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure CORS - Allow Vercel frontend
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://child-module.vercel.app',
  ];

  // Add APP_BASE_URL from environment
  if (process.env['APP_BASE_URL']) {
    allowedOrigins.push(process.env['APP_BASE_URL']);
  }

  console.log('🔐 CORS allowed origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        console.log('✅ CORS: Allowing request with no origin');
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS: Allowing origin:', origin);
        return callback(null, true);
      }
      
      // Allow all Vercel preview deployments (*.vercel.app)
      if (origin.endsWith('.vercel.app')) {
        console.log('✅ CORS: Allowing Vercel preview origin:', origin);
        return callback(null, true);
      }
      
      console.log('❌ CORS: Blocking origin:', origin);
      console.log('   Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env['PORT'] ?? 8000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

void bootstrap();
