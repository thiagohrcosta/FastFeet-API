import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccountController } from './controllers/create-account-controller'

@Module({
  imports: [],
  controllers: [CreateAccountController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
