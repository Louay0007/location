import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:4200', process.env.FRONTEND_URL as string],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Car Rental API')
    .setDescription('API plateforme location de voitures')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification')
    .addTag('Vehicles', 'Vehicules')
    .addTag('Bookings', 'Reservations')
    .addTag('Users', 'Utilisateurs')
    .addTag('Payments', 'Paiements')
    .addTag('Pricing', 'Tarification')
    .addTag('Maintenance', 'Maintenance')
    .addTag('Dashboard', 'Statistiques')
    .addTag('Notifications', 'Notifications')
    .addTag('Upload', 'Telechargements')
    .addTag('PDF', 'Generateur PDF')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application sur http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();