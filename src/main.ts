import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');

  const config = new DocumentBuilder()
    .setTitle('Nest Chat API')
    .setDescription('Chat API built with NestJS')
    .setVersion('1.0')
    .addTag('chatApi', 'documentation for chat api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
