import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap function for Election Management Service
 * Configures API versioning, validation pipes and global settings
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // API configuration
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    
    // Global validation
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }));
    
    const port = process.env.PORT || 3004;
    await app.listen(port);
    
    logger.log(`Election Management Service started successfully on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Election Management Service', error.stack);
    process.exit(1);
  }
}

bootstrap();
