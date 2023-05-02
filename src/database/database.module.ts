import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as ormTestConfig from '../../ormconfig.test.json';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isTesting = process.env.NODE_ENV === 'test';
        const typeOrmConfig = isTesting
          ? ormTestConfig
          : {
              type: 'postgres',
              host: configService.get('POSTGRES_HOST'),
              port: configService.get('POSTGRES_PORT'),
              username: configService.get('POSTGRES_USER'),
              password: configService.get('POSTGRES_PASSWORD'),
              database: configService.get('POSTGRES_DB'),
              entities: [__dirname + '/../**/*.entity{.ts,.js}'],
              synchronize: true,
            };

        return typeOrmConfig as TypeOrmModuleOptions;
      },
    }),
  ],
})
export class DatabaseModule {}
