import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production', 
    logging: process.env.NODE_ENV !== 'production',
    ssl: {
      rejectUnauthorized: false,
      requestCert: true
    }
  })
); 