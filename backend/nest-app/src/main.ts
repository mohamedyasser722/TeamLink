import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Enable CORS
  app.enableCors({
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    origin: '*', // ⚠️ WARNING: Only for development!
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Configure body parser limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('TeamLink API')
    .setDescription('The TeamLink API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('skills', 'Skills management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Get port from environment variables or use default
  const port = configService.get('PORT', 3000);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
