import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccountController } from './controllers/create-account-controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'

@Module({
  imports: [
    ConfigModule.forRoot({
    validate: env => envSchema.parse(env),
    isGlobal: true,
})],
  controllers: [CreateAccountController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
