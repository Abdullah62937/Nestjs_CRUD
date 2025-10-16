import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from './employee/employee.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'tramway.proxy.rlwy.net',
  port: 10414,
  username: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'railway',
  autoLoadEntities: true,
  synchronize: true,
  ssl: { rejectUnauthorized: false },
}),

    UserModule,
    EmployeeModule,
    ],
  controllers: [AppController,],
  providers: [AppService],
})
export class AppModule {}
