import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrsimaService } from './prisma/prisma.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrsimaService],
})
export class AppModule {}
