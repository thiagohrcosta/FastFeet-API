import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccountController } from './controllers/create-account-controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
      envFilePath: '.env',
    }),
    AuthModule,
  ],
  controllers: [CreateAccountController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
